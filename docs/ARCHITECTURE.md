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

- `GoogleOAuthProvider`
- Redux `Providers`
- Custom MUI `ThemeProvider`
- `InitColorSchemeScript`
- `CssBaseline`
- `NotificationProvider`
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

| Hook                   | Responsibility                                              |
| ---------------------- | ----------------------------------------------------------- |
| `useNavigation`        | Centralised URL construction and programmatic navigation    |
| `useVideoQueryManager` | URL param → RTK Query args conversion with page reset logic |
| `useFeatureFlags`      | Feature flag resolution with URL override support           |
| `useDebounce`          | Debounced value for search inputs                           |
| `useSidebar`           | Fetches tags and playlists for the navigation sidebar       |

## Authentication Architecture

Authentication is implemented across several pieces:

- Google sign-in starts in `src/features/LoginPage/loginPage.tsx`
- login calls the `loginAndSetCookie` Next.js server action, which POSTs to `POST /api/v1/users/login` and sets an HttpOnly cookie
- session tokens and user info are stored in Redux login state (client dispatches after server action returns)
- persisted session data is filtered and stored via `redux-persist` (only `session` sub-key)
- route protection is handled entirely by `src/middleware.ts` (JWT cookie validation, no `useAuth` hook)
- unauthorized API responses (`401`) trigger `login/logout` dispatch in `customBaseQuery`

See [Authentication Module](./modules/authentication.md) for full flow details.

## Data Fetching Architecture

`src/redux/customBaseQuery.ts` centralizes request behavior:

- base URL resolution using `NEXT_PUBLIC_BASE_URL`
- Bearer token injection from Redux state
- logout on `401`
- notification display for API errors
- error normalization through `parseError`

## UI Shell Architecture

`MainLayoutContainer` is the primary authenticated shell:

- renders top `Navbar` with optional drawer toggle
- optionally renders a persistent left `Sidebar` (tag/playlist navigation)
- optionally renders a `StyledDrawer` for the same sidebar content on smaller screens (Escape key closes it)
- optionally renders right sidebar content, used by the video detail page for recommendations
- does NOT enforce auth — route protection is handled exclusively by middleware

## Theming Architecture

The theme layer uses MUI with CSS variables and Emotion support.

Observed characteristics:

- custom typography variants (`bodySmall`, `bodyMedium`, `bodyLarge`)
- dark mode configured as default color scheme
- `InitColorSchemeScript` is included to avoid theme flash during hydration
- `ThemeToggle` visibility is controlled via feature flags on the login page

## Middleware Architecture

Route protection is handled by `src/middleware.ts`, which runs on every request matched by the Next.js Edge Runtime.

| Rule                                                 | Behavior                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| Authenticated user visits `/login`                   | Redirected to `redirect_to` param (if valid internal path) or `/videos` |
| Unauthenticated user visits `/videos` or `/videos/*` | Redirected to `/login?redirect_to=<original path>`                      |
| Any user visits `/` or `/upload-video`               | Redirected to `/videos`                                                 |
| All other requests                                   | Pass through unchanged                                                  |

Token validation reads the `access` HttpOnly cookie set by the `loginAndSetCookie` server action. It decodes the JWT payload to check expiry (`exp` claim) without a network call.

`isValidInternalRedirectPath` (in `src/utils/utils.ts`) prevents open redirect attacks by rejecting external URLs in the `redirect_to` parameter.

## Upload Feature Status

The upload UI (`/upload-video`) is behind a feature flag (`uploadVideo: { enabled: false }` in `src/constants/featureFlags.ts`). The route and `FileUpload` component exist, but the backend submission is not yet implemented — `VideoForm` currently uses placeholder/hardcoded data. The middleware redirects `/upload-video` to `/videos` unconditionally regardless of feature flag state.
