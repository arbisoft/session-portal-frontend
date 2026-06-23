# Routing and Application Flows

## Route Map

| Route               | Source file                         | Rendered feature/component                   |
| ------------------- | ----------------------------------- | -------------------------------------------- |
| `/`                 | `src/app/page.tsx`                  | `HomePage`                                   |
| `/login`            | `src/app/login/page.tsx`            | `LoginPage`                                  |
| `/videos`           | `src/app/videos/page.tsx`           | `VideosListingPage`                          |
| `/videos/results`   | `src/app/videos/results/page.tsx`   | `SearchResultsPage`                          |
| `/videos/[videoId]` | `src/app/videos/[videoId]/page.tsx` | `VideoDetail`                                |
| `/upload-video`     | `src/app/upload-video/page.tsx`     | Upload page wrapped in `MainLayoutContainer` |

## Navigation Helper

`src/hooks/useNavigation.ts` centralizes route generation.

Supported logical pages:

- `home` -> `/`
- `login` -> `/login`
- `videos` -> `/videos`
- `searchResult` -> `/videos/results`
- `videoDetail(id)` -> `/videos/:id`
- `uploadVideo` -> `/upload-video`

It provides:

- `getPageUrl(page, params)`
- `navigateTo(page, params)`

## Authentication Flow

Authentication is handled by middleware in `src/middleware.ts` and server actions in `src/app/login/actions.ts`.

### Middleware Rules (`middleware.ts`)

The middleware intercepts requests to enforce authentication:

1. Protects routes: `/videos` and `/videos/*` require valid authentication
2. Redirects unauthenticated users to `/login` with `redirect_to` parameter
3. Redirects authenticated users away from `/login` to validated `redirect_to` or `/videos`
4. Redirects root path `/` and `/upload-video` to `/videos`

### Server Actions (`actions.ts`)

- `loginAndSetCookie`: Receives the Google OAuth `access_token` via `FormData`, calls `POST /api/v1/users/login` on the server, sets an HttpOnly `access` cookie (expiry derived from JWT `exp` claim), and returns the session data. The client component then dispatches `loginActions.login(data)` to update Redux state.
- `logoutAndClearCookie`: Deletes the `access` cookie and calls `redirect("/login")`

## Login Flow

Observed sequence:

1. User visits `/login`
2. `LoginPage` reads `redirect_to` from URL params or window.location.search
3. `redirect_to` is validated using `isValidInternalRedirectPath` (prevents external redirects)
4. `LoginPage` invokes Google OAuth using `useGoogleLogin`
5. On success, the frontend sends the Google `access_token` as `auth_token`
6. Request is sent to `POST /users/login`
7. On success, the app navigates to the validated `redirect_to` path or defaults to `/videos`
8. On failure, a notification is shown

## Videos Listing Flow

`VideosListingPage` supports:

- featured video slider when no tag/playlist/search/year filter is active
- lazy event loading through RTK Query
- virtualized scrolling with infinite loading using `react-virtuoso`
- sort/year filtering
- retry handling for failed loads
- empty states for no results

Recognized search params:

| Param      | Purpose            |
| ---------- | ------------------ |
| `tag`      | filter by tag      |
| `playlist` | filter by playlist |
| `search`   | text search        |
| `order`    | sort ordering      |
| `year`     | year filter        |

## Search Results Flow

`SearchResultsPage`:

- reads `search` from query params
- requests paginated results with `page_size: 10`
- uses `Virtuoso` for incremental rendering
- renders a no-results state when data is absent or error occurs

## Video Detail Flow

`VideoDetail`:

- reads `videoId` from route params
- fetches event detail and recommendations
- updates document title after data loads
- redirects to `/videos` if the detail request errors
- renders:
  - video player
  - session title and metadata
  - expandable description
  - clickable tags linking back to filtered listings
  - recommendations sidebar with virtualized infinite loading

## Upload Flow

The upload route (`/upload-video`) is redirected to `/videos` by `src/middleware.ts` regardless of feature flag state. The feature is also gated behind `uploadVideo` in `src/constants/featureFlags.ts` (currently `enabled: false`).

When the route eventually becomes accessible:

- `FileUpload` toggles between `VideoPicker` (file selection) and `VideoForm` (metadata entry) based on selected file state
- `VideoForm` collects: title, presenter, event date, description, related videos, playlists, thumbnail
- Backend submission is not yet implemented; `VideoForm.onSubmit` currently returns the form data without making an API call

## Feature Flag URL Override

`useFeatureFlags` supports URL-based overrides for local development and testing. Append the feature name as a query parameter to any page:

```
/videos?darkModeSwitcher=true
/login?uploadVideo=true
```

| URL value            | Effect                                            |
| -------------------- | ------------------------------------------------- |
| `?featureName=true`  | Force-enables the feature regardless of config    |
| `?featureName=false` | Force-disables the feature regardless of config   |
| (absent)             | Uses the value in `src/constants/featureFlags.ts` |

This override applies only to the current page load and is not persisted.
