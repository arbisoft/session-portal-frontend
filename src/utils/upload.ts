import {
  ALLOWED_TYPES,
  ALLOWED_VIDEO_EXTENSIONS,
  UPLOAD_MAX_CONSECUTIVE_RETRIES,
  UPLOAD_RETRY_AFTER_CAP_MS,
  UPLOAD_RETRY_BASE_DELAY_MS,
  UPLOAD_RETRY_MAX_DELAY_MS,
} from "@/constants/constants";

export type FileFingerprint = { name: string; size: number; lastModified: number };

export type UploadFailureCode =
  | "unauthorized"
  | "expired"
  | "rejected"
  | "storage_full"
  | "processing_failed"
  | "verification_failed"
  | "retries_exhausted"
  | "unknown";

export type UploadErrorKind = "http" | "network" | "aborted";

export type UploadErrorInfo = {
  kind: UploadErrorKind;
  status: number;
  code: string;
};

// transient: retry the same operation after a delay. reconcile: ask the server where it stands.
// gone/unauthorized/fatal: stop; the session cannot continue as is.
export type UploadErrorOutcome =
  | { kind: "transient" }
  | { kind: "reconcile" }
  | { kind: "unauthorized" }
  | { kind: "gone" }
  | { kind: "fatal"; failure: UploadFailureCode };

const TRANSIENT_CODES = new Set(["upload_in_progress", "incomplete_chunk", "checksum_mismatch"]);
const RECONCILE_CODES = new Set(["offset_mismatch", "session_not_active"]);
const GONE_CODES = new Set(["session_expired", "session_cancelled"]);
const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export const classifyUploadError = ({ kind, status, code }: UploadErrorInfo): UploadErrorOutcome => {
  if (kind === "network") return { kind: "transient" };
  if (RECONCILE_CODES.has(code)) return { kind: "reconcile" };
  if (TRANSIENT_CODES.has(code)) return { kind: "transient" };
  if (GONE_CODES.has(code) || status === 404 || status === 410) return { kind: "gone" };
  if (status === 401) return { kind: "unauthorized" };
  if (code === "insufficient_storage" || status === 507) return { kind: "fatal", failure: "storage_full" };
  if (TRANSIENT_STATUSES.has(status)) return { kind: "transient" };
  return { kind: "fatal", failure: status === 0 ? "unknown" : "rejected" };
};

/** Exponential backoff with full jitter, or the server's Retry-After when it asks for longer. */
export const calculateRetryDelay = (attempt: number, retryAfterMs?: number, random: () => number = Math.random): number => {
  const ceiling = Math.min(UPLOAD_RETRY_MAX_DELAY_MS, UPLOAD_RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1));
  const jittered = Math.round(ceiling / 2 + (ceiling / 2) * random());
  if (retryAfterMs === undefined) return jittered;
  return Math.min(UPLOAD_RETRY_AFTER_CAP_MS, Math.max(retryAfterMs, jittered));
};

export const hasRetriesLeft = (consecutiveFailures: number) => consecutiveFailures <= UPLOAD_MAX_CONSECUTIVE_RETRIES;

/** Parses a Retry-After header: delta-seconds or an HTTP date. Returns milliseconds, or undefined when unusable. */
export const parseRetryAfter = (value: string | null, now: number = Date.now()): number | undefined => {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return seconds >= 0 ? Math.round(seconds * 1000) : undefined;
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
};

export const toPercent = (confirmedBytes: number, totalBytes: number): number =>
  totalBytes > 0 ? Math.min(100, Math.floor((confirmedBytes / totalBytes) * 100)) : 0;

export const buildFingerprint = (file: File): FileFingerprint => ({
  name: file.name,
  size: file.size,
  lastModified: file.lastModified,
});

export const fingerprintsMatch = (a: FileFingerprint, b: FileFingerprint) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

export const bytesToBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

/** Value of the tus-style Upload-Checksum header, or undefined when SubtleCrypto is unavailable (insecure context). */
export const computeChunkChecksum = async (chunk: Blob): Promise<string | undefined> => {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return undefined;
  const digest = await subtle.digest("SHA-256", await chunk.arrayBuffer());
  return `sha256 ${bytesToBase64(new Uint8Array(digest))}`;
};

export const createClientKey = (): string => {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

const UNITS = ["B", "KB", "MB", "GB", "TB"];

export const formatBytes = (bytes: number): string => {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${UNITS[unit]}`;
};

export const formatRate = (bytesPerSecond: number): string => `${formatBytes(bytesPerSecond)}/s`;

export const formatTimeLeft = (seconds: number): string => {
  if (seconds < 60) return "less than a minute left";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h left` : `${hours} h ${rest} min left`;
};

/** MIME type first; the extension only when the browser could not tell what the file is. */
export const isAllowedVideoFile = (file: Pick<File, "name" | "type">): boolean => {
  if (file.type) return ALLOWED_TYPES.includes(file.type);
  const name = file.name.toLowerCase();
  return ALLOWED_VIDEO_EXTENSIONS.some((extension) => name.endsWith(extension));
};

/** "my_talk-2024.final.mp4" -> "my talk 2024.final": a readable starting point for the title. */
export const titleFromFileName = (fileName: string): string =>
  fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * The event date is a calendar day. Local midnight can land on the previous day once converted to UTC, so the time is
 * pinned to noon, which keeps the same calendar day for every timezone within 12 hours of the user.
 */
export const toEventTimestamp = (date: Date): string => {
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);
  return noon.toISOString();
};
