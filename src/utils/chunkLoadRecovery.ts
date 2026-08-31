const CHUNK_LOAD_ERROR_RELOADED_KEY = "chunk-load-error-reloaded";

// A stale client (open before a new deploy) requests a chunk hash that no longer
// exists on the server. Re-rendering in place won't refetch the build manifest,
// so the same stale chunk request fails again; a hard reload is required.
export function isChunkLoadError(error: Error): boolean {
  return /Failed to load chunk|ChunkLoadError/i.test(error.message) || error.name === "ChunkLoadError";
}

// Reloads the page once per session when a chunk load error is detected, guarding
// against reload loops if the deploy that caused the stale chunk is itself broken.
export function recoverFromChunkLoadError(error: Error): boolean {
  if (!isChunkLoadError(error) || sessionStorage.getItem(CHUNK_LOAD_ERROR_RELOADED_KEY) === "true") {
    return false;
  }

  sessionStorage.setItem(CHUNK_LOAD_ERROR_RELOADED_KEY, "true");
  window.location.reload();
  return true;
}
