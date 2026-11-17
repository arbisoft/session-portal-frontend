"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";

import { UPLOAD_STORAGE_KEY } from "@/constants/constants";
import { UploadSession } from "@/models/Events";
import { selectCurrentUser, selectIsStaff } from "@/redux/login/selectors";
import { createUploadStorage, StoredUpload } from "@/services/resumableUpload/storage";
import { createUploadApi } from "@/services/resumableUpload/transport";
import { UploadEvent, UploadPhase, UploadSnapshot } from "@/services/resumableUpload/types";
import { IDLE_SNAPSHOT, UploadManager } from "@/services/resumableUpload/uploadManager";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { reportHandledMessage } from "@/utils/monitoring";

export type VideoUploadState = {
  uploadProgress: number;
  /** Bytes sent so far, including the part of the current chunk that is still on its way. */
  sentBytes: number;
  isUploading: boolean;
  videoAssetId: number | null;
  error: string | null;
  /** Uploads `file`. With `sessionId` it continues that unfinished server session instead of creating a new one. */
  startUpload: (file: File, sessionId?: string) => void;
  phase: UploadPhase;
  /** Why the transfer is waiting or interrupted, when it is. */
  notice: string | null;
  canPause: boolean;
  canResume: boolean;
  canCancel: boolean;
  /** The server rejected the upload as unauthorized: the login session ended. The upload itself stays resumable. */
  isSessionExpired: boolean;
  pauseUpload: () => void;
  resumeUpload: () => void;
  cancelUpload: () => void;
  /** An unfinished upload from an earlier page load. Selecting the same file continues it. */
  pendingUpload: StoredUpload | null;
  discardPendingUpload: () => void;
  /** The user's unfinished uploads on the server, except the one running on this page. */
  unfinishedUploads: UploadSession[];
  /** `error` means the list could not be loaded; the stored upload is then still offered as `pendingUpload`. */
  unfinishedStatus: UnfinishedStatus;
  /** Deletes an unfinished upload. Resolves `false` when the server could not be reached. */
  deleteUnfinishedUpload: (sessionId: string) => Promise<boolean>;
};

export type UnfinishedStatus = "loading" | "ready" | "error";

const ACTIVE_PHASES = new Set<UploadPhase>(["creating", "uploading", "paused", "interrupted", "finalizing"]);
const CANCELLABLE_PHASES = new Set<UploadPhase>(["creating", "uploading", "paused"]);
// The server list changes whenever an upload starts or ends, so it is read again at those moments. A cancelled upload is
// read after the server has deleted it (see cancelUpload), not when the phase changes.
const REFRESH_PHASES = new Set<UploadPhase>(["idle", "failed", "completed", "finalizing"]);
const REPORTED_FAILURES = new Set(["unknown", "verification_failed"]);

// Progress changes at most once per percent in the UI; confirmedBytes may lag by less than that between renders.
const isSameView = (a: UploadSnapshot, b: UploadSnapshot) =>
  a.phase === b.phase &&
  a.percent === b.percent &&
  a.sentBytes === b.sentBytes &&
  a.notice === b.notice &&
  a.videoAssetId === b.videoAssetId &&
  a.sessionId === b.sessionId &&
  a.failure === b.failure &&
  a.stalled === b.stalled &&
  a.resumed === b.resumed;

