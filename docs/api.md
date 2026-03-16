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
  "auth_token": "string"  // Google access token
}
```

**Response (200 OK):**
```json
{
  "access": "string",     // JWT access token
  "refresh": "string",    // Refresh token
  "user_info": {
    "avatar": "string",   // User avatar URL
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
- `id` (path): Video asset ID

**Response (200 OK):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "video_url": "string",
  "thumbnail_url": "string",
  "duration": "string",
  "presenter": "string",
  "tags": ["string"],
  "playlists": ["string"],
  "event_type": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

**Error Responses:**
- `404 Not Found`: Video asset not found

### GET /events/all/

Retrieve paginated list of video assets/events.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 10)
- `search` (optional): Search query
- `is_featured` (optional): Filter featured content
- `tags` (optional): Filter by tags
- `event_types` (optional): Filter by event types
- `playlists` (optional): Filter by playlists

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
      "description": "string",
      "thumbnail_url": "string",
      "duration": "string",
      "presenter": "string",
      "tags": ["string"],
      "created_at": "string"
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

