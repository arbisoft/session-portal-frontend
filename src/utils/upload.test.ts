import {
  UPLOAD_MAX_CONSECUTIVE_RETRIES,
  UPLOAD_RETRY_AFTER_CAP_MS,
  UPLOAD_RETRY_BASE_DELAY_MS,
  UPLOAD_RETRY_MAX_DELAY_MS,
} from "@/constants/constants";

import {
  buildFingerprint,
  bytesToBase64,
  calculateRetryDelay,
  classifyUploadError,
  computeChunkChecksum,
  createClientKey,
  fingerprintsMatch,
  formatBytes,
  formatRate,
  formatTimeLeft,
  hasRetriesLeft,
  isAllowedVideoFile,
  parseRetryAfter,
  titleFromFileName,
  toEventTimestamp,
  toPercent,
} from "./upload";

describe("classifyUploadError", () => {
  it.each([
    [{ kind: "network", status: 0, code: "network_error" }, { kind: "transient" }],
    [{ kind: "http", status: 502, code: "http_502" }, { kind: "transient" }],
    [{ kind: "http", status: 503, code: "http_503" }, { kind: "transient" }],
    [{ kind: "http", status: 429, code: "http_429" }, { kind: "transient" }],
    [{ kind: "http", status: 409, code: "upload_in_progress" }, { kind: "transient" }],
    [{ kind: "http", status: 400, code: "incomplete_chunk" }, { kind: "transient" }],
    [{ kind: "http", status: 422, code: "checksum_mismatch" }, { kind: "transient" }],
    [{ kind: "http", status: 409, code: "offset_mismatch" }, { kind: "reconcile" }],
    [{ kind: "http", status: 409, code: "session_not_active" }, { kind: "reconcile" }],
    [{ kind: "http", status: 410, code: "session_expired" }, { kind: "gone" }],
    [{ kind: "http", status: 404, code: "http_404" }, { kind: "gone" }],
    [{ kind: "http", status: 401, code: "http_401" }, { kind: "unauthorized" }],
    [
      { kind: "http", status: 507, code: "insufficient_storage" },
      { kind: "fatal", failure: "storage_full" },
    ],
    [
      { kind: "http", status: 403, code: "http_403" },
      { kind: "fatal", failure: "rejected" },
    ],
    [
      { kind: "http", status: 422, code: "invalid_file_signature" },
      { kind: "fatal", failure: "rejected" },
    ],
    [
      { kind: "http", status: 413, code: "chunk_too_large" },
      { kind: "fatal", failure: "rejected" },
    ],
    [
      { kind: "http", status: 0, code: "unknown" },
      { kind: "fatal", failure: "unknown" },
    ],
  ] as const)("should classify %j as %j", (error, outcome) => {
    expect(classifyUploadError(error)).toEqual(outcome);
  });
});

describe("calculateRetryDelay", () => {
  it("should grow exponentially and stay within the jitter window", () => {
    expect(calculateRetryDelay(1, undefined, () => 0)).toBe(UPLOAD_RETRY_BASE_DELAY_MS / 2);
    expect(calculateRetryDelay(1, undefined, () => 1)).toBe(UPLOAD_RETRY_BASE_DELAY_MS);
    expect(calculateRetryDelay(3, undefined, () => 1)).toBe(UPLOAD_RETRY_BASE_DELAY_MS * 4);
  });

  it("should cap the delay", () => {
    expect(calculateRetryDelay(20, undefined, () => 1)).toBe(UPLOAD_RETRY_MAX_DELAY_MS);
  });

  it("should honour a longer Retry-After but never wait less than the backoff", () => {
    expect(calculateRetryDelay(1, 12_000, () => 0)).toBe(12_000);
    expect(calculateRetryDelay(5, 100, () => 1)).toBe(UPLOAD_RETRY_BASE_DELAY_MS * 16);
  });

  it("should cap an excessive Retry-After", () => {
    expect(calculateRetryDelay(1, 60 * 60_000)).toBe(UPLOAD_RETRY_AFTER_CAP_MS);
  });
});

describe("hasRetriesLeft", () => {
  it("should allow the configured number of consecutive failures", () => {
    expect(hasRetriesLeft(UPLOAD_MAX_CONSECUTIVE_RETRIES)).toBe(true);
    expect(hasRetriesLeft(UPLOAD_MAX_CONSECUTIVE_RETRIES + 1)).toBe(false);
  });
});

describe("parseRetryAfter", () => {
  it("should parse delta-seconds", () => {
    expect(parseRetryAfter("7")).toBe(7000);
  });

  it("should parse an HTTP date relative to now", () => {
    const now = Date.parse("2026-01-01T00:00:00Z");
    expect(parseRetryAfter("Thu, 01 Jan 2026 00:00:30 GMT", now)).toBe(30_000);
    expect(parseRetryAfter("Wed, 31 Dec 2025 23:00:00 GMT", now)).toBe(0);
  });

  it("should ignore missing, negative and malformed values", () => {
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter("-5")).toBeUndefined();
    expect(parseRetryAfter("soon")).toBeUndefined();
  });
});

