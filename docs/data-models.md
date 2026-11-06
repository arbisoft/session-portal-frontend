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
    is_staff: boolean;
  };
};
```

`is_staff` drives the staff-only upload entry point (`selectIsStaff` in `src/redux/login/selectors.ts`).

### `CurrentUser`

Response of `GET /users/me/`:

```ts
type UserRole = "admin" | "staff" | "user";

type CurrentUser = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_staff: boolean;
};
```

Held in `login.currentUser` (`selectCurrentUser`); not persisted.

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
  captions_file?: string;
  duration: number;
  event: Event;
  file_size: number;
  status: string;
  thumbnail: string;
  title: string;
  video_file: string;
  view_count: number;
}
```

### `Event`

Core session/video object used in listings and detail relationships:

| Field            | Type          |
| ---------------- | ------------- |
| `description`    | `string`      |
| `event_time`     | `string`      |
| `event_type`     | `string`      |
| `id`             | `number`      |
| `is_featured`    | `boolean`     |
| `playlists`      | `string[]`    |
| `presenters`     | `Presenter[]` |
| `publisher`      | `Publisher`   |
| `status`         | `string`      |
| `tags`           | `string[]`    |
| `thumbnail`      | `string`      |
| `title`          | `string`      |
| `video_duration` | `number`      |
| `workstream_id`  | `string`      |
| `video_file`     | `string`      |
| `slug`           | `string`      |

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

### Upload Models

```ts
interface VideoAssetUploadResponse {
  id: number;
  title: string;
  video_file: string;
  status: string;
}

type UploadSessionStatus = "UPLOADING" | "FINALIZING" | "COMPLETED" | "FAILED" | "CANCELLED" | "EXPIRED";

interface UploadSession {
  id: string; // UUID
  filename: string;
  file_size: number;
  offset: number; // bytes durably committed by the server; the only position to resume from
  upload_status: UploadSessionStatus;
  error_code: string;
  video_asset_id: number | null; // set once COMPLETED
  expires_at: string;
  chunk_size: number; // recommended chunk size in bytes
  max_chunk_size: number; // largest accepted chunk
}

interface UploadSessionRequest {
  filename: string;
  file_size: number;
  client_key: string; // idempotency key, replayed creates return the same session
}

interface UploadErrorBody {
  code?: string;
  detail?: string;
  offset?: number;
}

interface UserSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

interface EventCreateParams {
  title: string;
  description: string;
  event_time: string;
  playlists: number[];
  presenter_ids: number[];
  video_asset_id: number;
  thumbnail?: File;
  tags?: number[];
}
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
