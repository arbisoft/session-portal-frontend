import { isChunkLoadError, recoverFromChunkLoadError } from "./chunkLoadRecovery";

describe("isChunkLoadError", () => {
  it("should return true when the message matches Failed to load chunk", () => {
    expect(isChunkLoadError(new Error("Failed to load chunk foo.js from module 123"))).toBe(true);
  });

  it("should return true when the message matches ChunkLoadError", () => {
    expect(isChunkLoadError(new Error("ChunkLoadError: boom"))).toBe(true);
  });

  it("should return true when the error name is ChunkLoadError", () => {
    expect(isChunkLoadError(Object.assign(new Error("boom"), { name: "ChunkLoadError" }))).toBe(true);
  });

  it("should return false for unrelated errors", () => {
    expect(isChunkLoadError(new Error("Unrelated failure"))).toBe(false);
  });
});

describe("recoverFromChunkLoadError", () => {
  const mockReload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });
  });

  it("should reload once and return true for a chunk load error", () => {
    const result = recoverFromChunkLoadError(new Error("Failed to load chunk foo.js from module 123"));

    expect(result).toBe(true);
    expect(mockReload).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("chunk-load-error-reloaded")).toBe("true");
  });

  it("should not reload again if already reloaded this session", () => {
    sessionStorage.setItem("chunk-load-error-reloaded", "true");

    const result = recoverFromChunkLoadError(new Error("Failed to load chunk foo.js from module 123"));

    expect(result).toBe(false);
    expect(mockReload).not.toHaveBeenCalled();
  });

  it("should return false and not reload for non-chunk errors", () => {
    const result = recoverFromChunkLoadError(new Error("Unrelated failure"));

    expect(result).toBe(false);
    expect(mockReload).not.toHaveBeenCalled();
  });
});