describe("toPercent", () => {
  it("should floor confirmed progress and cap it at 100", () => {
    expect(toPercent(199, 400)).toBe(49);
    expect(toPercent(400, 400)).toBe(100);
    expect(toPercent(500, 400)).toBe(100);
  });

  it("should return 0 for an empty file", () => {
    expect(toPercent(0, 0)).toBe(0);
  });
});

describe("fingerprints", () => {
  const file = new File(["abc"], "talk.mp4", { type: "video/mp4", lastModified: 1234 });

  it("should describe a file by name, size and modification time", () => {
    expect(buildFingerprint(file)).toEqual({ name: "talk.mp4", size: 3, lastModified: 1234 });
  });

  it("should only match identical fingerprints", () => {
    const fingerprint = buildFingerprint(file);
    expect(fingerprintsMatch(fingerprint, { ...fingerprint })).toBe(true);
    expect(fingerprintsMatch(fingerprint, { ...fingerprint, size: 4 })).toBe(false);
    expect(fingerprintsMatch(fingerprint, { ...fingerprint, lastModified: 1 })).toBe(false);
    expect(fingerprintsMatch(fingerprint, { ...fingerprint, name: "other.mp4" })).toBe(false);
  });
});

describe("computeChunkChecksum", () => {
  const originalCrypto = globalThis.crypto;
  afterEach(() => Object.defineProperty(globalThis, "crypto", { value: originalCrypto, configurable: true }));

  it("should return a tus-style sha256 header value", async () => {
    const digest = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer);
    Object.defineProperty(globalThis, "crypto", { value: { subtle: { digest } }, configurable: true });
    const chunk = { arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)) } as unknown as Blob;

    await expect(computeChunkChecksum(chunk)).resolves.toBe(`sha256 ${bytesToBase64(new Uint8Array([1, 2, 3]))}`);
    expect(digest).toHaveBeenCalledWith("SHA-256", expect.any(ArrayBuffer));
  });

  it("should skip the checksum when SubtleCrypto is unavailable", async () => {
    Object.defineProperty(globalThis, "crypto", { value: {}, configurable: true });

    await expect(computeChunkChecksum(new Blob(["x"]))).resolves.toBeUndefined();
  });
});

describe("createClientKey", () => {
  const originalCrypto = globalThis.crypto;
  afterEach(() => Object.defineProperty(globalThis, "crypto", { value: originalCrypto, configurable: true }));

  it("should use a random UUID when available and match the backend key format", () => {
    Object.defineProperty(globalThis, "crypto", {
      value: { randomUUID: () => "3f2b8c9e-1b0a-4c75-9d56-0d4c4f2d1e11" },
      configurable: true,
    });

    expect(createClientKey()).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });

  it("should fall back to a generated key", () => {
    Object.defineProperty(globalThis, "crypto", { value: {}, configurable: true });

    expect(createClientKey()).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });
});

describe("formatBytes", () => {
  it("should format sizes with one decimal above a kilobyte", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(20 * 1024 ** 3)).toBe("20.0 GB");
  });
});

describe("formatRate", () => {
  it("should format a transfer speed per second", () => {
    expect(formatRate(5 * 1024 ** 2)).toBe("5.0 MB/s");
  });
});

describe("formatTimeLeft", () => {
  it.each([
    [20, "less than a minute left"],
    [5 * 60, "5 min left"],
    [60 * 60, "1 h left"],
    [75 * 60, "1 h 15 min left"],
  ])("should format %i seconds as %s", (seconds, expected) => {
    expect(formatTimeLeft(seconds)).toBe(expected);
  });
});

describe("isAllowedVideoFile", () => {
  it.each([
    [{ name: "a.mp4", type: "video/mp4" }, true],
    [{ name: "a.mp4", type: "application/pdf" }, false],
    [{ name: "clip.MOV", type: "" }, true],
    [{ name: "clip.mkv", type: "" }, false],
  ])("should judge %j as %s", (file, expected) => {
    expect(isAllowedVideoFile(file)).toBe(expected);
  });
});

describe("titleFromFileName", () => {
  it.each([
    ["my_talk-2024.mp4", "my talk 2024"],
    ["Quarterly   review.final.webm", "Quarterly review.final"],
    ["noextension", "noextension"],
  ])("should turn %s into %s", (name, expected) => {
    expect(titleFromFileName(name)).toBe(expected);
  });
});

describe("toEventTimestamp", () => {
  it("should keep the chosen calendar day regardless of the time of day", () => {
    const midnight = new Date(2026, 9, 22, 0, 0, 0);
    const lateEvening = new Date(2026, 9, 22, 23, 59, 0);

    expect(new Date(toEventTimestamp(midnight)).getDate()).toBe(22);
    expect(new Date(toEventTimestamp(lateEvening)).getDate()).toBe(22);
    expect(new Date(toEventTimestamp(midnight)).getHours()).toBe(12);
  });
});
