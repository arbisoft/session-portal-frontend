# API Documentation

This document describes the API endpoints consumed by the Session Portal Frontend. All endpoints are relative to the base URL configured in `NEXT_PUBLIC_BASE_URL` and prefixed with `/api/v1`.

## Authentication

All API requests except login require authentication via Bearer token in the `Authorization` header.

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
    "last_name": "string"
  }
}
```

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
  "video_file": "string"
}
```

**Error Responses:**

- `404 Not Found`: Video asset not found

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
