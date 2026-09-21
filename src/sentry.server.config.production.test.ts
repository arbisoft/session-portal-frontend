export {};

const mockSentryInit = jest.fn();

jest.mock("@sentry/nextjs", () => ({
  init: (...args: unknown[]) => mockSentryInit(...args),
}));

// One module instance per file keeps v8 branch coverage attributable, so each NODE_ENV variant lives in its own file.
(process.env as Record<string, string | undefined>).NODE_ENV = "production";

describe("sentry.server.config in production", () => {
  it("should sample 10% of traces", () => {
    require("../sentry.server.config");

    expect(mockSentryInit).toHaveBeenCalledWith(expect.objectContaining({ tracesSampleRate: 0.1 }));
  });
});
