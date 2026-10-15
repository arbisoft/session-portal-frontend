import { NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME, API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE, BASE_URL } from "@/constants/constants";
import { reportHandledError, reportHandledMessage } from "@/utils/monitoring";

const FORWARDED_REQUEST_HEADERS = ["accept", "accept-language", "content-length", "content-type"];
const DROPPED_RESPONSE_HEADERS = ["content-encoding", "content-length", "transfer-encoding", "connection", "set-cookie"];

const jsonResponse = (body: object, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

type RouteContext = { params: Promise<{ path: string[] }> };

// BFF proxy: the browser never sees the access token. It is read from the HttpOnly cookie here
// and attached as a Bearer header. Backend endpoints all end with a trailing slash, which Next
// strips from catch-all params, so it is re-appended before the query string.
async function proxy(request: NextRequest, { params }: RouteContext): Promise<Response> {
  const { path } = await params;

  if (path.some((segment) => segment === "." || segment === ".." || segment.includes("\\"))) {
    return jsonResponse({ message: "Invalid path" }, 400);
  }

  if (request.headers.get(API_PROXY_GUARD_HEADER) !== API_PROXY_GUARD_VALUE) {
    return jsonResponse({ message: "Forbidden" }, 403);
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return jsonResponse({ message: "Authentication credentials were not provided." }, 401);
  }

  const target = `${BASE_URL}/api/v1/${path.map(encodeURIComponent).join("/")}/${request.nextUrl.search}`;

  const headers = new Headers({ Authorization: `Bearer ${token}` });
  FORWARDED_REQUEST_HEADERS.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    // The body is streamed (not buffered) so large video uploads do not sit in server memory;
    // content-length is forwarded so the backend still receives a fixed-length body.
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? (request.body ?? undefined) : undefined,
      ...(hasBody && request.body ? { duplex: "half" } : {}),
      redirect: "manual",
      cache: "no-store",
    } as RequestInit);

    const responseHeaders = new Headers(upstream.headers);
    DROPPED_RESPONSE_HEADERS.forEach((name) => responseHeaders.delete(name));

    // A rejected token would otherwise stay "valid" for the middleware (local expiry check) and trap the user.
    if (upstream.status === 401) {
      responseHeaders.append("set-cookie", `${ACCESS_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`);
    }

    // Backend 5xx responses are passed through untouched, so the proxy is the one place that sees them for
    // both RTK Query calls and XHR uploads. The query string and token are left out of the report.
    if (upstream.status >= 500) {
      reportHandledMessage(`Upstream API responded with ${upstream.status}`, {
        source: "bff_proxy",
        extra: { method: request.method, path: `/${path.join("/")}`, status: upstream.status },
      });
    }

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    // The failure is converted into a 502 below, so Next's onRequestError never sees it.
    reportHandledError(error, { source: "bff_proxy", extra: { method: request.method, path: `/${path.join("/")}` } });
    return jsonResponse({ message: "Upstream service unavailable" }, 502);
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };

export const dynamic = "force-dynamic";
