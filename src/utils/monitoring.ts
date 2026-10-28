import * as Sentry from "@sentry/nextjs";

type ReportContext = { source: string; extra?: Record<string, unknown> };

type ScrubbableEvent = {
  request?: {
    url?: string;
    headers?: Record<string, unknown>;
    cookies?: unknown;
    query_string?: unknown;
    data?: unknown;
  };
};

const SENSITIVE_HEADERS = new Set(["cookie", "authorization", "proxy-authorization", "set-cookie"]);

// By default (`dataCollection`) the SDK attaches the incoming request (Cookie header, parsed cookies, query string) to every
// event. For the BFF proxy that Cookie header carries the HttpOnly access token, so it is removed before sending.
export function scrubRequestData<T extends ScrubbableEvent>(event: T): T {
  const { request } = event;
  if (!request) {
    return event;
  }

  delete request.cookies;
  delete request.query_string;
  delete request.data;

  if (request.url) {
    request.url = request.url.split("?")[0];
  }

  if (request.headers) {
    Object.keys(request.headers).forEach((name) => {
      if (SENSITIVE_HEADERS.has(name.toLowerCase())) {
        delete request.headers?.[name];
      }
    });
  }

  return event;
}

// Single entry point for client-side code (redux, hooks) that handles an error itself but still wants it reported.
// Callers pass an endpoint path and a status only: never query strings, tokens or response bodies.
export const reportHandledError = (error: unknown, { source, extra }: ReportContext) =>
  Sentry.captureException(error, { tags: { source }, extra });

export const reportHandledMessage = (message: string, { source, extra }: ReportContext) =>
  Sentry.captureMessage(message, { level: "error", tags: { source }, extra });
