import { UPLOAD_FINALIZE_NUDGE_AFTER_MS, UPLOAD_FINALIZE_POLL_MAX_MS, UPLOAD_FINALIZE_POLL_MIN_MS } from "@/constants/constants";
import { UploadSession } from "@/models/Events";
import {
  buildFingerprint,
  calculateRetryDelay,
  classifyUploadError,
  computeChunkChecksum,
  createClientKey,
  FileFingerprint,
  fingerprintsMatch,
  hasRetriesLeft,
  toPercent,
} from "@/utils/upload";

import { abortableSleep, browserNetwork } from "./environment";
import {
  failureCodeFor,
  KEEP_STORED_FAILURES,
  NOTICES,
  RetriesExhausted,
  RunAborted,
  SESSION_UNUSABLE,
  SessionFailed,
  toErrorInfo,
  toFailure,
} from "./failures";
import { StoredUpload, UploadStorage } from "./storage";
import { UploadApi, UploadApiError } from "./transport";
import { UploadEvent, UploadNetwork, UploadSnapshot } from "./types";

const CANCEL_ATTEMPTS = 3;
const CANCEL_RETRY_MS = 1000;
const PAUSED_POLL_MS = 60_000;
// Upload progress events can arrive dozens of times a second; the screen does not need more than a few.
const PROGRESS_INTERVAL_MS = 150;
const PROGRESS_CAP_PERCENT = 99;

export const IDLE_SNAPSHOT: UploadSnapshot = {
  phase: "idle",
  confirmedBytes: 0,
  totalBytes: 0,
  sentBytes: 0,
  percent: 0,
  videoAssetId: null,
  sessionId: null,
  failure: null,
  notice: null,
  resumed: false,
  stalled: false,
};

export type StartOptions = { sessionId?: string };

export type UploadManagerDeps = {
  api: UploadApi;
  storage: UploadStorage;
  onChange: (snapshot: UploadSnapshot) => void;
  onEvent?: (event: UploadEvent) => void;
  network?: UploadNetwork;
  checksum?: (chunk: Blob) => Promise<string | undefined>;
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
  random?: () => number;
  now?: () => number;
};

/**
 * Drives one resumable upload: creates or re-attaches to a server session, sends sequential chunks from the
 * server-confirmed offset, recovers from interruptions and waits for server-side finalization.
 *
 * Framework free on purpose. The server is the source of truth: after any failed or aborted chunk the next step asks
 * the server where it stands instead of assuming, so a chunk is never skipped and committed bytes are never resent.
 */
export class UploadManager {
  private readonly deps: UploadManagerDeps;
  private snapshot: UploadSnapshot = IDLE_SNAPSHOT;
  private file: File | null = null;
  private fingerprint: FileFingerprint | null = null;
  private sessionId: string | null = null;
  private runAbort: AbortController | null = null;
  private chunkAbort: AbortController | null = null;
  private loopActive = false;
  private transferring = false;
  private paused = false;
  private disposed = false;
  private failuresInRow = 0;
  private startedAt = 0;
  private lastProgressAt = 0;
  private readonly wakeups = new Set<() => void>();

  constructor(deps: UploadManagerDeps) {
    this.deps = deps;
  }

  getSnapshot() {
    return this.snapshot;
  }

  /** The upload left behind by an earlier page load, if any. */
  peekStored(): StoredUpload | null {
    return this.deps.storage.load();
  }

  /**
   * Begins uploading `file`, continuing the stored session when it is the same file. Replaces a running upload.
   * With `options.sessionId` the upload attaches to that existing server session (an unfinished upload picked from
   * the list) instead of the stored one, and never creates a new session.
   */
  start(file: File, options: StartOptions = {}): Promise<void> {
    this.abortRun();
    this.file = file;
    this.fingerprint = buildFingerprint(file);
    this.paused = false;
    this.failuresInRow = 0;
    this.startedAt = this.now();
    const controller = new AbortController();
    this.runAbort = controller;
    this.setSnapshot({ ...IDLE_SNAPSHOT, phase: "creating", totalBytes: file.size });
    return this.execute(file, controller, options.sessionId);
  }

  pause() {
    const { phase } = this.snapshot;
    if (!this.transferring || this.paused || (phase !== "uploading" && phase !== "interrupted")) return;
    this.paused = true;
    this.chunkAbort?.abort();
    this.wakeAll();
    this.emit({ type: "paused" });
  }

