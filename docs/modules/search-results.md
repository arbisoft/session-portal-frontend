# Search Results Module

## Responsibility

Displays paginated, virtualized search results for a text query, with its own loading and empty states.

## Where It Lives

| Concern            | File                                                      |
| ------------------ | --------------------------------------------------------- |
| Page component     | `src/features/SearchResultsPage/searchResultsPage.tsx`    |
| Route              | `src/app/videos/results/page.tsx`                         |
| Default params     | `src/features/SearchResultsPage/types.ts`                 |
| RTK Query endpoint | `src/redux/events/apiSlice.ts` (`getEvents` lazy variant) |

## How It Works

### Query Trigger

`SearchResultsPage` uses `useLazyGetEventsQuery` (not the eager `useGetEventsQuery` used in the listing page). This gives explicit control over when the API call fires — the query is dispatched manually inside a `useEffect`:

```ts
useEffect(() => {
  getEvents({ ...defaultParams, page_size: 10, page, search: search || undefined });
}, [search, page]);
```

The effect fires whenever `search` or `page` changes. This means a new search term immediately triggers a fresh fetch (page stays at 1 on term change because `page` state is not reset — it relies on the fact that a new `search` value with the existing `page` value makes the params different enough to re-fire).

> **Note**: The page state is NOT reset when `search` changes. If a user searches for "A", scrolls to page 3, then searches for "B", the request for "B" will start from page 3. This is a known behavioral gap — the listing page correctly resets page via `useVideoQueryManager`, but the search page does not.

### Data Flow

1. `search` param is read from URL via `useSearchParams().get("search")`
2. Params are cleaned via `parseNonPassedParams` (removes empty/falsy values)
3. `getEvents` is called with `page_size: 10` and the search string
4. Results render through `Virtuoso` (single-column list, not grid)
5. `endReached` increments page when `videoListings.next` is non-null

### Data Transformation

Unlike the listing page (which uses `transformVideoToCardData`), search results inline the transformation:

```ts
{
  description: event.description,
  event_time: formatDateTime(event.event_time),
  organizer: event.presenters.map(fullName).join(", "),
  thumbnail: event.thumbnail ? BASE_URL.concat(event.thumbnail) : DEFAULT_THUMBNAIL,
  title: event.title,
  video_duration: convertSecondsToFormattedTime(event.video_duration),
  video_file: event.video_file ? BASE_URL.concat(event.video_file) : undefined,
}
```

Both `thumbnail` and `video_file` are resolved to full URLs by prepending `BASE_URL`, with `DEFAULT_THUMBNAIL` as fallback.

### Render States

| Condition               | What renders                                                  |
| ----------------------- | ------------------------------------------------------------- |
| Loading / uninitialized | 5 skeleton cards (fixed count via `faker.lorem.word()` array) |
| Results found           | `Virtuoso` list with `VideoCard` in `search-card` variant     |
| No results or error     | `EmptyState` showing the search term                          |
| Fetching next page      | `LoaderSkeleton` shown in `Virtuoso.Footer`                   |

The `"search-card"` variant renders a horizontal card layout with a 400px-wide thumbnail on the left.

### No Cache Accumulation

The search page does NOT use the custom `merge` / `serializeQueryArgs` cache strategy. Each `getEvents` call with a different page number creates a separate cache entry. This means scrolling and re-mounting may refetch data that was already shown. The listing page has the accumulation strategy; the search page does not.

### Responsive Behavior

Fixed at `isLargeScreen` breakpoint (`lg+`):

- Large screens: left sidebar visible, no drawer
- Small screens: left sidebar hidden, drawer enabled
- Card height is fixed at 260px on large screens; `undefined` (auto) on small screens

## Default Params

```ts
{
  event_type: "SESSION",
  status: "PUBLISHED",
  linked_to_events: "True",
  page: 1,
}
```

Same as the listing page defaults.
