import { CHUNK_CONTENT_TYPE, createUploadApi, UploadApiError } from "./transport";

const session = { id: "abc", offset: 4, upload_status: "UPLOADING" };
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers });

describe("createUploadApi", () => {
  const fetchImpl = jest.fn();
  const api = createUploadApi(fetchImpl);

  beforeEach(() => fetchImpl.mockReset());

  it("should create a session through the BFF with the guard header and a JSON body", async () => {
    fetchImpl.mockResolvedValue(json(session, 201));

    await expect(api.createSession({ filename: "a.mp4", file_size: 9, client_key: "key-12345" })).resolves.toEqual(session);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/bff/events/videoassets");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "x-requested-with": "session-portal", "content-type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ filename: "a.mp4", file_size: 9, client_key: "key-12345" });
    expect(init.cache).toBe("no-store");
  });

  it("should query a session by id", async () => {
    fetchImpl.mockResolvedValue(json(session));

    await api.getSession("abc");

    expect(fetchImpl.mock.calls[0][0]).toBe("/bff/events/videoassets/abc");
    expect(fetchImpl.mock.calls[0][1].method).toBe("GET");
  });

  it("should encode the session id so a stored value cannot change the request path", async () => {
    fetchImpl.mockResolvedValue(json(session));

    await api.getSession("../users/me");

    expect(fetchImpl.mock.calls[0][0]).toBe("/bff/events/videoassets/..%2Fusers%2Fme");
  });

  it("should send a chunk with the offset, content type and checksum headers", async () => {
    fetchImpl.mockResolvedValue(json(session));
    const chunk = new Blob(["data"]);
    const { signal } = new AbortController();

    await api.sendChunk("abc", 8, chunk, "sha256 AAAA", signal);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/bff/events/videoassets/abc");
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(chunk);
    expect(init.signal).toBe(signal);
    expect(init.headers).toMatchObject({
      "content-type": CHUNK_CONTENT_TYPE,
      "upload-offset": "8",
      "upload-checksum": "sha256 AAAA",
      "x-requested-with": "session-portal",
    });
  });

  it("should omit the checksum header when there is none", async () => {
    fetchImpl.mockResolvedValue(json(session));

    await api.sendChunk("abc", 0, new Blob(["x"]), undefined, new AbortController().signal);

    expect(fetchImpl.mock.calls[0][1].headers).not.toHaveProperty("upload-checksum");
  });

  it("should request finalization and cancel through their own paths", async () => {
    fetchImpl.mockResolvedValueOnce(json(session, 202)).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await api.requestFinalize("abc");
    await expect(api.cancelSession("abc")).resolves.toBeUndefined();

    expect(fetchImpl.mock.calls[0][0]).toBe("/bff/events/videoassets/abc/finalize");
    expect(fetchImpl.mock.calls[1][0]).toBe("/bff/events/videoassets/abc");
    expect(fetchImpl.mock.calls[1][1].method).toBe("DELETE");
  });

  it("should turn an API error body into a typed error with the offset", async () => {
    fetchImpl.mockResolvedValue(json({ code: "offset_mismatch", detail: "x", offset: 12 }, 409));

    await expect(api.getSession("abc")).rejects.toMatchObject({
      kind: "http",
      status: 409,
      code: "offset_mismatch",
      offset: 12,
    });
  });

  it("should expose Retry-After in milliseconds", async () => {
    fetchImpl.mockResolvedValue(json({}, 429, { "retry-after": "3" }));

    await expect(api.getSession("abc")).rejects.toMatchObject({ status: 429, code: "http_429", retryAfterMs: 3000 });
  });

  it("should cope with an error response that is not JSON", async () => {
    fetchImpl.mockResolvedValue(new Response("<html>", { status: 502 }));

    await expect(api.getSession("abc")).rejects.toMatchObject({ kind: "http", status: 502, code: "http_502" });
  });

  it("should report a network failure", async () => {
    fetchImpl.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(api.getSession("abc")).rejects.toMatchObject({ kind: "network", code: "network_error" });
  });

  it("should report an aborted request distinctly", async () => {
    fetchImpl.mockRejectedValue(new DOMException("aborted", "AbortError"));

    const error = await api.getSession("abc").catch((caught: UploadApiError) => caught);

    expect(error).toBeInstanceOf(UploadApiError);
    expect(error).toMatchObject({ kind: "aborted", code: "aborted" });
  });

  it("should use the global fetch by default", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(session));

    await createUploadApi().getSession("abc");

    expect(fetchMock).toHaveBeenCalledWith("/bff/events/videoassets/abc", expect.objectContaining({ method: "GET" }));
  });
});

