# Architecture

## High-Level Architecture

The project uses a client-heavy Next.js App Router frontend with shared providers defined at the root layout level.

```text
App Router pages
  -> feature-level page components
    -> reusable UI components
      -> hooks + Redux selectors/query hooks
        -> RTK Query base API
          -> backend HTTP API
```

## Root Composition

`src/app/layout.tsx` wires the top-level providers and cross-cutting concerns:

- `InitColorSchemeScript` (first child of `<body>`; `<html>` carries `suppressHydrationWarning` because the script sets the color-scheme class before hydration)
- `GoogleOAuthProvider`
- Redux `Providers`
- Custom MUI `ThemeProvider`
- `CssBaseline`
- `NotificationProvider`, which wraps `AuthSession` (session verification, renders nothing) and the page `children`
- Google Tag Manager injection
- Hotjar initialization script

## Architectural Layers

### 1. Route layer

Files in `src/app/` define route entry points and metadata.

Examples:

- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/videos/page.tsx`
- `src/app/videos/[videoId]/page.tsx`
- `src/app/videos/results/page.tsx`
- `src/app/upload-video/page.tsx`

These route files are thin and generally delegate rendering to feature modules.

### 2. Feature layer

Feature modules in `src/features/` contain page-level behavior and orchestration.

Observed features:

- `AuthSession` (renders nothing; verifies the session with `GET /users/me`)
- `HomePage`
- `LoginPage`
- `VideosListingPage`
- `SearchResultsPage`
- `VideoDetail`
- `UploadVideo`

Typical responsibilities:

- coordinating hooks and API calls
- handling page state and rendering modes
- composing reusable components into route experiences

### 3. Reusable component layer

`src/components/` holds reusable UI primitives and layout pieces, such as:

- navigation (`Navbar`, `Sidebar`)
- media display (`VideoCard`, `VideoPlayer`)
- content helpers (`ReadMore`, `EmptyState`)
- theming (`theme`, `ThemeToggle`)
- feedback (`Notification`)
- shell/layout (`containers/MainLayoutContainer`)

### 4. State and data layer

Redux Toolkit is used for application state and RTK Query for remote data fetching.

Core files:

- `src/redux/store/configureStore.tsx`
- `src/redux/store/provider.tsx`
- `src/redux/baseApi.tsx`
- `src/redux/customBaseQuery.ts`
- `src/redux/login/*`
- `src/redux/events/*`

### 5. Hook layer

Custom hooks encapsulate navigation, feature flags, query management, and reusable behavior.

Available hooks:

| Hook                   | Responsibility                                                                    |
| ---------------------- | --------------------------------------------------------------------------------- |
| `useNavigation`        | Centralised URL construction and programmatic navigation                          |
| `useVideoQueryManager` | URL param → RTK Query args conversion with page reset logic                       |
| `useFeatureFlags`      | Feature flag resolution with URL override support                                 |
| `useDebounce`          | Debounced value for search inputs                                                 |
| `useSidebar`           | Fetches tags and playlists for the navigation sidebar                             |
| `useVideoUpload`       | React binding of the resumable upload engine: progress, pause, resume, cancel     |
| `useUploadRate`        | Average upload speed from progress samples, for the speed and time-left text      |
| `useLeaveGuard`        | Browser prompt on reload plus interception of in-app link clicks for unsaved work |
| `usePreventFileDrop`   | Stops a file dropped outside a drop zone from navigating the browser away         |

## Authentication Architecture

Authentication is implemented across several pieces:

- Google sign-in starts in `src/features/LoginPage/loginPage.tsx`
- login calls the `loginAndSetCookie` Next.js server action, which POSTs to `POST /api/v1/users/login` and sets an HttpOnly cookie
- the access token stays in the HttpOnly cookie only; the server action returns user info with `access`/`refresh` set to `null`
- only user info is held in Redux and persisted via `redux-persist` (persist version 2: migration 1 scrubs legacy persisted tokens, migration 2 defaults `is_staff` to `false`)
- all API calls go through the BFF proxy `src/app/bff/[...path]/route.ts`, which reads the cookie and attaches the `Bearer` header server-side (re-adding the trailing slash the backend expects); it returns `403` unless the request carries the `x-requested-with: session-portal` header that `customBaseQuery` sets, so opening a proxy URL directly in the address bar is refused (this deters casual access only; the authenticated user can still replay requests)
- route protection is handled by `src/proxy.ts` (JWT cookie expiry validation, no `useAuth` hook); `src/features/AuthSession` additionally validates the token with the backend via `GET /users/me` on load and on every navigation to a protected route, and redirects to `/login` on `401`
- unauthorized API responses (`401`) dispatch `logout()` (from `src/redux/login/actions.ts`) in `customBaseQuery`

See [Authentication Module](./modules/authentication.md) for full flow details.

## Data Fetching Architecture

`src/redux/customBaseQuery.ts` centralizes request behavior:

- requests routed through the `/bff` BFF (base URL and Bearer token are applied server-side)
- logout on `401`
- notification display for API errors
- error normalization through `parseError`

## UI Shell Architecture

`MainLayoutContainer` is the primary authenticated shell:

- renders top `Navbar` with optional drawer toggle
- optionally renders a persistent left `Sidebar` (tag/playlist navigation)
- optionally renders a `StyledDrawer` for the same sidebar content on smaller screens (Escape key closes it)
- optionally renders right sidebar content, used by the video detail page for recommendations
- does NOT enforce auth — route protection is handled exclusively by the proxy

## Theming Architecture

The theme layer uses MUI with CSS variables and Emotion support.

Observed characteristics:

- custom typography variants (`bodySmall`, `bodyMedium`, `bodyLarge`)
- dark mode configured as default color scheme
- `InitColorSchemeScript` is included to avoid theme flash during hydration
- `ThemeToggle` visibility is controlled via feature flags on the login page

## Proxy Architecture

Route protection is handled by `src/proxy.ts`, which runs on every request matched by the Next.js proxy.

| Rule | Behavior |
| --- | --- |
| Authenticated user visits any route with a valid `redirect_to` param | Redirected to `redirect_to` (valid internal path only) |
| Authenticated user visits `/login` without a valid `redirect_to` | Redirected to `/videos` |
| Any user visits `/` | Redirected to `/videos` |
| Unauthenticated user visits any route except `/login` (fail closed, `PUBLIC_ROUTES`) | Redirected to `/login?redirect_to=<original path>` |
| Paths under `/api`, `/bff`, `/_next`, or ending in a static file extension (png, svg, json, …) | Excluded by the matcher (the proxy route enforces its own 401) |

Token validation reads the `access` HttpOnly cookie set by the `loginAndSetCookie` server action. It decodes the JWT payload to check expiry (`exp` claim) without a network call.

`isValidInternalRedirectPath` (in `src/utils/utils.ts`) prevents open redirect attacks by rejecting external URLs in the `redirect_to` parameter.

## Monitoring, Analytics and Error Recovery

Cross-cutting concerns that sit outside the feature layers:

- **Sentry** is initialized per runtime (`sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation-client.ts`), registered through `src/instrumentation.ts`, and wrapped around the Next.js config outside development.
- **Error boundaries**: `src/app/error.tsx` (route) and `src/app/global-error.tsx` (root layout) report to Sentry and render fallback UI; `src/app/not-found.tsx` handles 404s.
- **Stale chunk recovery** (`src/utils/chunkLoadRecovery.ts`) hard-reloads once per session when a tab opened before a deploy requests a missing chunk.
- **Analytics**: `trackEvent` in `src/utils/analytics.ts` pushes events to the GTM `dataLayer` from feature and component handlers.

Details: [Monitoring and Error Recovery](./modules/monitoring-and-error-recovery.md), [Analytics Tracking](./modules/analytics-tracking.md).

## Upload Feature

The upload UI (`/upload-video`) is for staff only. It is gated by the user's `is_staff` flag (`selectIsStaff`, persisted in the `login` slice; persisted-state migration v2 defaults it to `false`), not by a feature flag. The Navbar entry and the `FileUpload` component redirect non-staff users to `/videos`. This is a UI convenience only: the backend must enforce staff permissions on `/events/videoassets/` and `/events/`.

The video file is uploaded in resumable chunks by the framework-free engine in `src/services/resumableUpload/` (`UploadManager`, bound to React by `src/hooks/useVideoUpload.ts`) through the BFF proxy with the `x-requested-with` guard header. The backend owns the upload session and its confirmed offset, so an upload continues after a lost connection or page reload; see [Upload Video](./modules/upload-video.md). The metadata form (`VideoForm`, `fields.tsx`, `selectFields.tsx`) publishes through the `createEvent`, `createTag` and `searchUsers` RTK Query endpoints. Client-side validation allows MP4, MOV, AVI and WebM files up to `MAX_VIDEO_FILE_SIZE_BYTES` (20 GB). The BFF proxy streams request bodies to the backend (`duplex: "half"`, with `content-length` and the `upload-offset` / `upload-checksum` headers forwarded) instead of buffering them, so chunks are not held in server memory. Any reverse proxy in front of the app or the backend needs a body-size limit of at least the chunk cap (16 MiB by default, not 20 GB); this is not verifiable from the repository.

## Security Headers and Deployment

- `next.config.ts` no longer sets response security headers (HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) or a `Content-Security-Policy-Report-Only`; these were removed. There is currently no CSP or hardened header set applied by the app.
- `images.remotePatterns` allows only the `NEXT_PUBLIC_BASE_URL` host plus `NEXT_PUBLIC_IMAGE_HOSTS`.
- `GET /api/health` is the liveness probe used by the Docker `HEALTHCHECK`.
- CI (`.github/workflows/build.yml`) runs lint, coverage tests, `npm audit --audit-level=critical`, the production build and Sonar.
- `.github/dependabot.yml` opens weekly PRs against `dev` for npm (minor/patch grouped; majors of `next`, `react`, `react-dom` are manual), GitHub Actions and Docker (Node major is manual). Commit prefixes (`chore(deps)`, `chore(deps-dev)`, `ci(deps)`, `ci(docker)`) satisfy `@commitlint/config-conventional`.
- The `architecture-guardian` agent (`.claude/agents/architecture-guardian.md`) enforces these rules on every change.
