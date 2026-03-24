# Data Models

## Overview

The repository contains explicit domain types under `src/models/` for authentication and events.

## Authentication Models

Defined in `src/models/Auth/auth.tsx`.

### `LoginResponse`

```ts
type LoginResponse = {
  access: string | null;
  refresh: string | null;
  user_info: {
    avatar: string | null;
    first_name: string | null;
    full_name: string | null;
    last_name: string | null;
  };
};
```

### `LoginParams`

```ts
type LoginParams = { auth_token: string };
```

## Event Models

Defined in `src/models/Events/events.ts`.

### `EventDetail`

Represents the detailed video asset response:

```ts
interface EventDetail {
  duration: number;
  event: Event;
  file_size: number;
  status: string;
  thumbnail: string;
  title: string;
  video_file: string;
}
```

### `Event`

Core session/video object used in listings and detail relationships:

| Field | Type |
| --- | --- |
| `description` | `string` |
| `event_time` | `string` |
| `event_type` | `string` |
| `id` | `number` |
| `is_featured` | `boolean` |
| `playlists` | `string[]` |
| `presenters` | `Presenter[]` |
| `publisher` | `Publisher` |
| `status` | `string` |
| `tags` | `string[]` |
| `thumbnail` | `string` |
| `title` | `string` |
| `video_duration` | `number` |
| `workstream_id` | `string` |
| `video_file` | `string` |
| `slug` | `string` |

### `Publisher` and `Presenter`

Internal supporting shapes:

```ts
interface Publisher {
  first_name: string;
  id: number;
  last_name: string;
}

interface Presenter extends Publisher {
  email: string;
}
```

### Collection Models

```ts
interface AllEventResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

interface Recommendation extends AllEventResponse {}
```

### Tags and playlists

```ts
interface Tag {
  id: number;
  name: string;
}

interface Playlist extends Tag {}
```

### Query Parameter Models

`EventsParams` is used for event listing/search requests.

Important fields:

- `event_type: "SESSION"`
- `status: "DRAFT" | "PUBLISHED" | "ARCHIVED"`
- `page: number`
- optional filters such as `tag`, `playlist`, `search`, date range, and ordering

`RecommendationParam`:

```ts
type RecommendationParam = {
  id: string;
  page: number;
  page_size?: number;
};
```

## Data Transform Helpers

Several utilities convert raw event data into UI-friendly forms in `src/utils/utils.ts`.

Examples:

- `formatDateTime()`
- `convertSecondsToFormattedTime()`
- `fullName()`
- `transformVideoToCardData()`

These helpers are important because UI components often consume transformed rather than raw backend shapes.

## Database / Schema Note

No database schema, migrations, or persistence-layer definitions exist in this frontend repository. The data models documented here are frontend TypeScript interfaces only.
