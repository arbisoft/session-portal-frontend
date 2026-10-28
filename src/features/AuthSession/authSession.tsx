"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { REDIRECT_TO_KEY } from "@/constants/constants";
import { ALLOWED_PAGES } from "@/hooks/useNavigation";
import { useLazyGetMeQuery } from "@/redux/login/apiSlice";
import { isPublicRoute, isValidInternalRedirectPath } from "@/utils/utils";

// Verifies the session with `GET /users/me` on load and on every navigation to a protected route.
// The proxy only checks the cookie's expiry locally, so this is where a revoked or invalid token is caught.
export default function AuthSession() {
  const pathname = usePathname();
  const router = useRouter();
  // Lazy on purpose: every call hits the backend instead of reusing a cached result (or a cached 401)
  // that may belong to a previous session.
  const [verifySession] = useLazyGetMeQuery();

  useEffect(() => {
    if (isPublicRoute(pathname)) return;

    // RTK Query ignores a new request while an aborted one for the same endpoint is still settling, so firing
    // straight away would lose the call whenever the effect re-runs at once (React StrictMode in dev, a quick
    // navigation). Deferring a tick lets that cleanup cancel the pending call before it ever starts.
    let verification: ReturnType<typeof verifySession> | undefined;
    const timer = setTimeout(() => {
      verification = verifySession();

      verification.unwrap().catch((error: { status?: unknown }) => {
        // Other failures (network, 5xx) are not proof of a bad token, so the session is kept.
        // An aborted verification carries no status either, so it lands here too.
        if (error.status !== 401) return;

        // `customBaseQuery` has already reset the Redux login state and the BFF proxy cleared the cookie.
        const redirectTo = `${pathname}${globalThis.location.search}`;
        const query = isValidInternalRedirectPath(redirectTo) ? `?${REDIRECT_TO_KEY}=${encodeURIComponent(redirectTo)}` : "";
        router.replace(`${ALLOWED_PAGES.login}${query}`);
      });
    }, 0);

    // A superseded or unmounted verification must not write a stale user into Redux after a logout or a newer navigation.
    return () => {
      clearTimeout(timer);
      verification?.abort();
    };
  }, [pathname, router, verifySession]);

  return null;
}