  /** Continues a paused upload, retries immediately while waiting to retry, or restarts a stalled one. */
  resume(): Promise<void> | void {
    if (this.paused) {
      this.paused = false;
      this.wakeAll();
      this.emit({ type: "continued" });
      return undefined;
    }
    if (this.loopActive && this.snapshot.phase === "interrupted") {
      this.wakeAll();
      return undefined;
    }
    const { phase, failure: current } = this.snapshot;
    const canRestart = this.snapshot.stalled || (phase === "failed" && current?.retryable);
    if (!canRestart || !this.file) return undefined;
    this.emit({ type: "continued" });
    return this.start(this.file);
  }

  async cancel() {
    const { phase, failure: current } = this.snapshot;
    // A session that is finalizing or closed by the server cannot be cancelled, so asking would only 409. A completed
    // one can: the server then deletes the unused video, which would otherwise stay in storage.
    const serverCancellable = phase !== "finalizing" && !(phase === "failed" && !current?.retryable);
    const sessionId = serverCancellable ? (this.sessionId ?? this.deps.storage.load()?.sessionId ?? null) : null;
    this.abortRun();
    this.deps.storage.clear();
    this.sessionId = null;
    this.setSnapshot({ ...IDLE_SNAPSHOT, phase: "cancelled", totalBytes: this.snapshot.totalBytes });
    this.emit({ type: "cancelled" });
    if (sessionId) await this.cancelOnServer(sessionId);
  }

  /** Forgets a stored upload from an earlier page load and frees its server-side partial file. */
  async discardStored() {
    const stored = this.deps.storage.load();
    this.deps.storage.clear();
    if (stored) await this.cancelOnServer(stored.sessionId);
  }

  /** The caller's unfinished uploads on the server, newest first. */
  listUnfinished(signal?: AbortSignal): Promise<UploadSession[]> {
    return this.deps.api.listSessions(signal);
  }

  /**
   * Deletes one unfinished upload on the server. If it is the stored or the running one, that reference is dropped
   * too. Resolves `false` when the server could not be reached, so the caller can keep the entry on screen.
   */
  async discardSession(sessionId: string): Promise<boolean> {
    const removed = await this.cancelOnServer(sessionId);
    if (!removed) return false;
    if (this.deps.storage.load()?.sessionId === sessionId) this.deps.storage.clear();
    if (this.sessionId === sessionId) {
      this.abortRun();
      this.sessionId = null;
      this.setSnapshot({ ...IDLE_SNAPSHOT, phase: "cancelled", totalBytes: this.snapshot.totalBytes });
    }
    return true;
  }

  /** Stops all work without touching the server, so the session stays resumable (unmount, navigation, reload). */
  dispose() {
    this.disposed = true;
    this.abortRun();
  }

  private get network() {
    return this.deps.network ?? browserNetwork;
  }

  private now() {
    return (this.deps.now ?? Date.now)();
  }

  private setSnapshot(next: Partial<UploadSnapshot>) {
    this.snapshot = { ...this.snapshot, ...next };
    if (!this.disposed) this.deps.onChange(this.snapshot);
  }

  private emit(event: UploadEvent) {
    if (!this.disposed) this.deps.onEvent?.(event);
  }

  private abortRun() {
    this.runAbort?.abort();
    this.runAbort = null;
    this.chunkAbort?.abort();
    this.wakeAll();
  }

  private wakeAll() {
    [...this.wakeups].forEach((wake) => wake());
  }

  private ensureActive(signal: AbortSignal) {
    if (signal.aborted) throw new RunAborted();
  }

  // Sleeps that pause, resume, retry-now and abort can all cut short.
  private interruptible(signal: AbortSignal, run: (local: AbortSignal) => Promise<void>) {
    const local = new AbortController();
    const stop = () => local.abort();
    this.wakeups.add(stop);
    signal.addEventListener("abort", stop, { once: true });
    return run(local.signal).finally(() => {
      this.wakeups.delete(stop);
      signal.removeEventListener("abort", stop);
    });
  }

  private sleep(ms: number, signal: AbortSignal) {
    return this.interruptible(signal, (local) => (this.deps.sleep ?? abortableSleep)(ms, local));
  }

