import { reportHandledError, reportHandledMessage, scrubRequestData } from "./monitoring";

const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();

jest.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
}));

describe("scrubRequestData", () => {
  it("should remove cookies, auth headers, query string and body from the request", () => {
    const event = scrubRequestData({
      request: {
        url: "https://portal.test/bff/events/all?search=secret",
        headers: { Cookie: "access=jwt", Authorization: "Bearer jwt", accept: "application/json" },
        cookies: { access: "jwt" },
        query_string: "search=secret",
        data: { email: "a@b.c" },
      },
    });

    expect(event.request).toEqual({
      url: "https://portal.test/bff/events/all",
      headers: { accept: "application/json" },
    });
  });

  it("should leave events without a request untouched", () => {
    expect(scrubRequestData({})).toEqual({});
  });

  it("should handle a request without a url or headers", () => {
    expect(scrubRequestData({ request: { cookies: "access=jwt" } })).toEqual({ request: {} });
  });
});

describe("reporting helpers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should capture handled errors with a source tag", () => {
    const error = new Error("boom");

    reportHandledError(error, { source: "rtk_query", extra: { endpoint: "/events" } });

    expect(mockCaptureException).toHaveBeenCalledWith(error, { tags: { source: "rtk_query" }, extra: { endpoint: "/events" } });
  });

  it("should capture handled messages at error level", () => {
    reportHandledMessage("bad", { source: "video_upload" });

    expect(mockCaptureMessage).toHaveBeenCalledWith("bad", {
      level: "error",
      tags: { source: "video_upload" },
      extra: undefined,
    });
  });
});
