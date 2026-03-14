import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { REDIRECT_TO_KEY } from "./constants/constants";

// Protected routes that require authentication
const protectedRoutes = ["/videos"];

// Utility to validate JWT token (check presence and expiry)
function isValidToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    // Decode JWT payload (second part)
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));

    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedPayload.exp > currentTime;
  } catch {
    // Invalid token format
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Get token from cookies
  const token = request.cookies.get("access")?.value;
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith("/videos/"));

  if (isValidToken(token) && pathname === "/login") {
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|assets|.well-known|_next/static|_next/image|favicon.ico).*)",
  ],
};
