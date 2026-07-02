# Authentication Module

## Responsibility

Handles all aspects of user identity: route protection, Google OAuth login, token storage, session persistence, and logout.

## Where It Lives

| Concern             | File                                                 |
| ------------------- | ---------------------------------------------------- |
| Route protection    | `src/middleware.ts`                                  |
| Login server action | `src/app/login/actions.ts`                           |
| Login UI            | `src/features/LoginPage/loginPage.tsx`               |
| Redux state         | `src/redux/login/slice.ts`                           |
| Redux selectors     | `src/redux/login/selectors.ts`                       |
| Login API mutation  | `src/redux/login/apiSlice.ts`                        |
| Session persistence | `src/redux/store/configureStore.tsx`                 |
| Token injection     | `src/redux/customBaseQuery.ts`                       |
| Security util       | `src/utils/utils.ts` (`isValidInternalRedirectPath`) |

## How It Works

### Login Flow

1. User visits any protected route (`/videos` or `/videos/*`) without a valid cookie.
2. Middleware reads the `access` HttpOnly cookie. If missing or expired (JWT `exp` check), it redirects to `/login?redirect_to=<original path>`.
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

### Middleware Route Protection

The middleware runs on every non-static request via the Next.js Edge Runtime. Order of evaluation:

```
1. Authenticated user on /login  →  redirect to redirect_to or /videos
2. Any user on / or /upload-video  →  redirect to /videos
3. Unauthenticated user on /videos or /videos/*  →  redirect to /login?redirect_to=<path>
4. Anything else  →  pass through
```

Token validation is local (no network call): the middleware decodes the JWT payload from the `access` cookie and checks `exp > now`.

### Logout Flow

`logoutAndClearCookie` (server action):

1. Deletes the `access` cookie via Next.js `cookies()` API
2. Calls `redirect("/login")` — this is a server-side redirect

The `customBaseQuery` also triggers a client-side logout: any `401` response dispatches `{ type: "login/logout" }`, which resets the Redux login state to `initialState` (all null fields).

### Session Persistence

`redux-persist` persists only the `login.session` key to `localStorage`:

- persist key: `session-portal`
- whitelist: `["login"]`
- transform filter: only saves/rehydrates the `session` sub-key (excludes `error` and `isLoading`)
- SSR fallback: uses a no-op storage when `window` is undefined

### Token Usage

`customBaseQuery` reads `selectAccessToken` from Redux state and injects `Authorization: Bearer <token>` into every API request when an access token is present.

## Key Edge Cases

| Scenario                          | Behavior                                                          |
| --------------------------------- | ----------------------------------------------------------------- |
| Expired JWT cookie                | Middleware rejects, redirects to `/login`                         |
| External URL in `redirect_to`     | `isValidInternalRedirectPath` rejects it; redirects to `/videos`  |
| Google popup closed without login | `onError` shows a notification; user stays on `/login`            |
| API returns 401                   | `customBaseQuery` dispatches logout; Redux state cleared          |
| Server-side rendering (no window) | `redux-persist` uses no-op storage to avoid crashes               |
| Login fails at backend            | Server action throws; client catches and shows error notification |

## `isValidInternalRedirectPath` Rules

Accepts a path only when ALL of the following hold:

- Is a non-empty string
- Starts with `/`
- Does not start with `//` (protocol-relative URL)
- Contains no `\`, `\n`, `\r`
- Does not contain `//` after the first character
- Parses to the same origin as `http://example.com` (catches any protocol leak)
