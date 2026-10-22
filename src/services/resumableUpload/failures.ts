import { classifyUploadError, UploadErrorInfo, UploadFailureCode } from "@/utils/upload";

import { UploadApiError } from "./transport";
import { UploadFailure } from "./types";

export const FAILURE_MESSAGES: Record<UploadFailureCode, string> = {
  unauthorized: "Your session has expired. Please log in again.",
  expired: "This upload expired or was cancelled. Select the file again to start a new upload.",
  rejected: "The server rejected this upload. Check the file and try again.",
  storage_full: "The server is out of storage space. Try again later or contact an administrator.",
  processing_failed: "The video could not be processed. Check that the file is a valid video.",
  verification_failed: "The uploaded file did not pass verification. Select the file to upload it again.",
  retries_exhausted: "Upload paused after repeated connection problems.",
  unknown: "Upload failed. Please try again.",
};

export const NOTICES = {
  offline: "You're offline. The upload continues automatically when you reconnect.",
  retrying: "Connection problem. Retrying…",
  stalled: "Upload paused after repeated connection problems. Resume when your connection is stable.",
} as const;

const RETRYABLE_FAILURES = new Set<UploadFailureCode>(["storage_full", "unknown"]);
// The server session may still be usable, so its stored reference is kept for a later resume.
export const KEEP_STORED_FAILURES = new Set<UploadFailureCode>(["unauthorized", "storage_full", "unknown"]);
const VERIFICATION_ERROR_CODES = new Set(["size_mismatch", "checksum_mismatch", "invalid_file_signature"]);

export class RunAborted extends Error {}
export class RetriesExhausted extends Error {}
export class SessionFailed extends Error {
  constructor(readonly errorCode: string) {
    super(`Upload session failed (${errorCode})`);
  }
}

export const toErrorInfo = (error: unknown): UploadErrorInfo =>
  error instanceof UploadApiError
    ? { kind: error.kind, status: error.status, code: error.code }
    : { kind: "http", status: 0, code: "unknown" };

export const toFailure = (code: UploadFailureCode): UploadFailure => ({
  code,
  message: FAILURE_MESSAGES[code],
  retryable: RETRYABLE_FAILURES.has(code),
});

export const failureCodeFor = (error: unknown): UploadFailureCode => {
  if (error instanceof SessionFailed) {
    if (error.errorCode === "processing_failed") return "processing_failed";
    return VERIFICATION_ERROR_CODES.has(error.errorCode) ? "verification_failed" : "unknown";
  }
  const outcome = classifyUploadError(toErrorInfo(error));
  if (outcome.kind === "unauthorized") return "unauthorized";
  if (outcome.kind === "gone") return "expired";
  return outcome.kind === "fatal" ? outcome.failure : "unknown";
};
