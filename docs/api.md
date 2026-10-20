# API Documentation

This document describes the API endpoints consumed by the Session Portal Frontend. All endpoints are relative to the base URL configured in `NEXT_PUBLIC_BASE_URL` and prefixed with `/api/v1`.

The browser never calls the backend directly. Requests go to the BFF proxy (`/bff/<path>`, `src/app/bff/[...path]/route.ts`), which reads the HttpOnly `access` cookie and attaches the `Authorization: Bearer` header server-side. The documented paths below are the backend paths the proxy forwards to.

## Authentication

All API requests except login require a Bearer token. The frontend never handles the token in client code; see the BFF note above.

### Obtaining Access Token

Use Google OAuth to obtain an access token, then exchange it for session tokens.

#### POST /users/login

Authenticate with Google OAuth token.

**Request Body:**

```json
{
  "auth_token": "string" // Google access token
}
```

**Response (200 OK):**

```json
{
  "access": "string", // JWT access token
  "refresh": "string", // Refresh token
  "user_info": {
    "avatar": "string", // User avatar URL
    "first_name": "string",
    "full_name": "string",
    "last_name": "string",
    "is_staff": false // staff users may upload videos
  }
}
```

The `loginAndSetCookie` server action stores `access` in an HttpOnly cookie and returns the payload to the client with `access` and `refresh` set to `null`.

**Error Responses:**

- `401 Unauthorized`: Invalid Google token

## Events API

### GET /events/videoasset/{id}/

Retrieve detailed information about a specific video asset/event.

**Parameters:**

- `id` (path): Video asset slug (the `slug` field from the `Event` object — not a numeric ID)

**Response (200 OK):**

```json
{
  "duration": 0,
  "event": {
    "description": "string",
    "event_time": "string (ISO 8601)",
    "event_type": "string",
    "id": 0,
    "is_featured": false,
    "playlists": ["string"],
    "presenters": [{ "first_name": "string", "id": 0, "last_name": "string", "email": "string" }],
    "publisher": { "first_name": "string", "id": 0, "last_name": "string" },
    "status": "string",
    "tags": ["string"],
    "thumbnail": "string",
    "title": "string",
    "video_duration": 0,
    "workstream_id": "string",
    "video_file": "string",
    "slug": "string"
  },
  "file_size": 0,
  "status": "string",
  "thumbnail": "string",
  "title": "string",
  "video_file": "string",
  "captions_file": "string", // optional; .vtt or .srt URL
  "view_count": 0
}
```

**Error Responses:**

- `404 Not Found`: Video asset not found

### POST /events/videoasset/{slug}/view/

Record a view for a video asset. The frontend calls this once the viewer has accumulated the watch threshold (30 seconds of playing time by default) in the player.

**Parameters:**

- `slug` (path): Video asset slug

**Response:**

```json
{ "view_count": 0 }
```

### POST /events/videoassets/

Upload a video file (staff upload flow). Sent as `multipart/form-data` with `XMLHttpRequest` so upload progress can be shown.

**Request Body:** `video_file` (file)

**Response (201 Created):**

```json
{ "id": 0, "title": "string", "video_file": "string", "status": "string" }
```

### POST /events/

Create (publish) an event from an uploaded video asset. Sent as `multipart/form-data`.

**Request Body:**

- `title`, `description` (string)
- `event_time` (ISO 8601 string)
- `video_asset_id` (number, from the upload response)
- `playlists` (repeated number field)
- `presenter_ids` (repeated number field)
- `tags` (repeated number field, optional)
- `thumbnail` (file, optional; the backend generates one when omitted)

**Response:** the created `Event` (including its `slug`).

### GET /users/search/

Search users to pick presenters.

**Query Parameters:**

- `q` (required): Search text. The UI searches once at least 2 characters are entered.

**Response (200 OK):**

```json
[{ "id": 0, "first_name": "string", "last_name": "string", "full_name": "string", "email": "string" }]
```

### GET /events/all/

Retrieve paginated list of video assets/events.

**Query Parameters:**

- `event_type` (required): Always `"SESSION"` in this frontend
- `status` (required): `"DRAFT"` | `"PUBLISHED"` | `"ARCHIVED"`
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page
- `search` (optional): Text search query
- `is_featured` (optional): Boolean — filter featured content
- `tag` (optional): Filter by a single tag name
- `playlist` (optional): Filter by a single playlist name
- `ordering` (optional): Comma-separated ordering fields, e.g. `-event_time`, `event_time`
- `event_time_after` (optional): Filter events on or after date (`yyyy-MM-dd`)
- `event_time_before` (optional): Filter events on or before date (`yyyy-MM-dd`)
- `linked_to_events` (optional): `"True"` | `"False"` — filter items linked to events

**Response (200 OK):**

```json
{
  "count": 0,
  "next": "string|null",
  "previous": "string|null",
  "results": [
    {
      "description": "string",
      "event_time": "string (ISO 8601)",
      "event_type": "string",
      "id": 0,
      "is_featured": false,
      "playlists": ["string"],
      "presenters": [{ "first_name": "string", "id": 0, "last_name": "string", "email": "string" }],
      "publisher": { "first_name": "string", "id": 0, "last_name": "string" },
      "status": "string",
      "tags": ["string"],
      "thumbnail": "string",
      "title": "string",
      "video_duration": 0,
      "workstream_id": "string",
      "video_file": "string",
      "slug": "string"
    }
  ]
}
```

### GET /events/tags/

Retrieve list of available tags.

**Query Parameters:**

- `linked_to_events` (optional): Filter tags linked to events (default: false)

**Response (200 OK):**

```json
[
  {
    "id": "string",
    "name": "string",
    "slug": "string"
  }
]
```

### POST /events/tags/

Create a tag (used when a staff user types a new tag in the upload form).

**Request Body:**

```json
{ "name": "string" }
```

**Response:** the created `Tag` (`{ "id": 0, "name": "string" }`).

### GET /events/event_types/

Retrieve list of available event types.

**Response (200 OK):**

```json
[
  {
    "id": "string",
    "name": "string",
    "slug": "string"
  }
]
```

### GET /events/recommendations/{id}/

Retrieve recommended videos for a given video asset.

**Parameters:**

- `id` (path): Video asset ID

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)

**Response (200 OK):**

```json
{
  "count": 0,
  "next": "string|null",
  "previous": "string|null",
  "results": [
    {
      "id": "string",
      "title": "string",
      "thumbnail_url": "string",
      "duration": "string",
      "presenter": "string"
    }
  ]
}
```

### GET /events/playlists/

Retrieve list of available playlists.

**Query Parameters:**

- `linked_to_events` (optional): Filter playlists linked to events (default: false)

**Response (200 OK):**

```json
[
  {
    "id": "string",
    "name": "string",
    "slug": "string",
    "description": "string"
  }
]
```

## Error Response Format

All error responses follow this format:

```json
{
  "statusCode": "number|string",
  "message": "string",
  "details": {
    "field": "error message"
  }
}
```

## Common HTTP Status Codes

- `200 OK`: Success
- `401 Unauthorized`: Authentication required or invalid token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
