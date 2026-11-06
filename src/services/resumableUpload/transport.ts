import { API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE, API_PROXY_PREFIX } from "@/constants/constants";
import { events } from "@/endpoints";
import { UploadErrorBody, UploadSession, UploadSessionRequest } from "@/models/Events";
import { parseRetryAfter, UploadErrorKind } from "@/utils/upload";

export const CHUNK_CONTENT_TYPE = "application/offset+octet-stream";

export class UploadApiError extends Error {
  readonly kind: UploadErrorKind;
  readonly status: number;
  readonly code: string;
  readonly offset?: number;
  readonly retryAfterMs?: number;

  constructor(kind: UploadErrorKind, status: number, code: string, offset?: number, retryAfterMs?: number) {
    super(`Upload request failed (${kind} ${status} ${code})`);
    this.name = "UploadApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.offset = offset;
    this.retryAfterMs = retryAfterMs;
  }
}

export interface UploadApi {
  createSession(body: UploadSessionRequest, signal?: AbortSignal): Promise<UploadSession>;
  getSession(sessionId: string, signal?: AbortSignal): Promise<UploadSession>;
  sendChunk(
    sessionId: string,
    offset: number,
    chunk: Blob,
    checksum: string | undefined,
    signal: AbortSignal
  ): Promise<UploadSession>;
  requestFinalize(sessionId: string, signal?: AbortSignal): Promise<UploadSession>;
  cancelSession(sessionId: string): Promise<void>;
}

const BASE_PATH = `${API_PROXY_PREFIX}${events.uploadVideoAsset.replace(/\/$/, "")}`;

// The session id comes from the server but is also read back from localStorage, so it is encoded before joining the path.
const sessionPath = (sessionId: string) => `/${encodeURIComponent(sessionId)}`;

const readErrorBody = async (response: Response): Promise<UploadErrorBody> => {
  try {
    return (await response.json()) as UploadErrorBody;
  } catch {
    return {};
  }
};

const toApiError = async (response: Response) => {
  const body = await readErrorBody(response);
  const offset = typeof body.offset === "number" ? body.offset : undefined;
  return new UploadApiError(
    "http",
    response.status,
    body.code ?? `http_${response.status}`,
    offset,
    parseRetryAfter(response.headers.get("retry-after"))
  );
};

// Goes through the BFF proxy, which attaches the access token from the HttpOnly cookie. The token never reaches this code.
export const createUploadApi = (fetchImpl: typeof fetch = (...args) => fetch(...args)): UploadApi => {
  const send = async (path: string, init: RequestInit): Promise<Response> => {
    let response: Response;
    try {
      response = await fetchImpl(`${BASE_PATH}${path}`, {
        ...init,
        headers: { [API_PROXY_GUARD_HEADER]: API_PROXY_GUARD_VALUE, ...init.headers },
        cache: "no-store",
      });
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      throw new UploadApiError(aborted ? "aborted" : "network", 0, aborted ? "aborted" : "network_error");
    }
    if (!response.ok) throw await toApiError(response);
    return response;
  };

  const sendJson = async (path: string, init: RequestInit): Promise<UploadSession> => {
    const response = await send(path, init);
    return (await response.json()) as UploadSession;
  };

  return {
    createSession: (body, signal) =>
      sendJson("", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal }),
    getSession: (sessionId, signal) => sendJson(sessionPath(sessionId), { method: "GET", signal }),
    sendChunk: (sessionId, offset, chunk, checksum, signal) =>
      sendJson(sessionPath(sessionId), {
        method: "PATCH",
        headers: {
          "content-type": CHUNK_CONTENT_TYPE,
          "upload-offset": String(offset),
          ...(checksum ? { "upload-checksum": checksum } : {}),
        },
        body: chunk,
        signal,
      }),
    requestFinalize: (sessionId, signal) => sendJson(`${sessionPath(sessionId)}/finalize`, { method: "POST", signal }),
    cancelSession: async (sessionId) => {
      await send(sessionPath(sessionId), { method: "DELETE" });
    },
  };
};