export const useVideoUpload = (): VideoUploadState => {
  const [snapshot, setSnapshot] = useState<UploadSnapshot>(IDLE_SNAPSHOT);
  const [pendingUpload, setPendingUpload] = useState<StoredUpload | null>(null);
  const [unfinished, setUnfinished] = useState<UploadSession[]>([]);
  const [unfinishedStatus, setUnfinishedStatus] = useState<UnfinishedStatus>("loading");
  const managerRef = useRef<UploadManager | null>(null);
  const isMountedRef = useRef(false);
  const listRequestRef = useRef(0);
  const shownRef = useRef<UploadSnapshot>(IDLE_SNAPSHOT);
  const userId = useSelector(selectCurrentUser)?.id;
  const isStaff = useSelector(selectIsStaff);
  // The manager must outlive a change of user id (the current user loads after the first render), so the storage key
  // is resolved on every access instead of when the manager is created.
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    const handleEvent = (event: UploadEvent) => {
      // Only counts, flags and static reasons are reported: no file names, session ids or server messages.
      switch (event.type) {
        case "started":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_STARTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, {
            resumed: event.resumed,
            size_mb: Math.round(event.sizeBytes / 1024 ** 2),
          });
          break;
        case "interrupted":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_INTERRUPTED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { reason: event.reason });
          break;
        case "recovered":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_RECOVERED, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { attempts: event.attempts });
          break;
        case "paused":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_PAUSED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
          break;
        case "continued":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_RESUMED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
          break;
        case "cancelled":
          trackEvent(GA_EVENTS.UPLOAD_VIDEO_CANCELLED, ANALYTICS_CATEGORY.UPLOAD_VIDEO);
          break;
        case "failed":
          if (REPORTED_FAILURES.has(event.code)) {
            reportHandledMessage("Resumable video upload failed", { source: "video_upload", extra: { code: event.code } });
          }
          break;
        default:
          break;
      }
    };

    const scopedStorage = () => createUploadStorage(`${UPLOAD_STORAGE_KEY}:${userIdRef.current ?? "anonymous"}`);
    const manager = new UploadManager({
      api: createUploadApi(),
      storage: {
        load: () => scopedStorage().load(),
        save: (record) => scopedStorage().save(record),
        clear: () => scopedStorage().clear(),
      },
      onChange: (next) => {
        if (isSameView(shownRef.current, next)) return;
        shownRef.current = next;
        setSnapshot(next);
      },
      onEvent: handleEvent,
    });
    managerRef.current = manager;
    isMountedRef.current = true;

    // Leaving the page stops the transfer but keeps the server session, so the upload can be resumed later.
    return () => {
      isMountedRef.current = false;
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    setPendingUpload(managerRef.current?.peekStored() ?? null);
  }, [userId]);

  const { phase } = snapshot;

  const refreshUnfinished = useCallback(async () => {
    listRequestRef.current += 1;
    const requestId = listRequestRef.current;
    const isLatest = () => isMountedRef.current && requestId === listRequestRef.current;
    try {
      const sessions = await managerRef.current?.listUnfinished();
      if (!sessions || !isLatest()) return;
      setUnfinished(sessions);
      setUnfinishedStatus("ready");
    } catch {
      // Only the extra list is lost; uploading itself does not depend on it.
      if (isLatest()) setUnfinishedStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!isStaff || !REFRESH_PHASES.has(phase)) return;
    void refreshUnfinished();
  }, [isStaff, phase, refreshUnfinished]);

  const startUpload = useCallback((file: File, sessionId?: string) => {
    setPendingUpload(null);
    void managerRef.current?.start(file, { sessionId });
  }, []);

  const deleteUnfinishedUpload = useCallback(async (sessionId: string) => {
    const removed = (await managerRef.current?.discardSession(sessionId)) ?? false;
    if (removed && isMountedRef.current) {
      setUnfinished((current) => current.filter((session) => session.id !== sessionId));
      setPendingUpload((current) => (current?.sessionId === sessionId ? null : current));
    }
    return removed;
  }, []);

  const pauseUpload = useCallback(() => managerRef.current?.pause(), []);
  const resumeUpload = useCallback(() => void managerRef.current?.resume(), []);
  const cancelUpload = useCallback(() => {
    void managerRef.current?.cancel().then(refreshUnfinished);
  }, [refreshUnfinished]);

  const discardPendingUpload = useCallback(() => {
    setPendingUpload(null);
    void managerRef.current?.discardStored();
  }, []);

  // While a dropped connection is being retried automatically only "Retry now" is offered. Once retries ran out
  // (stalled) nothing is happening any more, so the user must still be able to give up on the upload.
  const canPause = phase === "uploading";
  const canCancel = CANCELLABLE_PHASES.has(phase) || (phase === "interrupted" && snapshot.stalled === true);

  return {
    uploadProgress: snapshot.percent,
    sentBytes: snapshot.sentBytes,
    isUploading: ACTIVE_PHASES.has(phase),
    videoAssetId: snapshot.videoAssetId,
    error: snapshot.failure?.message ?? null,
    startUpload,
    phase,
    notice: snapshot.notice,
    canPause,
    canResume: phase === "paused" || phase === "interrupted" || (phase === "failed" && !!snapshot.failure?.retryable),
    canCancel,
    isSessionExpired: snapshot.failure?.code === "unauthorized",
    pauseUpload,
    resumeUpload,
    cancelUpload,
    pendingUpload,
    discardPendingUpload,
    unfinishedUploads: unfinished.filter((session) => session.id !== snapshot.sessionId),
    unfinishedStatus,
    deleteUnfinishedUpload,
  };
};
