# State Management and API Layer

## Redux Store Overview

The store is configured in `src/redux/store/configureStore.tsx`.

Current reducer composition includes:

- `login`
- `api` (RTK Query reducer path)

## Persistence Strategy

`redux-persist` is enabled with:

- storage: web local storage in the browser
- noop storage fallback for non-browser execution
- persist key: `session-portal`
- whitelist: `login`
- transform filter: only `session` is persisted from the login slice

## Provider Composition

`src/redux/store/provider.tsx` wraps the app with:

- Redux `Provider`
- `PersistGate`

## Base API

`src/redux/baseApi.tsx` defines a shared RTK Query API instance:

- reducer path: `api`
- base query: `customBaseQuery`
- tag types: currently an empty tuple with a TODO comment

## Server Actions

Authentication operations use Next.js server actions for security:

- Located in `src/app/login/actions.ts`
- `loginAndSetCookie`: Validates Google OAuth token, sets HttpOnly cookie, returns session data for Redux
- `logoutAndClearCookie`: Clears authentication cookie and redirects to login

These actions complement client-side Redux state management by handling secure server-side operations.

## Custom Base Query Behavior

`src/redux/customBaseQuery.ts` adds shared request behavior:

| Behavior | Description |
| --- | --- |
| Base host | `${NEXT_PUBLIC_BASE_URL}/api/v1` |
| Authorization | Adds `Bearer <token>` when an access token exists |
| Unauthorized handling | Dispatches `login/logout` on `401` |
| Error normalization | Uses `parseError` |
| User feedback | Shows toast notifications by default |

## Login State

### Slice

`src/redux/login/slice.ts` stores:

```ts
{
  session: {
    refresh,
    access,
    user_info: {
      avatar,
      first_name,
      full_name,
      last_name
    }
  },
  error,
  isLoading
}
```

### Selectors

`src/redux/login/selectors.ts` exposes:

- `selectAccessToken`
- `selectRefreshToken`
- `selectUserInfo`
- `selectIsLoading`

### Login API

`src/redux/login/apiSlice.ts` injects a mutation:

| Hook | Method | Endpoint |
| --- | --- | --- |
| `useLoginMutation` | `POST` | `/users/login` |

Request body:

```json
{
  "auth_token": "<google-access-token>"
}
```

Example response shape:

```json
{
  "access": "<jwt-or-access-token>",
  "refresh": "<refresh-token>",
  "user_info": {
    "avatar": "https://example.com/avatar.png",
    "first_name": "Alex",
    "full_name": "Alex Example",
    "last_name": "Example"
  }
}
```

### Authentication notes

- Google OAuth is initialized in `src/app/layout.tsx` through `GoogleOAuthProvider`.
- The frontend sends the Google access token to `POST /users/login` as `auth_token`.
- `customBaseQuery` attaches `Authorization: Bearer <token>` when an access token is present.
- A `401` response triggers a `login/logout` dispatch.

## Events API

`src/redux/events/apiSlice.ts` injects event-related queries.

### Available queries

| Hook | Endpoint | Purpose |
| --- | --- | --- |
| `useEventDetailQuery` | `/events/videoasset/{id}/` | Single event/video asset detail |
| `useEventTagsQuery` | `/events/tags/?linked_to_events=True` | Tag list |
| `useGetEventsQuery` / lazy variant | `/events/all/` | Paginated event listing |
| `useEventTypesQuery` | `/events/event_types/` | Event type list |
| `useRecommendationQuery` | `/events/recommendations/{id}/` | Recommendations for a video |
| `usePlaylistsQuery` | `/events/playlists/?linked_to_events=True` | Playlist list |

Example event detail request:

```text
GET /events/videoasset/{id}/
```

Example recommendation request:

```text
GET /events/recommendations/{id}/?page=1&page_size=10
```

### Caching / pagination behavior

Observed custom behavior includes:

- custom `serializeQueryArgs`
- result merging for infinite scrolling
- duplicate prevention by event ID
- `forceRefetch` using `lodash/isEqual`

## Error Handling

`src/redux/parseError.ts` normalizes error payloads from different shapes:

- server errors
- strings
- arrays
- nested objects
- null/undefined object values

The result format is:

```ts
type ErrorType = {
  statusCode: number | string;
  message: string;
  details?: Record<string, string>;
}
```

## Notes and Gaps

- RTK Query tags are not currently configured, so tag-based invalidation is not documented.
- Only frontend-visible API paths are documented here; backend response contracts may be broader than the inferred model types.
- The repository does not include canonical backend error response examples, so exact non-`401` error payload shapes should be confirmed from the backend service.
