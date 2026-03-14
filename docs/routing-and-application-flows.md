# Routing and Application Flows

## Route Map

| Route | Source file | Rendered feature/component |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | `HomePage` |
| `/login` | `src/app/login/page.tsx` | `LoginPage` |
| `/videos` | `src/app/videos/page.tsx` | `VideosListingPage` |
| `/videos/results` | `src/app/videos/results/page.tsx` | `SearchResultsPage` |
| `/videos/[videoId]` | `src/app/videos/[videoId]/page.tsx` | `VideoDetail` |
| `/upload-video` | `src/app/upload-video/page.tsx` | Upload page wrapped in `MainLayoutContainer` |

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
3. Redirects authenticated users away from `/login` to `/videos`
4. Redirects root path `/` and `/upload-video` to `/videos`

### Server Actions (`actions.ts`)

- `loginAndSetCookie`: Handles Google OAuth login, sets HttpOnly cookie, updates Redux state
- `logoutAndClearCookie`: Clears cookie and redirects to login

### Login Flow

1. User visits `/login`
2. `LoginPage` invokes Google OAuth using `useGoogleLogin`
3. On success, calls `loginAndSetCookie` server action with `auth_token`
4. Server action validates token, sets HttpOnly cookie, updates client Redux state
5. On success, navigates to `/videos` or redirect target
6. On failure, shows notification

## Login Flow

Observed sequence:

1. User visits `/login`
2. `LoginPage` invokes Google OAuth using `useGoogleLogin`
3. On success, the frontend sends the Google `access_token` as `auth_token`
4. Request is sent to `POST /users/login`
5. On success, the app navigates to `/videos`
6. On failure, a notification is shown

## Videos Listing Flow

`VideosListingPage` supports:

- featured video slider when no tag/playlist/search/year filter is active
- lazy event loading through RTK Query
- infinite scrolling with `react-virtuoso`
- sort/year filtering
- retry handling for failed loads
- empty states for no results

Recognized search params:

| Param | Purpose |
| --- | --- |
| `tag` | filter by tag |
| `playlist` | filter by playlist |
| `search` | text search |
| `order` | sort ordering |
| `year` | year filter |

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
  - recommendations sidebar with infinite scroll

## Upload Flow

The inspected upload entry points show:

- `/upload-video` renders `FileUpload`
- `FileUpload` toggles between `VideoPicker` and `VideoForm` based on selected file state

### Documentation gap

The exact upload submission workflow, validation, and backend endpoint usage were not fully inspected, so this flow should be expanded later if upload behavior needs deeper documentation.