  private async execute(file: File, controller: AbortController, resumeSessionId?: string) {
    const { signal } = controller;
    this.loopActive = true;
    try {
      let current = await this.openSession(file, signal, resumeSessionId);
      for (;;) {
        this.ensureActive(signal);
        if (current.upload_status === "COMPLETED") return this.complete(current);
        if (current.upload_status === "FINALIZING") current = await this.awaitFinalization(current, signal);
        else if (current.upload_status === "UPLOADING") current = await this.transfer(current, file, signal);
        else throw new SessionFailed(current.error_code);
      }
    } catch (error) {
      this.handleFailure(error, controller);
    } finally {
      if (this.runAbort === controller) this.loopActive = false;
    }
    return undefined;
  }

  private async openSession(file: File, signal: AbortSignal, resumeSessionId?: string): Promise<UploadSession> {
    const fingerprint = this.fingerprint as FileFingerprint;
    const stored = this.deps.storage.load();

    if (resumeSessionId) return this.adopt(await this.attachTo(resumeSessionId, file, signal), file);

    // A stored session for a different file is left alone: it stays in the user's list of unfinished uploads, where
    // it can be continued or deleted on purpose, instead of being destroyed by starting something else.
    if (stored && fingerprintsMatch(stored.fingerprint, fingerprint)) {
      const existing = await this.reattach(stored, file, signal);
      if (existing) return this.adopt(existing, file);
    }
    this.deps.storage.clear();

    const clientKey = createClientKey();
    const created = await this.withRetry(
      () => this.deps.api.createSession({ filename: file.name, file_size: file.size, client_key: clientKey }, signal),
      signal
    );
    this.sessionId = created.id;
    this.setSnapshot({ sessionId: created.id });
    this.commit(created.offset);
    this.emit({ type: "started", resumed: false, sizeBytes: file.size });
    return created;
  }

  // Continues a session the server already holds, from the offset the server reports.
  private adopt(existing: UploadSession, file: File): UploadSession {
    this.sessionId = existing.id;
    this.setSnapshot({ resumed: true, totalBytes: file.size, sessionId: existing.id });
    this.commit(existing.offset);
    this.emit({ type: "started", resumed: true, sizeBytes: file.size });
    return existing;
  }

  // The session chosen from the unfinished-uploads list. A session that is gone surfaces as an expired failure; one
  // that cannot take this file is a failure too, because creating a replacement would leave a duplicate behind.
  private async attachTo(sessionId: string, file: File, signal: AbortSignal): Promise<UploadSession> {
    const session = await this.withRetry(() => this.deps.api.getSession(sessionId, signal), signal);
    const isUsable = session.upload_status === "UPLOADING" || session.upload_status === "FINALIZING";
    if (!isUsable || session.file_size !== file.size) throw new SessionFailed(SESSION_UNUSABLE);
    return session;
  }

  // Resumes a stored session only when the server still knows it and it describes the same file. A session that
  // finished while the page was reloading is picked up as it is: the video is already on the server, so uploading
  // it again would only leave the first copy unused.
  private async reattach(stored: StoredUpload, file: File, signal: AbortSignal): Promise<UploadSession | null> {
    try {
      const session = await this.withRetry(() => this.deps.api.getSession(stored.sessionId, signal), signal);
      const isInProgress = session.upload_status === "UPLOADING" || session.upload_status === "FINALIZING";
      const isFinishedWithVideo = session.upload_status === "COMPLETED" && session.video_asset_id !== null;
      return (isInProgress || isFinishedWithVideo) && session.file_size === file.size ? session : null;
    } catch (error) {
      if (error instanceof RunAborted || error instanceof RetriesExhausted) throw error;
      if (classifyUploadError(toErrorInfo(error)).kind === "gone") return null;
      throw error;
    }
  }

  // Sends chunks from the confirmed offset until the server reports the file complete. Returns the session as the
  // server last described it.
  private async transfer(session: UploadSession, file: File, signal: AbortSignal): Promise<UploadSession> {
    this.transferring = true;
    this.setSnapshot({ phase: "uploading", notice: null, stalled: false });
    try {
      return await this.transferChunks(session, file, signal);
    } finally {
      this.transferring = false;
    }
  }

