import { UploadFailureCode } from "@/utils/upload";

export type UploadPhase =
  "idle" | "creating" | "uploading" | "paused" | "interrupted" | "finalizing" | "completed" | "failed" | "cancelled";

export type UploadFailure = {
  code: UploadFailureCode;
  message: string;
  retryable: boolean;
};

export type UploadSnapshot = {
  phase: UploadPhase;
  /** Bytes the server confirmed as durably stored. Never an estimate. */
  confirmedBytes: number;
  totalBytes: number;
  /**
   * Bytes confirmed plus the part of the chunk being sent right now, so progress moves while a chunk uploads. Falls
   * back to `confirmedBytes` whenever a chunk ends without being confirmed. Only for display: resuming uses the server.
   */
  sentBytes: number;
  /** `sentBytes` as a whole percent. At most 99 until the server has confirmed everything; 100 while finalizing. */
  percent: number;
  videoAssetId: number | null;
  failure: UploadFailure | null;
  /** Why the transfer is interrupted or waiting, for display. */
  notice: string | null;
  /** True when the upload continued an earlier session instead of starting a new one. */
  resumed: boolean;
  /** True when the loop has stopped and only an explicit resume continues. */
  stalled: boolean;
};

export type UploadEvent =
  | { type: "started"; resumed: boolean; sizeBytes: number }
  | { type: "interrupted"; reason: "network" | "server" | "offline"; attempt: number }
  | { type: "recovered"; attempts: number }
  | { type: "paused" }
  | { type: "continued" }
  | { type: "cancelled" }
  | { type: "completed"; durationMs: number }
  | { type: "failed"; code: UploadFailureCode };

export type UploadNetwork = {
  isOnline(): boolean;
  waitForOnline(signal: AbortSignal): Promise<void>;
};
