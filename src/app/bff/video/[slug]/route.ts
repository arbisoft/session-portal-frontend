import { NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME, BASE_URL } from "@/constants/constants";
import { reportHandledError, reportHandledMessage } from "@/utils/monitoring";

// A <video> element cannot attach the guard header or a Bearer token, so this route (outside the generic BFF proxy)
// authenticates with the HttpOnly session cookie instead. SameSite=Strict keeps other sites from riding on it.
const FORWARDED_REQUEST_HEADERS = ["range", "if-range"];
// Allow-list so nothing the backend adds (cookies, CORS, caching hints) leaks through. content-length is kept:
// the bytes are passed through untouched and the player needs it for seeking.
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "content-disposition",
  "x-content-type-options",
];
// Set here rather than inherited: the bytes are per-user, so a shared cache must never store them.
const CACHE_CONTROL = "private, no-cache";
const SLUG_PATTERN = /^[-a-zA-Z0-9_]+$/;

const jsonResponse = (body: object, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

type RouteContext = { params: Promise<{ slug: string }> };

// Streams a session video from the backend on behalf of the logged-in user. The backend checks the token on every
// request (including each Range request made when seeking), so the raw media file is never publicly reachable.
async function stream(request: NextRequest, { params }: RouteContext): Promise<Response> {
  const { slug } = await params;

  if (!SLUG_PATTERN.test(slug)) {
    return jsonResponse({ message: "Invalid video" }, 400);
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return jsonResponse({ message: "Authentication credentials were not provided." }, 401);
  }

  // Identity keeps the forwarded content-length and Range offsets valid: fetch would otherwise decode a compressed body.
  const headers = new Headers({ Authorization: `Bearer ${token}`, "accept-encoding": "identity" });
  FORWARDED_REQUEST_HEADERS.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });

  try {
    const upstream = await fetch(`${BASE_URL}/api/v1/events/videoasset/${slug}/stream/`, {
      method: request.method,
      headers,
      redirect: "manual",
      cache: "no-store",
      // Seeking aborts the previous request; this stops the backend from streaming bytes nobody will read.
      signal: request.signal,
    });

    const responseHeaders = new Headers();
    FORWARDED_RESPONSE_HEADERS.forEach((name) => {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    });

    responseHeaders.set("cache-control", CACHE_CONTROL);

    // A rejected token would otherwise stay "valid" for the proxy (local expiry check) and trap the user.
    if (upstream.status === 401) {
      responseHeaders.set("content-type", "application/json");
      responseHeaders.append("set-cookie", `${ACCESS_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`);
    }

    if (upstream.status >= 500) {
      reportHandledMessage(`Upstream video stream responded with ${upstream.status}`, {
        source: "bff_video_stream",
        extra: { slug, status: upstream.status },
      });
    }

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    // Aborted by the browser (seek, navigation, tab closed): nothing to report and nobody to answer.
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    reportHandledError(error, { source: "bff_video_stream", extra: { slug } });
    return jsonResponse({ message: "Upstream service unavailable" }, 502);
  }
}

export { stream as GET, stream as HEAD };

export const dynamic = "force-dynamic";