  private async transferChunks(session: UploadSession, file: File, signal: AbortSignal): Promise<UploadSession> {
    let current = session;
    let reconcile = false;

    while (current.upload_status === "UPLOADING" && current.offset < file.size) {
      await this.holdWhilePaused(signal);
      this.ensureActive(signal);
      reconcile = reconcile || this.snapshot.phase === "paused";
      this.setSnapshot({ phase: "uploading", notice: null });

      try {
        if (reconcile) {
          current = await this.deps.api.getSession(session.id, signal);
          reconcile = false;
        } else {
          current = await this.sendChunk(current, file, signal);
          // Only a committed chunk counts as recovery: a status query can succeed while every chunk still fails.
          this.markRecovered();
        }
        this.commit(current.offset);
      } catch (error) {
        this.ensureActive(signal);
        reconcile = true;
        const outcome = classifyUploadError(toErrorInfo(error));
        if (error instanceof UploadApiError && error.kind === "aborted") continue;
        const hint = error instanceof UploadApiError ? error.offset : undefined;
        if (outcome.kind === "reconcile" && hint !== undefined && hint < file.size) {
          current = { ...current, offset: hint };
          this.commit(hint);
          reconcile = false;
        } else if (outcome.kind === "transient") {
          await this.backoff(error, signal);
        } else if (outcome.kind !== "reconcile") {
          throw error;
        }
      }
    }
    return current;
  }

  private async sendChunk(session: UploadSession, file: File, signal: AbortSignal): Promise<UploadSession> {
    const end = Math.min(session.offset + Math.max(1, session.chunk_size), file.size);
    const chunk = file.slice(session.offset, end);
    const checksum = await (this.deps.checksum ?? computeChunkChecksum)(chunk);
    const controller = new AbortController();
    const forward = () => controller.abort();
    signal.addEventListener("abort", forward, { once: true });
    this.chunkAbort = controller;
    try {
      return await this.deps.api.sendChunk(session.id, session.offset, chunk, checksum, controller.signal, (sentBytes) =>
        this.reportProgress(sentBytes, chunk.size)
      );
    } catch (error) {
      this.showConfirmedProgress();
      throw error;
    } finally {
      signal.removeEventListener("abort", forward);
      this.chunkAbort = null;
    }
  }

  private async holdWhilePaused(signal: AbortSignal) {
    if (!this.paused) return;
    this.setSnapshot({ phase: "paused", notice: null });
    while (this.paused && !signal.aborted) {
      await this.sleep(PAUSED_POLL_MS, signal);
    }
  }

  private async awaitFinalization(session: UploadSession, signal: AbortSignal): Promise<UploadSession> {
    this.setSnapshot({
      phase: "finalizing",
      confirmedBytes: session.file_size,
      sentBytes: session.file_size,
      percent: 100,
      notice: null,
    });
    const waitStartedAt = this.now();
    let delay = UPLOAD_FINALIZE_POLL_MIN_MS;
    let nudged = false;

    for (;;) {
      await this.sleep(delay, signal);
      this.ensureActive(signal);
      const current = await this.withRetry(() => this.deps.api.getSession(session.id, signal), signal);
      if (current.upload_status !== "FINALIZING") return current;
      if (!nudged && this.now() - waitStartedAt > UPLOAD_FINALIZE_NUDGE_AFTER_MS) {
        nudged = true;
        await this.deps.api.requestFinalize(session.id, signal).catch(() => undefined);
      }
      delay = Math.min(UPLOAD_FINALIZE_POLL_MAX_MS, Math.round(delay * 1.5));
    }
  }

  // Retries an idempotent request on transient failures; anything else is the caller's problem.
  private async withRetry<T>(operation: () => Promise<T>, signal: AbortSignal): Promise<T> {
    for (;;) {
      this.ensureActive(signal);
      try {
        const result = await operation();
        this.markRecovered();
        return result;
      } catch (error) {
        this.ensureActive(signal);
        if (classifyUploadError(toErrorInfo(error)).kind !== "transient") throw error;
        await this.backoff(error, signal);
      }
    }
  }

