# Data Transforms and Utilities

## Responsibility

`src/utils/utils.ts` provides pure helper functions used across features to transform raw API data into UI-ready formats, sanitize inputs, and derive display values.

## Functions

### `transformVideoToCardData(video: Event)`

Converts a raw `Event` object into the shape expected by `VideoCard`.

| Input field      | Output field     | Transform                                     |
| ---------------- | ---------------- | --------------------------------------------- |
| `event_time`     | `event_time`     | `formatDateTime()`                            |
| `presenters[]`   | `organizer`      | `fullName()` for each, joined with `", "`     |
| `thumbnail`      | `thumbnail`      | `BASE_URL + thumbnail` or `DEFAULT_THUMBNAIL` |
| `title`          | `title`          | unchanged                                     |
| `video_duration` | `video_duration` | `convertSecondsToFormattedTime()`             |
| `video_file`     | `video_file`     | `BASE_URL + video_file` or `undefined`        |
| `description`    | `description`    | unchanged                                     |

Used in: `VideosListingPage`, `VideoDetail` recommendations, `FeaturedSlider`.

`SearchResultsPage` inlines an equivalent transformation manually instead of calling this helper.

### `formatDateTime(event_time: string)`

Parses an ISO 8601 date string and formats it as `"MMM dd, yyyy"` (e.g. `"Jan 05, 2024"`). Uses `date-fns` `parseISO` + `format`.

### `convertSecondsToFormattedTime(seconds: number)`

Converts a duration in seconds to `HH:MM:SS` (when > 1 hour) or `MM:SS` (otherwise). Hours are omitted when zero. All parts are zero-padded.

Examples: `3661` → `"01:01:01"`, `90` → `"01:30"`, `45` → `"00:45"`.

### `fullName(user)`

Returns `"${first_name} ${last_name}".trim()`. Handles undefined fields gracefully with empty string fallback.

### `parseNonPassedParams<T>(data: T)`

Strips entries from an object where the value is falsy, with these exceptions:

- `false` (boolean) is kept
- `0` (number) is kept
- Non-empty strings are kept
- Non-empty arrays are kept

Used to clean API request params before they are passed to RTK Query, preventing empty string query parameters from reaching the backend.

### `isValidInternalRedirectPath(redirectPath)`

Security guard that validates a redirect target is an internal path. See [authentication module](./authentication.md#isvalidinternalredirectpath-rules) for the full rule set.

### `generateYearList(startYear: number)`

Returns an array of `{ value: string, label: string }` objects from the current year down to `startYear`. The current year's label is `"This Year"`.

Used by `DateFilterDropdown` to populate the year select options. Start year is hardcoded to `2020` at the call site.

### `trimTextLength(text: string, length: number)`

Truncates a string to `length` characters and appends `"..."`. Returns the original string if shorter.

### `initCapital(str: string)`

Title-cases every word in a string using a lowercase + regex replace approach. Not currently used in any component (present for utility).

### `getQueryValue(key)`

Normalises Next.js route params that may be `string | string[] | undefined` to a single `string`. Returns `""` for undefined. Used in route page files.
