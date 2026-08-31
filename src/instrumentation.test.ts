const mockCaptureRequestError = jest.fn();
const mockSentryInit = jest.fn();

jest.mock("@sentry/nextjs", () => ({
  captureRequestError: (...args: unknown[]) => mockCaptureRequestError(...args),
  init: (...args: unknown[]) => mockSentryInit(...args),
}));

const request = { path: "/videos", method: "GET", headers: {} };
const context = { routerKind: "App Router", routePath: "/videos", routeType: "render" };

describe("instrumentation", () => {
  const originalRuntime = process.env.NEXT_RUNTIME;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NEXT_RUNTIME = originalRuntime;
  });

  it("should do nothing when the runtime is neither nodejs nor edge", async () => {
    process.env.NEXT_RUNTIME = "";
    const { register } = await import("./instrumentation");

    await expect(register()).resolves.toBeUndefined();
  });

  it("should initialize the server Sentry config for the nodejs runtime", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    const { register } = await import("./instrumentation");

    await register();

    expect(mockSentryInit).toHaveBeenCalledWith(expect.objectContaining({ dsn: expect.any(String) }));
  });

  it("should initialize the edge Sentry config for the edge runtime", async () => {
    process.env.NEXT_RUNTIME = "edge";
    const { register } = await import("./instrumentation");

    await register();

    expect(mockSentryInit).toHaveBeenCalledWith(expect.objectContaining({ dsn: expect.any(String) }));
  });

  it("should not report NEXT_REDIRECT digest errors to Sentry", async () => {
    const { onRequestError } = await import("./instrumentation");
    const error = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;push;/login;307;" });

    onRequestError(error, request, context);

    expect(mockCaptureRequestError).not.toHaveBeenCalled();
  });

  it("should not report NEXT_NOT_FOUND digest errors to Sentry", async () => {
    const { onRequestError } = await import("./instrumentation");
    const error = Object.assign(new Error("NEXT_NOT_FOUND"), { digest: "NEXT_NOT_FOUND" });

    onRequestError(error, request, context);

    expect(mockCaptureRequestError).not.toHaveBeenCalled();
  });

  it("should report other errors to Sentry", async () => {
    const { onRequestError } = await import("./instrumentation");
    const error = new Error("boom");

    onRequestError(error, request, context);

    expect(mockCaptureRequestError).toHaveBeenCalledWith(error, request, context);
  });

  it("should report errors with a non-matching digest to Sentry", async () => {
    const { onRequestError } = await import("./instrumentation");
    const error = Object.assign(new Error("boom"), { digest: "SOME_OTHER_DIGEST" });

    onRequestError(error, request, context);

    expect(mockCaptureRequestError).toHaveBeenCalledWith(error, request, context);
  });
});
