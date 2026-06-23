# Video Listing Module

## Responsibility

Displays all published session videos with filtering, sorting, featured content, and virtualized infinite scroll.

## Where It Lives

| Concern               | File                                                    |
| --------------------- | ------------------------------------------------------- |
| Page component        | `src/features/VideosListingPage/videosListingPage.tsx`  |
| Filter/sort UI        | `src/features/VideosListingPage/DateFilterDropdown.tsx` |
| Query parameter logic | `src/hooks/useVideoQueryManager.ts`                     |
| Default API params    | `src/features/VideosListingPage/types.ts`               |
| RTK Query endpoint    | `src/redux/events/apiSlice.ts` (`getEvents`)            |
| Route                 | `src/app/videos/page.tsx`                               |

## How It Works

### Query Parameter Management (`useVideoQueryManager`)

`useVideoQueryManager` reads URL search params and converts them into RTK Query arguments:

| URL param  | API field mapping                                                         |
| ---------- | ------------------------------------------------------------------------- |
| `tag`      | `tag` (cleared when `search` is set)                                      |
| `playlist` | `playlist` (cleared when `search` is set)                                 |
| `search`   | `search`                                                                  |
| `order`    | `ordering` array (`"-event_time"` for newest, `"event_time"` for oldest)  |
| `year`     | `event_time_after` + `event_time_before` (full year range via `date-fns`) |

When any filter changes, the page resets to 1 via a `useEffect` on the parsed param values. A `useRef` tracks the previous params to detect changes and avoid stale page numbers in the memoized `apiParams`.

**Conflict rule**: when `search` is set, `tag` and `playlist` are both cleared from the API params. The two filter types are mutually exclusive in the API call.

### Fixed Default Params

All event queries use these fixed defaults from `types.ts`:

```ts
{
  event_type: "SESSION",
  status: "PUBLISHED",
  linked_to_events: "True",
  page: 1,
}
```

`parseNonPassedParams` strips falsy/empty values before the request is made so the API doesn't receive empty string params.

### Featured Slider Logic

The featured slider (Swiper-based) involves two independent conditions that are easy to confuse:

**Featured query skip condition** (controls whether the API call fires):

```ts
const shouldSkipFeaturedVideos = !!(parsedParams.tag || parsedParams.playlist || parsedParams.search || parsedParams.year);
```

The query is skipped when any of `tag`, `playlist`, `search`, or `year` is set.

**Featured slider render condition** (controls whether the slider DOM is rendered):

```ts
// filterValue = parsedParams.year || parsedParams.playlist || parsedParams.tag
{!filterValue && !parsedParams.order && <FeaturedSlider slides={...} />}
```

The slider is rendered only when `tag`, `playlist`, `year`, and `order` are all absent. Note that `search` is **not** included in `filterValue`, so when only `search` is active, the slider container is still rendered but the featured query is skipped — meaning `slides` will be an empty array and the slider renders no content.

The featured query uses `is_featured: true`, `page_size: 12`, `ordering: ["-event_time"]`.

### Infinite Scroll Cache Strategy (`getEvents` RTK Query endpoint)

The `getEvents` endpoint uses a custom cache accumulation strategy to support infinite scroll without pagination-keyed cache entries:

**`serializeQueryArgs`**: Cache key is built from all params _except_ `page`. This means page 1, page 2, and page 3 of the same filter share one cache entry.

**`merge`**: When new data arrives:

1. If `page === 1`, reset `results` to `[]` (handles filter change or refresh)
2. Append only results whose `id` is not already in the cache (deduplication via `Set`)
3. Update `count`, `next`, `previous`

**`forceRefetch`**: Uses `lodash/isEqual` to deep-compare current vs previous args. This forces a network request when any param changes, even if RTK Query would otherwise serve from cache.

**Scroll trigger**: `VirtuosoGrid.endReached` calls `setPage(prev => prev + 1)` when the user scrolls to the bottom AND `videoListings.next` is non-null AND no fetch is in progress.

### Render States

| Condition                       | What renders                                            |
| ------------------------------- | ------------------------------------------------------- |
| Error and not loading           | `EmptyState` with "Retry" button that calls `refetch()` |
| Initial load or page 1 fetching | `SkeletonLoader` with 12 cards                          |
| Empty with active filter        | `EmptyState` showing the filter value                   |
| Empty with no filter            | `EmptyState` with "Check back later" message            |
| Data available                  | `VirtuosoGrid` with `VideoCard` items                   |
| More pages loading (scroll)     | `SkeletonLoader` shown in `VirtuosoGrid.Footer`         |

### Filter/Sort Navigation

Changing sort or year filter calls `navigateTo("videos", newParams)`, which updates the URL. This triggers `useVideoQueryManager` to reset page to 1 and recompute `apiParams`. The "clear" handler preserves `tag`, `playlist`, and `search` while dropping `order` and `year`.

### Page Title Logic

```ts
if (parsedParams.tag)      → "#tagname"
if (parsedParams.playlist) → "playlistname"
default                    → "All videos"
```

### Responsive Layout

`MainLayoutContainer` receives:

- `isLeftSidebarVisible={isLargeScreen}` — persistent sidebar only on `lg+`
- `shouldShowDrawer={!isLargeScreen}` — hamburger drawer on smaller screens
- `maxWidth={false}` — full-width layout
