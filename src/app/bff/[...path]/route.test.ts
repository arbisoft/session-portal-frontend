/** @jest-environment node */
import { NextRequest } from "next/server";

import { GET, POST } from "./route";

const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
jest.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const buildRequest = (url: string, init: { method?: string; cookie?: string; body?: string; omitGuard?: boolean } = {}) =>
  new NextRequest(`http://localhost${url}`, {
    method: init.method ?? "GET",
    headers: {
      ...(init.cookie ? { cookie: `access=${init.cookie}`, "content-type": "application/json" } : {}),
      ...(init.omitGuard ? {} : { "x-requested-with": "session-portal" }),
    },
    body: init.body,
  });

const ctx = (path: string[]) => ({ params: Promise.resolve({ path }) });

describe("api proxy route", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCaptureException.mockClear();
    mockCaptureMessage.mockClear();
  });

  it("should return 403 for direct browser navigation without the guard header", async () => {
    const response = await GET(buildRequest("/bff/events/all", { cookie: "tok", omitGuard: true }), ctx(["events", "all"]));

    expect(response.status).toBe(403);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should return 401 when the access cookie is missing", async () => {
    const response = await GET(buildRequest("/bff/events/all"), ctx(["events", "all"]));

    expect(response.status).toBe(401);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should reject path traversal segments", async () => {
    const response = await GET(buildRequest("/bff/x", { cookie: "t" }), ctx(["events", ".."]));

    expect(response.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should forward GET requests with bearer token and trailing slash", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "set-cookie": "a=b" } }));

    const response = await GET(buildRequest("/bff/events/all?page=2", { cookie: "tok" }), ctx(["events", "all"]));

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/events\/all\/\?page=2$/);
    expect(options.headers.get("Authorization")).toBe("Bearer tok");
    expect(options.body).toBeUndefined();
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(await response.json()).toEqual({ ok: true });
  });

  it("should forward the body for POST requests", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }));

    await POST(buildRequest("/bff/events/x", { method: "POST", cookie: "tok", body: "{}" }), ctx(["events", "x"]));

    expect(await new Response(mockFetch.mock.calls[0][1].body).text()).toBe("{}");
  });

  it("should stream the POST body with half duplex and forward its content-length", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 201 }));
    const payload = "x".repeat(1024);
    const request = new NextRequest("http://localhost/bff/events/videoassets", {
      method: "POST",
      headers: {
        cookie: "access=tok",
        "content-type": "multipart/form-data; boundary=b",
        "content-length": String(payload.length),
        "x-requested-with": "session-portal",
      },
      body: payload,
    });

    await POST(request, ctx(["events", "videoassets"]));

    const options = mockFetch.mock.calls[0][1];
    expect(options.duplex).toBe("half");
    expect(options.headers.get("content-length")).toBe(String(payload.length));
    expect(await new Response(options.body).text()).toBe(payload);
  });

  it("should send no body or duplex option for a POST without a body", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await POST(
      buildRequest("/bff/events/videoasset/a/view", { method: "POST", cookie: "tok" }),
      ctx(["events", "videoasset", "a", "view"])
    );

    const options = mockFetch.mock.calls[0][1];
    expect(options.body).toBeUndefined();
    expect(options.duplex).toBeUndefined();
  });

  it("should clear the access cookie when the upstream rejects the token", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 401 }));

    const response = await GET(buildRequest("/bff/events/all", { cookie: "tok" }), ctx(["events", "all"]));

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toMatch(/^access=; .*Max-Age=0/);
  });

  it("should pass through other upstream error statuses without touching cookies", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 500 }));

    const response = await GET(buildRequest("/bff/events/all", { cookie: "tok" }), ctx(["events", "all"]));

    expect(response.status).toBe(500);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("should report upstream 5xx responses to Sentry without the query string", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 503 }));

    await GET(buildRequest("/bff/events/all?search=secret", { cookie: "tok" }), ctx(["events", "all"]));

    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Upstream API responded with 503",
      expect.objectContaining({ extra: { method: "GET", path: "/events/all", status: 503 } })
    );
  });

  it("should not report upstream 4xx responses to Sentry", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 404 }));

    await GET(buildRequest("/bff/events/all", { cookie: "tok" }), ctx(["events", "all"]));

    expect(mockCaptureMessage).not.toHaveBeenCalled();
  });

  it("should return 502 when the upstream is unreachable", async () => {
    mockFetch.mockRejectedValue(new Error("down"));

    const response = await GET(buildRequest("/bff/events/all", { cookie: "tok" }), ctx(["events", "all"]));

    expect(response.status).toBe(502);
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "down" }),
      expect.objectContaining({ extra: { method: "GET", path: "/events/all" } })
    );
  });
});