type Listener = (event?: unknown) => void;

class FakeXhr {
  static last: FakeXhr;
  method = "";
  url = "";
  headers: Record<string, string> = {};
  body: unknown = null;
  status = 0;
  responseText = "";
  responseHeaders: Record<string, string> = {};
  aborted = false;
  upload: { onprogress: ((event: { lengthComputable: boolean; loaded: number }) => void) | null } = { onprogress: null };
  onload: Listener | null = null;
  onerror: Listener | null = null;
  ontimeout: Listener | null = null;
  onabort: Listener | null = null;

  constructor() {
    FakeXhr.last = this;
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
  }

  getResponseHeader(name: string) {
    return this.responseHeaders[name.toLowerCase()] ?? null;
  }

  send(body: unknown) {
    this.body = body;
  }

  abort() {
    this.aborted = true;
    this.onabort?.();
  }

  respond(status: number, body: unknown, headers: Record<string, string> = {}) {
    this.status = status;
    this.responseText = typeof body === "string" ? body : JSON.stringify(body);
    this.responseHeaders = headers;
    this.onload?.();
  }
}

describe("sendChunk with upload progress", () => {
  const fetchImpl = jest.fn();
  const api = createUploadApi(fetchImpl);
  const realXhr = globalThis.XMLHttpRequest;

  beforeEach(() => {
    fetchImpl.mockReset();
    globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = realXhr;
  });

  it("should send the chunk with the same headers and report the bytes sent while it uploads", async () => {
    const chunk = new Blob(["data"]);
    const onProgress = jest.fn();

    const result = api.sendChunk("abc", 8, chunk, "sha256 AAAA", new AbortController().signal, onProgress);
    const xhr = FakeXhr.last;
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 2 });
    xhr.upload.onprogress?.({ lengthComputable: false, loaded: 3 });
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 4 });
    xhr.respond(200, session);

    await expect(result).resolves.toEqual(session);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(xhr.method).toBe("PATCH");
    expect(xhr.url).toBe("/bff/events/videoassets/abc");
    expect(xhr.body).toBe(chunk);
    expect(xhr.headers).toMatchObject({
      "content-type": CHUNK_CONTENT_TYPE,
      "upload-offset": "8",
      "upload-checksum": "sha256 AAAA",
      "x-requested-with": "session-portal",
    });
    expect(onProgress.mock.calls).toEqual([[2], [4]]);
  });

  it("should turn an error response into the same error as the fetch path, with offset and retry delay", async () => {
    const result = api.sendChunk("abc", 8, new Blob(["x"]), undefined, new AbortController().signal, jest.fn());
    FakeXhr.last.respond(409, { code: "offset_mismatch", offset: 12 }, { "retry-after": "3" });

    await expect(result).rejects.toMatchObject({
      kind: "http",
      status: 409,
      code: "offset_mismatch",
      offset: 12,
      retryAfterMs: 3000,
    });
  });

  it("should fall back to a generic code when the error body is not JSON", async () => {
    const result = api.sendChunk("abc", 0, new Blob(["x"]), undefined, new AbortController().signal, jest.fn());
    FakeXhr.last.respond(502, "<html>bad gateway</html>");

    await expect(result).rejects.toMatchObject({ kind: "http", status: 502, code: "http_502" });
  });

  it("should report a connection failure as a network error", async () => {
    const result = api.sendChunk("abc", 0, new Blob(["x"]), undefined, new AbortController().signal, jest.fn());
    FakeXhr.last.onerror?.();

    await expect(result).rejects.toMatchObject({ kind: "network", code: "network_error" });
  });

  it("should abort the request when the signal fires", async () => {
    const controller = new AbortController();
    const result = api.sendChunk("abc", 0, new Blob(["x"]), undefined, controller.signal, jest.fn());

    controller.abort();

    await expect(result).rejects.toMatchObject({ kind: "aborted" });
    expect(FakeXhr.last.aborted).toBe(true);
  });

  it("should not start a request when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const before = FakeXhr.last;

    await expect(api.sendChunk("abc", 0, new Blob(["x"]), undefined, controller.signal, jest.fn())).rejects.toMatchObject({
      kind: "aborted",
    });
    expect(FakeXhr.last).toBe(before);
  });

  it("should reject a success response that is not JSON", async () => {
    const result = api.sendChunk("abc", 0, new Blob(["x"]), undefined, new AbortController().signal, jest.fn());
    FakeXhr.last.respond(200, "not json");

    await expect(result).rejects.toMatchObject({ kind: "network", code: "invalid_response" });
  });
});
