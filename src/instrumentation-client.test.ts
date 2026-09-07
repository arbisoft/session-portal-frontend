const mockInit = jest.fn();
const mockCaptureRouterTransitionStart = jest.fn();
const mockReplayIntegration = jest.fn(() => "replay-integration");

jest.mock("@sentry/nextjs", () => ({
  init: (...args: unknown[]) => mockInit(...args),
  captureRouterTransitionStart: (...args: unknown[]) => mockCaptureRouterTransitionStart(...args),
  replayIntegration: () => mockReplayIntegration(),
}));

const mockRecoverFromChunkLoadError = jest.fn();

jest.mock("@/utils/chunkLoadRecovery", () => ({
  recoverFromChunkLoadError: (...args: unknown[]) => mockRecoverFromChunkLoadError(...args),
}));

describe("instrumentation-client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should initialize Sentry and expose onRouterTransitionStart", async () => {
    const instrumentation = await import("./instrumentation-client");

    expect(mockInit).toHaveBeenCalledWith(expect.objectContaining({ dsn: expect.any(String) }));

    instrumentation.onRouterTransitionStart("/videos", "push");
    expect(mockCaptureRouterTransitionStart).toHaveBeenCalledWith("/videos", "push");
  });

  it("should attempt chunk load recovery on unhandledrejection with an Error reason", async () => {
    await import("./instrumentation-client");

    const error = new Error("Failed to load chunk foo.js from module 123");
    const event = Object.assign(new Event("unhandledrejection"), { reason: error });
    window.dispatchEvent(event);

    expect(mockRecoverFromChunkLoadError).toHaveBeenCalledWith(error);
  });

  it("should not attempt chunk load recovery when the rejection reason is not an Error", async () => {
    await import("./instrumentation-client");

    const event = Object.assign(new Event("unhandledrejection"), { reason: "some string" });
    window.dispatchEvent(event);

    expect(mockRecoverFromChunkLoadError).not.toHaveBeenCalled();
  });

  it("should attempt chunk load recovery on a global error event with an Error", async () => {
    await import("./instrumentation-client");

    const error = new Error("Failed to load chunk foo.js from module 123");
    window.dispatchEvent(new ErrorEvent("error", { error }));

    expect(mockRecoverFromChunkLoadError).toHaveBeenCalledWith(error);
  });
});
