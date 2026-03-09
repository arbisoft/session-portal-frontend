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

`useAuth()` is a central redirect hook and is used by:

- `HomePage`
- `LoginPage`
- `MainLayoutContainer`

### Redirect rules implemented in `useAuth.ts`

1. If a user is authenticated and a `redirect_to` query parameter exists, redirect to the matching video detail page.
2. If a user is authenticated and currently on `/` or `/login`, redirect to `/videos`.
3. If a user is not authenticated:
   - redirect to `/login`
   - preserve `redirect_to` when a video slug or redirect target exists

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
