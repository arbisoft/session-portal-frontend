import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME, REDIRECT_TO_KEY } from "./constants/constants";
import { getJwtExpiry, isValidInternalRedirectPath } from "./utils/utils";

// Fail closed: every route requires authentication unless listed here.
const publicRoutes = ["/login"];

// Expiry-only gate (no signature check): the backend enforces real authorization.
function isValidToken(token: string | undefined): boolean {
  const exp = getJwtExpiry(token);
  return exp !== null && exp > Math.floor(Date.now() / 1000);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Get token from cookies
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const isProtectedRoute = !publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isValidToken(token) && pathname === "/login") {
    const redirectTo =
      request.nextUrl.searchParams?.get(REDIRECT_TO_KEY) ??
      new URLSearchParams(request.nextUrl.search || "").get(REDIRECT_TO_KEY);

    // Prefer explicit redirect target if provided (e.g. /videos/123) after login.
    if (redirectTo && isValidInternalRedirectPath(redirectTo)) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.redirect(new URL("/videos", request.url));
  }

  if (pathname === "/" || pathname === "/upload-video") {
    return NextResponse.redirect(new URL("/videos", request.url));
  }

  if (isProtectedRoute && !isValidToken(token)) {
    // Redirect to login with redirect_to parameter
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(REDIRECT_TO_KEY, pathname.concat(search));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api, bff (API routes and the BFF proxy)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static file extensions only (a blanket "any dot" exclusion would let a page slug like /videos/a.b skip auth)
     */
    // Must stay a single static literal for Next's matcher analysis, so it cannot be split.
    // eslint-disable-next-line max-len
    "/((?!api|bff/|assets|.well-known|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|webp|svg|ico|json|webmanifest|txt|xml)$).*)", // NOSONAR typescript:S7780 - Next needs a plain literal, String.raw breaks the build
  ],
};
