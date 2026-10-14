# Video Detail Module

## Responsibility

Shows a single session video with its player (including captions), metadata, view count, tags, and a paginated recommendations sidebar.

## Where It Lives

| Concern                  | File                                                  |
| ------------------------ | ----------------------------------------------------- |
| Page component           | `src/features/VideoDetail/videoDetail.tsx`            |
| Skeleton loader          | `src/features/VideoDetail/skeletonLoader.tsx`         |
| Route                    | `src/app/videos/[videoId]/page.tsx`                   |
| Detail API endpoint      | `src/redux/events/apiSlice.ts` (`eventDetail`)        |
| Recommendations endpoint | `src/redux/events/apiSlice.ts` (`recommendation`)     |
| View count endpoint      | `src/redux/events/apiSlice.ts` (`incrementViewCount`) |
| Player                   | `src/components/VideoPlayer/videoPlayer.tsx`          |

## How It Works

### Data Fetching

Both queries are skipped until the route has a `videoId`:

```ts
useEventDetailQuery(videoId ?? skipToken);
useRecommendationQuery(videoId ? { id: videoId, page } : skipToken);
```

Authentication is not checked in the component: the middleware gates the route and the BFF proxy attaches the token server-side.

`videoId` comes from Next.js route params (`useParams<{ videoId: string }>()`). The route segment is `[videoId]`, which maps to the video's `slug` field (not numeric ID) — links are constructed as `/videos/${video.slug}`.

### Error Redirect

If the detail query returns an error (e.g. 404 or network failure), a `useEffect` fires:

```ts
useEffect(() => {
  if (!videoId || error) {
    navigateTo("videos");
  }
}, [error]);
```

The user is silently redirected to `/videos`. No error message is shown on the detail page itself.

### Document Title

The page title updates dynamically after the event data loads:

```ts
useEffect(() => {
  document.title = `${data?.event?.title ?? ""} - Sessions Portal`;
}, [data?.event?.title]);
```

This runs after every render where `title` changes, including the initial empty state.

### Layout

`MainLayoutContainer` receives:

- `isLeftSidebarVisible={false}` — no tag/playlist sidebar; more space for content
- `shouldShowDrawer={true}` — hamburger drawer available on all screen sizes
- `rightSidebar={<Virtuoso recommendations list />}` — recommendations are injected into the right sidebar slot, hidden on mobile (`xs: none, md: block`)

### Recommendations Infinite Scroll

The recommendations use the same accumulation cache strategy as the video listing:

- `serializeQueryArgs`: keyed by `endpointName-id` (i.e. all pages for one video share one cache entry)
- `merge`: appends unique results by ID; updates pagination cursors
- `forceRefetch`: `lodash/isEqual` on args

The scroll trigger lives inside `Virtuoso.endReached`:

```ts
endReached={() => {
  if (!isRecommendationsFetching && recommendationsData?.next) {
    setPage((prev) => prev + 1);
  }
}}
```

Page starts at 1, increments on scroll. The `page` state lives in the component, not in the URL.

### Video Player

`VideoPlayer` receives:

- `videoSrc`: `data.video_file` (direct file URL from backend)
- `posterSrc`: `data.thumbnail` or `DEFAULT_THUMBNAIL` fallback
- `posterAlt`: the event title
- `crossOrigin: true`, `playsInline: true`
- `captionsFile`: `data.captions_file` (optional)
- `onWatchThreshold`: records a view (see below)

The player is only rendered when `data.video_file` is truthy. If the backend returns no video file, the player is omitted silently. The player is keyed by `video_file`, so navigating to a recommended video remounts it and resets the watch-time counters.

### Captions

When `captions_file` is present, `VideoPlayer` renders a default "English" `Track` (`kind="subtitles"`). The track type is `srt` when the URL path ends in `.srt` (query string and fragment ignored) and `vtt` otherwise. Without `captions_file` no track is rendered.

### View Count

`VideoPlayer` accumulates playing time (paused time does not count). After `watchThresholdSeconds` (default 30) it fires the `video_watch_threshold` analytics event and calls `onWatchThreshold` once per mounted player. `VideoDetail` then calls `useIncrementViewCountMutation` (`POST /events/videoasset/{slug}/view/`) and shows the returned `view_count`; until then it shows `data.view_count`. A failed request is swallowed (errors are already toasted by `customBaseQuery`) and reported through the `video_view_count_failed` analytics event.

### Tags

Tags from `dataEvent.tags` render as `Chip` components. Each chip links to `/videos?tag=<tagname>`, which takes the user to the listing page pre-filtered to that tag.

### Accessibility

The session details are wrapped in an `<article aria-label="Session details for <title>">`. Metadata fields (title, presenters, date) all have `tabIndex={0}` for keyboard navigation.

## Key Edge Cases

| Scenario              | Behavior                                                           |
| --------------------- | ------------------------------------------------------------------ |
| Missing video file    | Player skipped; metadata still shows                               |
| No thumbnail          | `DEFAULT_THUMBNAIL` (`/assets/images/temp-youtube-logo.webp`) used |
| API error (404, 500)  | Redirect to `/videos`                                              |
| No captions file      | No caption track rendered                                          |
| Paused / short watch  | View is not counted until 30 seconds of playing time accumulate    |
| No recommendations    | `Virtuoso` renders empty list; no empty state shown                |
| No `videoId` in route | Queries skipped via `skipToken`; user is redirected to `/videos`   |
