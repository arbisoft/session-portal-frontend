import { NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME, API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE, BASE_URL } from "@/constants/constants";

const FORWARDED_REQUEST_HEADERS = ["accept", "accept-language", "content-type"];
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
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers(upstream.headers);
    DROPPED_RESPONSE_HEADERS.forEach((name) => responseHeaders.delete(name));

    // A rejected token would otherwise stay "valid" for the middleware (local expiry check) and trap the user.
    if (upstream.status === 401) {
      responseHeaders.append("set-cookie", `${ACCESS_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`);
    }

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return jsonResponse({ message: "Upstream service unavailable" }, 502);
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };

export const dynamic = "force-dynamic";
