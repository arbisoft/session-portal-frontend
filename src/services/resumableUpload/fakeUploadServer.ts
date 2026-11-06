import { UploadSession, UploadSessionRequest, UploadSessionStatus } from "@/models/Events";

import { UploadApi, UploadApiError } from "./transport";

export const readBlob = (blob: Blob): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });

export type ChunkFault =
  | "ok"
  | "network" // the request never reaches the server
  | "ack-lost" // the server commits the chunk but the client never hears back
  | { http: number; code?: string; offset?: number; retryAfterMs?: number }
  | "hold"; // blocks until released or aborted

/**
 * In-memory stand-in for the backend upload protocol: it commits chunks only at its current offset, reports the
 * authoritative offset and moves through FINALIZING to COMPLETED. Faults are scripted per chunk request.
 */
export class FakeUploadServer implements UploadApi {
  readonly sessionId = "3f2b8c9e-1b0a-4c75-9d56-0d4c4f2d1e11";
  committed: number[] = [];
  sentOffsets: number[] = [];
  created = 0;
  cancelled: string[] = [];
  finalizeRequests = 0;
  status: UploadSessionStatus = "UPLOADING";
  errorCode = "";
  pollsUntilComplete = 1;
  chunkFaults: ChunkFault[] = [];
  statusFaults: Array<UploadApiError | null> = [];
  knownSession = true;
  release: (() => void) | null = null;
  fileSize = 0;

  constructor(private readonly chunkSize = 4) {}

  private describe(): UploadSession {
    const complete = this.status === "COMPLETED";
    return {
      id: this.sessionId,
      filename: "talk.mp4",
      file_size: this.fileSize,
      offset: this.status === "UPLOADING" ? this.committed.length : this.fileSize,
      upload_status: this.status,
      error_code: this.errorCode,
      video_asset_id: complete ? 42 : null,
      expires_at: "2030-01-01T00:00:00Z",
      chunk_size: this.chunkSize,
      max_chunk_size: this.chunkSize * 2,
    };
  }

  async createSession(body: UploadSessionRequest) {
    this.created += 1;
    this.fileSize = body.file_size;
    this.knownSession = true;
    return this.describe();
  }

  async getSession(sessionId: string) {
    const fault = this.statusFaults.shift();
    if (fault) throw fault;
    if (!this.knownSession || sessionId !== this.sessionId) throw new UploadApiError("http", 404, "http_404");
    if (this.status === "FINALIZING") {
      this.pollsUntilComplete -= 1;
      if (this.pollsUntilComplete <= 0 && !this.errorCode) this.status = "COMPLETED";
      if (this.pollsUntilComplete <= 0 && this.errorCode) this.status = "FAILED";
    }
    return this.describe();
  }

  async sendChunk(_sessionId: string, offset: number, chunk: Blob, _checksum: string | undefined, signal: AbortSignal) {
    this.sentOffsets.push(offset);
    const fault = this.chunkFaults.shift() ?? "ok";
    if (fault === "network") throw new UploadApiError("network", 0, "network_error");
    if (typeof fault === "object") {
      throw new UploadApiError("http", fault.http, fault.code ?? `http_${fault.http}`, fault.offset, fault.retryAfterMs);
    }
    if (fault === "hold") {
      await new Promise<void>((resolve, reject) => {
        this.release = resolve;
        signal.addEventListener("abort", () => reject(new UploadApiError("aborted", 0, "aborted")), { once: true });
      });
    }
    if (offset !== this.committed.length) {
      throw new UploadApiError("http", 409, "offset_mismatch", this.committed.length);
    }
    this.committed.push(...(await readBlob(chunk)));
    if (this.committed.length === this.fileSize) this.status = "FINALIZING";
    if (fault === "ack-lost") throw new UploadApiError("network", 0, "network_error");
    return this.describe();
  }

  async requestFinalize() {
    this.finalizeRequests += 1;
    return this.describe();
  }

  async cancelSession(sessionId: string) {
    this.cancelled.push(sessionId);
  }
}
