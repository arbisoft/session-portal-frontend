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

Custom hooks encapsulate navigation, auth, feature flags, query management, and reusable behavior.

Examples:

- `useAuth`
- `useNavigation`
- `useVideoQueryManager`
- `useFeatureFlags`
- `useDebounce`
- `useSidebar`

## Authentication Architecture

Authentication is implemented across several pieces:

- Google sign-in starts in `src/features/LoginPage/loginPage.tsx`
- the frontend posts `auth_token` to `POST /users/login`
- session tokens and user info are stored in Redux login state
- persisted session data is filtered and stored via `redux-persist`
- `useAuth()` redirects users based on auth state and route context
- unauthorized API responses (`401`) trigger `login/logout`

## Data Fetching Architecture

`src/redux/customBaseQuery.ts` centralizes request behavior:

- base URL resolution using `NEXT_PUBLIC_BASE_URL`
- Bearer token injection from Redux state
- logout on `401`
- notification display for API errors
- error normalization through `parseError`

## UI Shell Architecture

`MainLayoutContainer` is the primary authenticated shell:

- calls `useAuth()` to enforce auth redirects
- renders top navigation
- optionally renders persistent left sidebar
- optionally renders a drawer sidebar for smaller screens
- optionally renders right sidebar content, used by the video detail page

## Theming Architecture

The theme layer uses MUI with CSS variables and Emotion support.

Observed characteristics:

- custom typography variants (`bodySmall`, `bodyMedium`, `bodyLarge`)
- dark mode configured as default color scheme
- `InitColorSchemeScript` is included to avoid theme flash during hydration
- `ThemeToggle` visibility is controlled via feature flags on the login page

## Known Gaps / Ambiguities

- No middleware file is active in the current structure for route protection; auth guarding currently appears hook-based.

- The upload architecture is incomplete from the inspected files because only the top-level upload UI entry points were reviewed.
