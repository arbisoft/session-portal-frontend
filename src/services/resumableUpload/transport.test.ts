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
