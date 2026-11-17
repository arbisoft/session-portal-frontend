import { act, renderHook, waitFor } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";

import { UploadSession } from "@/models/Events";
import { StoredUpload } from "@/services/resumableUpload/storage";
import { UploadEvent, UploadSnapshot } from "@/services/resumableUpload/types";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import { useVideoUpload } from "./useVideoUpload";

const mockSendGTMEvent = jest.fn();
jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: (...args: unknown[]) => mockSendGTMEvent(...args) }));

const mockCaptureMessage = jest.fn();
jest.mock("@sentry/nextjs", () => ({
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

type ManagerDeps = {
  onChange: (snapshot: UploadSnapshot) => void;
  onEvent: (event: UploadEvent) => void;
  storage: { load: () => unknown };
};

const mockManagers: Array<Record<string, jest.Mock> & { deps: ManagerDeps }> = [];
let mockStored: StoredUpload | null = null;
// null keeps the list request pending, so tests that do not care about the list see no late state updates.
let mockUnfinished: UploadSession[] | null = null;

jest.mock("@/services/resumableUpload/uploadManager", () => ({
  ...jest.requireActual("@/services/resumableUpload/uploadManager"),
  UploadManager: class {
    deps: ManagerDeps;
    start = jest.fn().mockResolvedValue(undefined);
    pause = jest.fn();
    resume = jest.fn();
    cancel = jest.fn().mockResolvedValue(undefined);
    discardStored = jest.fn().mockResolvedValue(undefined);
    listUnfinished = jest.fn(() =>
      mockUnfinished ? Promise.resolve(mockUnfinished) : new Promise<UploadSession[]>(() => undefined)
    );
    discardSession = jest.fn().mockResolvedValue(true);
    dispose = jest.fn();
    peekStored = jest.fn(() => mockStored);

    constructor(deps: ManagerDeps) {
      this.deps = deps;
      mockManagers.push(this as never);
    }
  },
}));

const file = new File(["video"], "talk.mp4", { type: "video/mp4" });
const snapshot = (overrides: Partial<UploadSnapshot> = {}): UploadSnapshot => ({
  phase: "uploading",
  confirmedBytes: 10,
  sentBytes: 10,
  totalBytes: 100,
  percent: 10,
  videoAssetId: null,
  sessionId: null,
  failure: null,
  notice: null,
  resumed: false,
  stalled: false,
  ...overrides,
});
const manager = () => mockManagers[mockManagers.length - 1];

describe("useVideoUpload", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    mockManagers.length = 0;
    mockStored = null;
    mockUnfinished = null;
    dispatch.mockClear();
    mockSendGTMEvent.mockClear();
    mockCaptureMessage.mockClear();
    (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    (useSelector as unknown as jest.Mock).mockReturnValue({ id: 7 });
  });

  it("should start idle and hand the file to the upload manager", () => {
    const { result } = renderHook(() => useVideoUpload());

    expect(result.current).toMatchObject({
      uploadProgress: 0,
      isUploading: false,
      videoAssetId: null,
      error: null,
      phase: "idle",
    });

    act(() => result.current.startUpload(file));

    expect(manager().start).toHaveBeenCalledWith(file, { sessionId: undefined });
  });

  it("should scope the stored upload to the signed-in user", () => {
    renderHook(() => useVideoUpload());

    const storage = manager().deps.storage as unknown as { save: (record: unknown) => void };
    storage.save({ sessionId: "s", fingerprint: { name: "a", size: 1, lastModified: 1 }, confirmedBytes: 0, updatedAt: 1 });

    expect(window.localStorage.getItem("upload-video:session:v1:7")).not.toBeNull();
    window.localStorage.clear();
  });

  it("should expose confirmed progress while uploading and allow pausing and cancelling", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() => manager().deps.onChange(snapshot({ percent: 42 })));

    expect(result.current).toMatchObject({
      uploadProgress: 42,
      isUploading: true,
      canPause: true,
      canResume: false,
      canCancel: true,
    });
  });

  it("should not re-render for byte-level changes that do not change the visible state", () => {
    let renders = 0;
    renderHook(() => {
      renders += 1;
      return useVideoUpload();
    });
    act(() => manager().deps.onChange(snapshot({ percent: 42, confirmedBytes: 420 })));
    const before = renders;

    act(() => manager().deps.onChange(snapshot({ percent: 42, confirmedBytes: 425 })));

    expect(renders).toBe(before);
  });

  it("should expose the asset id only once the upload has completed", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() => manager().deps.onChange(snapshot({ phase: "finalizing", percent: 100 })));
    expect(result.current).toMatchObject({ videoAssetId: null, isUploading: true, canCancel: false, canPause: false });

    act(() => manager().deps.onChange(snapshot({ phase: "completed", percent: 100, videoAssetId: 42 })));
    expect(result.current).toMatchObject({ videoAssetId: 42, isUploading: false, error: null });
  });

  it("should keep an interrupted upload active so a queued publish survives a connection drop", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() => manager().deps.onChange(snapshot({ phase: "interrupted", notice: "Connection problem. Retrying…" })));

    expect(result.current).toMatchObject({
      isUploading: true,
      error: null,
      notice: "Connection problem. Retrying…",
      canPause: false,
      canCancel: false,
      canResume: true,
    });
  });

  it("should offer only cancel and retry once an interrupted upload has stalled", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() => manager().deps.onChange(snapshot({ phase: "interrupted", stalled: true })));

    expect(result.current).toMatchObject({ canPause: false, canCancel: true, canResume: true });
  });

  it("should bring pause and cancel back when the upload continues after a connection problem", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() => manager().deps.onChange(snapshot({ phase: "interrupted", notice: "You're offline." })));
    act(() => manager().deps.onChange(snapshot({ phase: "uploading" })));

    expect(result.current).toMatchObject({ canPause: true, canCancel: true });
  });

  it("should surface a failure as the error message and offer retry only when it is retryable", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() =>
      manager().deps.onChange(
        snapshot({ phase: "failed", failure: { code: "storage_full", message: "Out of space", retryable: true } })
      )
    );
    expect(result.current).toMatchObject({ error: "Out of space", isUploading: false, canResume: true });

    act(() =>
      manager().deps.onChange(snapshot({ phase: "failed", failure: { code: "rejected", message: "Nope", retryable: false } }))
    );
    expect(result.current).toMatchObject({ error: "Nope", canResume: false });
  });

  it("should forward pause, resume and cancel to the manager", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() => {
      result.current.pauseUpload();
      result.current.resumeUpload();
      result.current.cancelUpload();
    });

    expect(manager().pause).toHaveBeenCalled();
    expect(manager().resume).toHaveBeenCalled();
    expect(manager().cancel).toHaveBeenCalled();
  });

  it("should expose an unfinished upload from an earlier page load and let it be discarded", () => {
    mockStored = {
      sessionId: "s",
      fingerprint: { name: "talk.mp4", size: 10, lastModified: 1 },
      confirmedBytes: 4,
      updatedAt: 1,
    };
    const { result } = renderHook(() => useVideoUpload());
    expect(result.current.pendingUpload).toEqual(mockStored);

    act(() => result.current.discardPendingUpload());

    expect(result.current.pendingUpload).toBeNull();
    expect(manager().discardStored).toHaveBeenCalled();
  });

  it("should hide the pending upload once a file is chosen", () => {
    mockStored = {
      sessionId: "s",
      fingerprint: { name: "talk.mp4", size: 10, lastModified: 1 },
      confirmedBytes: 4,
      updatedAt: 1,
    };
    const { result } = renderHook(() => useVideoUpload());

    act(() => result.current.startUpload(file));

    expect(result.current.pendingUpload).toBeNull();
  });

  it("should stop the manager on unmount without cancelling the server session", () => {
    const { unmount } = renderHook(() => useVideoUpload());
    const current = manager();

    unmount();

    expect(current.dispose).toHaveBeenCalled();
    expect(current.cancel).not.toHaveBeenCalled();
    expect(current.discardStored).not.toHaveBeenCalled();
  });

  it("should flag an expired session without logging the user out", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() => manager().deps.onEvent({ type: "failed", code: "unauthorized" }));
    act(() =>
      manager().deps.onChange(
        snapshot({ phase: "failed", failure: { code: "unauthorized", message: "Your session has expired.", retryable: false } })
      )
    );

    // Logging out would wipe the stored user, which made the page treat the user as a non-staff member.
    expect(dispatch).not.toHaveBeenCalled();
    expect(result.current.isSessionExpired).toBe(true);
    expect(mockCaptureMessage).not.toHaveBeenCalled();
  });

  it("should not flag an expired session for other failures", () => {
    const { result } = renderHook(() => useVideoUpload());

    act(() =>
      manager().deps.onChange(
        snapshot({ phase: "failed", failure: { code: "storage_full", message: "Out of space", retryable: true } })
      )
    );

    expect(result.current.isSessionExpired).toBe(false);
  });

  it("should report unexpected failures to Sentry with the failure code only", () => {
    renderHook(() => useVideoUpload());

    act(() => manager().deps.onEvent({ type: "failed", code: "unknown" }));

    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Resumable video upload failed",
      expect.objectContaining({ tags: { source: "video_upload" }, extra: { code: "unknown" } })
    );
  });

  it("should not report ordinary user-side failures to Sentry", () => {
    renderHook(() => useVideoUpload());

    act(() => manager().deps.onEvent({ type: "failed", code: "retries_exhausted" }));
    act(() => manager().deps.onEvent({ type: "failed", code: "expired" }));

    expect(mockCaptureMessage).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it.each([
    [{ type: "started", resumed: true, sizeBytes: 5 * 1024 ** 2 }, GA_EVENTS.UPLOAD_VIDEO_STARTED, { resumed: true, size_mb: 5 }],
    [{ type: "interrupted", reason: "offline", attempt: 0 }, GA_EVENTS.UPLOAD_VIDEO_INTERRUPTED, { reason: "offline" }],
    [{ type: "recovered", attempts: 3 }, GA_EVENTS.UPLOAD_VIDEO_RECOVERED, { attempts: 3 }],
    [{ type: "paused" }, GA_EVENTS.UPLOAD_VIDEO_PAUSED, {}],
    [{ type: "continued" }, GA_EVENTS.UPLOAD_VIDEO_RESUMED, {}],
    [{ type: "cancelled" }, GA_EVENTS.UPLOAD_VIDEO_CANCELLED, {}],
  ] as const)("should track %j without file names or ids", (event, name, params) => {
    renderHook(() => useVideoUpload());

    act(() => manager().deps.onEvent(event as UploadEvent));

    expect(mockSendGTMEvent).toHaveBeenCalledWith({ event: name, event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO, ...params });
  });

  it("should not track events that have no analytics meaning", () => {
    renderHook(() => useVideoUpload());

    act(() => manager().deps.onEvent({ type: "completed", durationMs: 1000 }));

    expect(mockSendGTMEvent).not.toHaveBeenCalled();
  });

  it("should keep the running manager when the current user id arrives later", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(null);
    const { result, rerender } = renderHook(() => useVideoUpload());
    act(() => result.current.startUpload(file));
    const running = manager();

    mockStored = {
      sessionId: "s",
      fingerprint: { name: "talk.mp4", size: 10, lastModified: 1 },
      confirmedBytes: 4,
      updatedAt: 1,
    };
    (useSelector as unknown as jest.Mock).mockReturnValue({ id: 7 });
    rerender();

    expect(mockManagers).toHaveLength(1);
    expect(running.dispose).not.toHaveBeenCalled();
    expect(result.current.pendingUpload).toEqual(mockStored);
  });

  it("should use an anonymous storage scope before the current user is known", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(null);
    renderHook(() => useVideoUpload());

    const storage = manager().deps.storage as unknown as { save: (record: unknown) => void };
    storage.save({ sessionId: "s", fingerprint: { name: "a", size: 1, lastModified: 1 }, confirmedBytes: 0, updatedAt: 1 });

    expect(window.localStorage.getItem("upload-video:session:v1:anonymous")).not.toBeNull();
    window.localStorage.clear();
  });

  describe("unfinished uploads", () => {
    const unfinished = (id: string): UploadSession => ({
      id,
      filename: `${id}.mp4`,
      file_size: 100,
      offset: 40,
      upload_status: "UPLOADING",
      error_code: "",
      video_asset_id: null,
      expires_at: "2030-01-01T00:00:00Z",
      chunk_size: 8,
      max_chunk_size: 16,
    });

    it("should load the unfinished uploads on mount", async () => {
      mockUnfinished = [unfinished("a"), unfinished("b")];
      const { result } = renderHook(() => useVideoUpload());
      expect(result.current.unfinishedStatus).toBe("loading");

      await waitFor(() => expect(result.current.unfinishedStatus).toBe("ready"));

      expect(result.current.unfinishedUploads.map((session) => session.id)).toEqual(["a", "b"]);
    });

    it("should report an error when the list cannot be loaded and still allow uploading", async () => {
      mockUnfinished = [];
      const { result } = renderHook(() => useVideoUpload());
      await waitFor(() => expect(result.current.unfinishedStatus).toBe("ready"));
      manager().listUnfinished.mockRejectedValueOnce(new Error("offline"));

      act(() =>
        manager().deps.onChange(snapshot({ phase: "failed", failure: { code: "unknown", message: "x", retryable: true } }))
      );

      await waitFor(() => expect(result.current.unfinishedStatus).toBe("error"));
    });

    it("should hide the upload that is running on this page from the list", async () => {
      mockUnfinished = [unfinished("a"), unfinished("b")];
      const { result } = renderHook(() => useVideoUpload());
      await waitFor(() => expect(result.current.unfinishedStatus).toBe("ready"));

      act(() => manager().deps.onChange(snapshot({ sessionId: "a" })));

      expect(result.current.unfinishedUploads.map((session) => session.id)).toEqual(["b"]);
    });

    it("should read the list again when an upload fails, so a rejected start shows what is blocking it", async () => {
      mockUnfinished = [];
      const { result } = renderHook(() => useVideoUpload());
      await waitFor(() => expect(result.current.unfinishedStatus).toBe("ready"));
      mockUnfinished = [unfinished("a")];

      act(() =>
        manager().deps.onChange(
          snapshot({ phase: "failed", failure: { code: "too_many_uploads", message: "m", retryable: false } })
        )
      );

      await waitFor(() => expect(result.current.unfinishedUploads).toHaveLength(1));
    });

    it("should read the list again only after the server has deleted a cancelled upload", async () => {
      mockUnfinished = [];
      const { result } = renderHook(() => useVideoUpload());
      await waitFor(() => expect(result.current.unfinishedStatus).toBe("ready"));
      const listCalls = manager().listUnfinished.mock.calls.length;
      let finishCancel: () => void = () => undefined;
      manager().cancel.mockReturnValueOnce(new Promise<void>((resolve) => (finishCancel = resolve)));

      act(() => {
        result.current.cancelUpload();
        manager().deps.onChange(snapshot({ phase: "cancelled" }));
      });
      expect(manager().listUnfinished).toHaveBeenCalledTimes(listCalls);

      mockUnfinished = [unfinished("a")];
      await act(async () => finishCancel());

      await waitFor(() => expect(result.current.unfinishedUploads).toHaveLength(1));
    });

    it("should ignore a list response that arrives after a newer one", async () => {
      mockUnfinished = [];
      const { result } = renderHook(() => useVideoUpload());
      await waitFor(() => expect(result.current.unfinishedStatus).toBe("ready"));
      let resolveOlder: (sessions: UploadSession[]) => void = () => undefined;
      manager().listUnfinished.mockReturnValueOnce(new Promise<UploadSession[]>((resolve) => (resolveOlder = resolve)));
      mockUnfinished = [unfinished("newer")];

      act(() => manager().deps.onChange(snapshot({ phase: "finalizing" })));
      act(() => manager().deps.onChange(snapshot({ phase: "completed" })));
      await waitFor(() => expect(result.current.unfinishedUploads.map((session) => session.id)).toEqual(["newer"]));
      await act(async () => resolveOlder([unfinished("older")]));

      expect(result.current.unfinishedUploads.map((session) => session.id)).toEqual(["newer"]);
    });

    it("should start the chosen session when continuing", () => {
      const { result } = renderHook(() => useVideoUpload());

      act(() => result.current.startUpload(file, "a"));

      expect(manager().start).toHaveBeenCalledWith(file, { sessionId: "a" });
    });

    it("should remove a deleted upload from the list and from the stored upload", async () => {
      mockUnfinished = [unfinished("a"), unfinished("b")];
      mockStored = {
        sessionId: "a",
        fingerprint: { name: "a.mp4", size: 100, lastModified: 1 },
        confirmedBytes: 40,
        updatedAt: 1,
      };
      const { result } = renderHook(() => useVideoUpload());
      await waitFor(() => expect(result.current.unfinishedStatus).toBe("ready"));

      let removed = false;
      await act(async () => {
        removed = await result.current.deleteUnfinishedUpload("a");
      });

      expect(removed).toBe(true);
      expect(manager().discardSession).toHaveBeenCalledWith("a");
      expect(result.current.unfinishedUploads.map((session) => session.id)).toEqual(["b"]);
      expect(result.current.pendingUpload).toBeNull();
    });

    it("should keep the upload listed when the server could not delete it", async () => {
      mockUnfinished = [unfinished("a")];
      const { result } = renderHook(() => useVideoUpload());
      await waitFor(() => expect(result.current.unfinishedStatus).toBe("ready"));
      manager().discardSession.mockResolvedValueOnce(false);

      let removed = true;
      await act(async () => {
        removed = await result.current.deleteUnfinishedUpload("a");
      });

      expect(removed).toBe(false);
      expect(result.current.unfinishedUploads).toHaveLength(1);
    });
  });
});