  private async backoff(error: unknown, signal: AbortSignal) {
    const offline = !this.network.isOnline();
    if (!offline) {
      this.failuresInRow += 1;
      if (!hasRetriesLeft(this.failuresInRow)) throw new RetriesExhausted();
    }
    if (this.snapshot.phase !== "interrupted") {
      this.emit({
        type: "interrupted",
        reason: offline ? "offline" : this.interruptionReason(error),
        attempt: this.failuresInRow,
      });
    }
    this.setSnapshot({ phase: "interrupted", notice: offline ? NOTICES.offline : NOTICES.retrying });

    if (offline) {
      await this.interruptible(signal, (local) => this.network.waitForOnline(local));
    } else {
      const retryAfterMs = error instanceof UploadApiError ? error.retryAfterMs : undefined;
      await this.sleep(calculateRetryDelay(this.failuresInRow, retryAfterMs, this.deps.random), signal);
    }
    this.ensureActive(signal);
  }

  private interruptionReason(error: unknown): "network" | "server" {
    return error instanceof UploadApiError && error.kind === "http" ? "server" : "network";
  }

  private markRecovered() {
    if (this.failuresInRow > 0) this.emit({ type: "recovered", attempts: this.failuresInRow });
    this.failuresInRow = 0;
  }

  // Moves the bar with the bytes of the current chunk that have left the browser. They are not stored yet, so the
  // percentage stays below 100 and a chunk that fails falls back to what the server confirmed (showConfirmedProgress).
  private reportProgress(chunkSentBytes: number, chunkSize: number) {
    const { confirmedBytes, totalBytes, sentBytes: shown } = this.snapshot;
    const now = this.now();
    const isChunkEnd = chunkSentBytes >= chunkSize;
    if (!isChunkEnd && now - this.lastProgressAt < PROGRESS_INTERVAL_MS) return;
    const sentBytes = Math.min(confirmedBytes + chunkSentBytes, totalBytes);
    if (sentBytes === shown) return;
    this.lastProgressAt = now;
    this.setSnapshot({ sentBytes, percent: Math.min(PROGRESS_CAP_PERCENT, toPercent(sentBytes, totalBytes)) });
  }

  private showConfirmedProgress() {
    const { confirmedBytes, totalBytes, sentBytes } = this.snapshot;
    if (sentBytes === confirmedBytes) return;
    this.setSnapshot({ sentBytes: confirmedBytes, percent: toPercent(confirmedBytes, totalBytes) });
  }

  private commit(confirmedBytes: number) {
    const { totalBytes } = this.snapshot;
    this.setSnapshot({ confirmedBytes, sentBytes: confirmedBytes, percent: toPercent(confirmedBytes, totalBytes) });
    if (this.sessionId && this.fingerprint) {
      this.deps.storage.save({
        sessionId: this.sessionId,
        fingerprint: this.fingerprint,
        confirmedBytes,
        updatedAt: this.now(),
      });
    }
  }

  private complete(session: UploadSession) {
    this.deps.storage.clear();
    this.setSnapshot({
      phase: "completed",
      confirmedBytes: session.file_size,
      sentBytes: session.file_size,
      percent: 100,
      videoAssetId: session.video_asset_id,
      notice: null,
      stalled: false,
    });
    this.emit({ type: "completed", durationMs: this.now() - this.startedAt });
  }

  private handleFailure(error: unknown, controller: AbortController) {
    if (error instanceof RunAborted || this.runAbort !== controller) return;

    if (error instanceof RetriesExhausted) {
      this.setSnapshot({ phase: "interrupted", notice: NOTICES.stalled, stalled: true });
      this.emit({ type: "failed", code: "retries_exhausted" });
      return;
    }

    const code = failureCodeFor(error);
    if (!KEEP_STORED_FAILURES.has(code)) this.deps.storage.clear();
    this.setSnapshot({ phase: "failed", failure: toFailure(code), notice: null });
    this.emit({ type: "failed", code });
  }

  // Resolves true once the server no longer holds the session (deleted, or already unknown to it).
  private async cancelOnServer(sessionId: string): Promise<boolean> {
    for (let attempt = 1; attempt <= CANCEL_ATTEMPTS; attempt += 1) {
      try {
        await this.deps.api.cancelSession(sessionId);
        return true;
      } catch (error) {
        if (error instanceof UploadApiError && error.status === 404) return true;
        // A chunk that was in flight may still hold the session lock for a moment; anything else will not improve.
        const retryable = error instanceof UploadApiError && error.code === "upload_in_progress";
        if (!retryable || attempt === CANCEL_ATTEMPTS) return false;
        await (this.deps.sleep ?? abortableSleep)(CANCEL_RETRY_MS, new AbortController().signal);
      }
    }
    return false;
  }
}
