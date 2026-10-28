import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME, REDIRECT_TO_KEY } from "./constants/constants";
import { getJwtExpiry, isPublicRoute, isValidInternalRedirectPath } from "./utils/utils";

// Expiry-only gate (no signature check): the backend enforces real authorization.
function isValidToken(token: string | undefined): boolean {
  const exp = getJwtExpiry(token);
  return exp !== null && exp > Math.floor(Date.now() / 1000);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const isAuthenticated = isValidToken(token);
  const isProtectedRoute = !isPublicRoute(pathname);

  if (isAuthenticated) {
    const redirectTo =
      request.nextUrl.searchParams?.get(REDIRECT_TO_KEY) ??
      new URLSearchParams(request.nextUrl.search || "").get(REDIRECT_TO_KEY);

    // Honored on every route, not just /login, so /videos?redirect_to=/videos/123 lands on the target.
    if (redirectTo && isValidInternalRedirectPath(redirectTo)) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/videos", request.url));
    }
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/videos", request.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
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
