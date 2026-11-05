# Authentication Module

## Responsibility

Handles all aspects of user identity: route protection, Google OAuth login, server-side session verification, token storage, session persistence, and logout.

## Where It Lives

| Concern              | File                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| Route protection     | `src/proxy.ts`                                                               |
| Login server action  | `src/app/login/actions.ts`                                                   |
| Login UI             | `src/features/LoginPage/loginPage.tsx`                                       |
| Redux state          | `src/redux/login/slice.ts`                                                   |
| Redux selectors      | `src/redux/login/selectors.ts`                                               |
| Login API mutation   | `src/redux/login/apiSlice.ts`                                                |
| Session verification | `src/features/AuthSession/authSession.tsx` (mounted in `src/app/layout.tsx`) |
| Current user query   | `src/redux/login/apiSlice.ts` (`getMe`, `useLazyGetMeQuery`)                 |
| Session persistence  | `src/redux/store/configureStore.tsx`                                         |
| Token injection      | `src/redux/customBaseQuery.ts`                                               |
| Security util        | `src/utils/utils.ts` (`isValidInternalRedirectPath`, `isPublicRoute`)        |

## How It Works

### Login Flow

1. User visits any protected route (any route other than `/login`, since the proxy fails closed) without a valid cookie.
2. The proxy reads the `access` HttpOnly cookie. If missing or expired (JWT `exp` check), it redirects to `/login?redirect_to=<original path>`.
3. `LoginPage` reads `redirect_to` from URL params and validates it with `isValidInternalRedirectPath` to prevent open-redirect attacks.
4. User clicks "Sign in with Google". `useGoogleLogin` from `@react-oauth/google` opens the Google popup.
5. On Google success, `LoginPage` calls the `loginAndSetCookie` Next.js server action with the Google `access_token`.
6. **Server action** (`loginAndSetCookie`):
   - POSTs `{ auth_token: <google_access_token> }` to `POST /api/v1/users/login`
   - Decodes the returned JWT to get `exp`, computes `maxAge` as `exp − now` (minimum 1 hour enforced via `Math.max`); falls back to 7 days if JWT decoding fails
   - Sets an `access` HttpOnly cookie (`secure` in production, `sameSite: strict`)
   - Returns the full `LoginResponse` to the client
7. Client dispatches `loginActions.login(data)` to update Redux state with session data (access token, refresh token, user info).
8. Client navigates to `redirect_to` (if valid) or `/videos`.

### Session Verification (`GET /users/me`)

The proxy only checks the cookie's expiry locally, so a revoked, malformed or deactivated-user token still passes it. `AuthSession` closes that gap:

1. On load, and on every pathname change to a non-public route (`isPublicRoute`), it calls `verifySession()` (`useLazyGetMeQuery`) one tick later (`setTimeout(0)`). The lazy trigger always sends a request, so a cached result or a cached `401` from an earlier session is never reused. The tick matters: RTK Query ignores a new request while an aborted one for the same endpoint is still settling, so an effect that re-runs at once (React StrictMode in development, a quick navigation) would otherwise lose the call and never store the user; the cleanup clears the timer before that request starts. The effect cleanup also aborts the in-flight request, so a superseded navigation, an unmount or a logout can never write a stale user into Redux (an aborted request carries no `status` and is treated like any other non-`401` failure).
2. The request goes through the BFF proxy (`/bff/users/me`), which attaches `Authorization: Bearer <cookie>`. The backend validates the token with `JWTAuthentication`.
3. On success, the `getMe` fulfilled matcher in `src/redux/login/slice.ts` stores the user in `login.currentUser` and syncs `first_name`, `last_name`, `full_name` and `is_staff` into `session.user_info` (the avatar from login is kept). `currentUser` is not persisted, so it is only set once the backend accepted the token in this page load.
4. On `401`, `customBaseQuery` resets Redux login state and the BFF proxy clears the `access` cookie; `AuthSession` then replaces the route with `/login?redirect_to=<path+query>` (omitted when the path fails `isValidInternalRedirectPath`).
5. Any other failure (network error, 5xx) keeps the session: it is not proof of a bad token. No error toast is shown for this query (`showErrorToast: false`).

Read the verified user with `selectCurrentUser`, `selectIsAuthenticated` and `selectUserRole` from `src/redux/login/selectors.ts`.

### Proxy Route Protection

The proxy runs on every non-static request (Next.js 16 `proxy.ts`, Node.js runtime). Order of evaluation:

```
1. Authenticated user on any route with a valid redirect_to  →  redirect to redirect_to; on /login without one  →  /videos
2. Any user on /  →  redirect to /videos
3. Unauthenticated user on any route other than /login (fail-closed: `PUBLIC_ROUTES = ["/login"]`, checked with `isPublicRoute`)  →  redirect to /login?redirect_to=<path>
4. Anything else  →  pass through
```

Token validation is local (no network call): the proxy decodes the JWT payload from the `access` cookie and checks `exp > now`.

### Logout Flow

`logoutAndClearCookie` (server action):

1. Deletes the `access` cookie via Next.js `cookies()` API
2. Calls `redirect("/login")` — this is a server-side redirect

The `customBaseQuery` also triggers a client-side logout: any `401` response dispatches `logout()` (from `src/redux/login/actions.ts`), which resets the Redux login state to `initialState` (all null fields).

### Session Persistence

`redux-persist` persists only the `login.session` key to `localStorage`. Because tokens are `null` in client state, only the user profile is stored (persist version 2: migration 1 scrubs any legacy persisted tokens, migration 2 defaults `user_info.is_staff` to `false` for sessions persisted before the field existed):

- persist key: `session-portal`
- whitelist: `["login"]`
- transform filter: only saves/rehydrates the `session` sub-key (excludes `error` and `isLoading`)
- SSR fallback: uses a no-op storage when `window` is undefined

### Token Usage

The token never reaches client JS. `customBaseQuery` sends requests to the BFF proxy (`src/app/bff/[...path]/route.ts`), which reads the HttpOnly `access` cookie and injects `Authorization: Bearer <token>` server-side. The proxy returns `401` when the cookie is missing.

## Key Edge Cases

| Scenario                                             | Behavior                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Expired JWT cookie                                   | Proxy rejects, redirects to `/login`                                                                    |
| External URL in `redirect_to`                        | `isValidInternalRedirectPath` rejects it; `/login` redirects to `/videos`, other routes render normally |
| Nested `redirect_to` (`/videos?redirect_to=/videos`) | Each hop unwraps one level, so the chain always terminates                                              |
| Google popup closed without login                    | `onError` shows a notification; user stays on `/login`                                                  |
| API returns 401                                      | `customBaseQuery` dispatches logout; Redux state cleared                                                |
| `/users/me` returns 401                              | `AuthSession` redirects to `/login?redirect_to=<path>`                                                  |
| `/users/me` fails with 5xx/network                   | Session kept; verified again on the next navigation                                                     |
| Server-side rendering (no window)                    | `redux-persist` uses no-op storage to avoid crashes                                                     |
| Login fails at backend                               | Server action throws; client catches and shows error notification                                       |

## `isValidInternalRedirectPath` Rules

Accepts a path only when ALL of the following hold:

- Is a non-empty string
- Starts with `/`
- Does not start with `//` (protocol-relative URL)
- Contains no `\`, `\n`, `\r`
- Does not contain `//` after the first character
- Parses to the same origin as `http://example.com` (catches any protocol leak)
