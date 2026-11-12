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
  /** `onProgress` receives the bytes of this chunk handed to the network so far, while the request is running. */
  sendChunk(
    sessionId: string,
    offset: number,
    chunk: Blob,
    checksum: string | undefined,
    signal: AbortSignal,
    onProgress?: (sentBytes: number) => void
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

const parseErrorBody = (text: string): UploadErrorBody => {
  try {
    return JSON.parse(text) as UploadErrorBody;
  } catch {
    return {};
  }
};

const toHttpError = (status: number, body: UploadErrorBody, retryAfterHeader: string | null) =>
  new UploadApiError(
    "http",
    status,
    body.code ?? `http_${status}`,
    typeof body.offset === "number" ? body.offset : undefined,
    parseRetryAfter(retryAfterHeader)
  );

const toApiError = async (response: Response) =>
  toHttpError(response.status, await readErrorBody(response), response.headers.get("retry-after"));

type ProgressRequest = {
  url: string;
  headers: Record<string, string>;
  body: Blob;
  signal: AbortSignal;
  onProgress: (sentBytes: number) => void;
};

// fetch cannot report how much of a request body has been sent, so a chunk that should show progress while it is
// uploading goes through XMLHttpRequest, whose upload events do.
const sendWithProgress = ({ url, headers, body, signal, onProgress }: ProgressRequest): Promise<UploadSession> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new UploadApiError("aborted", 0, "aborted"));
      return;
    }
    const request = new XMLHttpRequest();
    const abort = () => request.abort();
    const settle = () => signal.removeEventListener("abort", abort);
    signal.addEventListener("abort", abort, { once: true });

    request.open("PATCH", url);
    Object.entries(headers).forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded);
    };
    request.onload = () => {
      settle();
      if (request.status >= 200 && request.status < 300) {
        try {
          resolve(JSON.parse(request.responseText) as UploadSession);
        } catch {
          reject(new UploadApiError("network", request.status, "invalid_response"));
        }
        return;
      }
      reject(toHttpError(request.status, parseErrorBody(request.responseText), request.getResponseHeader("retry-after")));
    };
    request.onerror = () => {
      settle();
      reject(new UploadApiError("network", 0, "network_error"));
    };
    request.ontimeout = request.onerror;
    request.onabort = () => {
      settle();
      reject(new UploadApiError("aborted", 0, "aborted"));
    };
    request.send(body);
  });

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
    sendChunk: (sessionId, offset, chunk, checksum, signal, onProgress) => {
      const headers = {
        [API_PROXY_GUARD_HEADER]: API_PROXY_GUARD_VALUE,
        "content-type": CHUNK_CONTENT_TYPE,
        "upload-offset": String(offset),
        ...(checksum ? { "upload-checksum": checksum } : {}),
      };
      if (onProgress && typeof XMLHttpRequest !== "undefined") {
        return sendWithProgress({ url: `${BASE_PATH}${sessionPath(sessionId)}`, headers, body: chunk, signal, onProgress });
      }
      return sendJson(sessionPath(sessionId), { method: "PATCH", headers, body: chunk, signal });
    },
    requestFinalize: (sessionId, signal) => sendJson(`${sessionPath(sessionId)}/finalize`, { method: "POST", signal }),
    cancelSession: async (sessionId) => {
      await send(sessionPath(sessionId), { method: "DELETE" });
    },
  };
};
