/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET, HEAD } from "./route";

const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
jest.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
}));

const ETAG = JSON.stringify("etag");
const mockFetch = jest.fn();
global.fetch = mockFetch;

const buildRequest = (init: { cookie?: string; headers?: Record<string, string>; method?: string; signal?: AbortSignal } = {}) =>
  new NextRequest("http://localhost/bff/video/my-talk", {
    method: init.method ?? "GET",
    headers: { ...(init.cookie ? { cookie: `access=${init.cookie}` } : {}), ...init.headers },
    signal: init.signal,
  });

const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("video stream route", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCaptureException.mockClear();
    mockCaptureMessage.mockClear();
  });

  it("should return 401 without calling the backend when the access cookie is missing", async () => {
    const response = await GET(buildRequest(), ctx("my-talk"));

    expect(response.status).toBe(401);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it.each(["../admin", "a/b", "a b", "a.mp4", ""])("should reject the invalid slug %p", async (slug) => {
    const response = await GET(buildRequest({ cookie: "tok" }), ctx(slug));

    expect(response.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should attach the Bearer token from the cookie and forward Range headers", async () => {
    mockFetch.mockResolvedValue(new Response("abc", { status: 206, headers: { "content-range": "bytes 0-2/10" } }));

    await GET(buildRequest({ cookie: "tok", headers: { range: "bytes=0-2", "if-range": ETAG, "x-evil": "1" } }), ctx("my-talk"));

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/events\/videoasset\/my-talk\/stream\/$/);
    const sent = init.headers as Headers;
    expect(sent.get("authorization")).toBe("Bearer tok");
    expect(sent.get("range")).toBe("bytes=0-2");
    expect(sent.get("if-range")).toBe(ETAG);
    expect(sent.get("x-evil")).toBeNull();
    expect(sent.get("accept-encoding")).toBe("identity");
    expect(init.redirect).toBe("manual");
  });

  it("should pass the partial content response through with only allow-listed headers", async () => {
    mockFetch.mockResolvedValue(
      new Response("abc", {
        status: 206,
        headers: {
          "content-type": "video/mp4",
          "content-length": "3",
          "content-range": "bytes 0-2/10",
          "accept-ranges": "bytes",
          "cache-control": "public, max-age=31536000",
          "set-cookie": "sessionid=leak",
          "access-control-allow-origin": "*",
        },
      })
    );

    const response = await GET(buildRequest({ cookie: "tok", headers: { range: "bytes=0-2" } }), ctx("my-talk"));

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 0-2/10");
    expect(response.headers.get("content-length")).toBe("3");
    expect(response.headers.get("content-type")).toBe("video/mp4");
    expect(response.headers.get("cache-control")).toBe("private, no-cache");
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect(await response.text()).toBe("abc");
  });

  it("should clear the access cookie when the backend rejects the token", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 401 }));

    const response = await GET(buildRequest({ cookie: "expired" }), ctx("my-talk"));

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toContain("access=; Path=/; Max-Age=0");
  });

  it("should pass a 404 through without cookies", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 404 }));

    const response = await GET(buildRequest({ cookie: "tok" }), ctx("missing"));

    expect(response.status).toBe(404);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("should report backend 5xx responses without the token", async () => {
    mockFetch.mockResolvedValue(new Response("boom", { status: 500 }));

    await GET(buildRequest({ cookie: "secret-token" }), ctx("my-talk"));

    expect(mockCaptureMessage).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(mockCaptureMessage.mock.calls)).not.toContain("secret-token");
  });

  it("should return 502 and report when the backend is unreachable", async () => {
    mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const response = await GET(buildRequest({ cookie: "tok" }), ctx("my-talk"));

    expect(response.status).toBe(502);
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
  });

  it("should not report when the browser aborted the request", async () => {
    const controller = new AbortController();
    controller.abort();
    mockFetch.mockRejectedValue(new Error("aborted"));

    const response = await GET(buildRequest({ cookie: "tok", signal: controller.signal }), ctx("my-talk"));

    expect(response.status).toBe(499);
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it("should forward HEAD requests as HEAD", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await HEAD(buildRequest({ cookie: "tok", method: "HEAD" }), ctx("my-talk"));

    expect(mockFetch.mock.calls[0][1].method).toBe("HEAD");
  });
});
