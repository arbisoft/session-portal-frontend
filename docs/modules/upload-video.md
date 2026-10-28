# Upload Video Module

## Responsibility

Lets staff users upload a video file, describe it, and publish it as an event. The video is uploaded in the background while the user fills in the metadata form; publishing is allowed as soon as the upload starts and is queued until it finishes.

## Who and Why

- **Users:** accounts whose login response has `user_info.is_staff === true`. Everyone else cannot see the entry point and is redirected away from the route.
- **Purpose:** moves publishing out of back-office tooling and into the portal.

## Where It Lives

| Concern                      | File                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| Route                        | `src/app/upload-video/page.tsx`                                 |
| Orchestrator and staff guard | `src/features/UploadVideo/uploadVideo.tsx`                      |
| File picker                  | `src/features/UploadVideo/videoPicker.tsx`                      |
| Metadata form                | `src/features/UploadVideo/form.tsx`                             |
| Text / date fields           | `src/features/UploadVideo/fields.tsx`                           |
| Presenter, playlist, tags    | `src/features/UploadVideo/selectFields.tsx`                     |
| Upload hook                  | `src/hooks/useVideoUpload.ts`                                   |
| Popup close-on-scroll hook   | `src/hooks/useCloseOnScroll.ts`                                 |
| Endpoint paths               | `src/endpoints/events.ts`, `src/endpoints/users.ts`             |
| RTK Query endpoints          | `src/redux/events/apiSlice.ts`                                  |
| Staff selector               | `src/redux/login/selectors.ts` (`selectIsStaff`)                |
| Navbar entry                 | `src/components/Navbar/navbar.tsx` ("Upload a video" menu item) |

## How It Works

### Access Control

- The Navbar shows "Upload a video" only when `selectIsStaff` is `true`.
- `FileUpload` redirects non-staff users to `/videos` and renders nothing.
- The proxy only requires a valid session for `/upload-video` (like every non-public route).
- This is a UI convenience. The backend must enforce staff permission on `POST /events/videoassets/` and `POST /events/`; that is not verifiable from this repository.
- Sessions persisted before `is_staff` existed default to non-staff (persist migration v2) until the next login.

### Flow

1. **Pick a file** (`VideoPicker`). Drag-and-drop or the "Select File" button. Allowed MIME types come from `ALLOWED_TYPES` (MP4, MOV, AVI, WebM) and the size limit is `MAX_VIDEO_FILE_SIZE_BYTES` (1 GB). Rejections show an error toast.
2. **Upload starts immediately** (`useVideoUpload.startUpload`). The file is sent as `multipart/form-data` with `XMLHttpRequest` (for progress events) to `/bff/events/videoassets`, with the `x-requested-with` guard header. The BFF proxy attaches the token from the HttpOnly cookie.
3. **Fill the form** (`VideoForm`). Fields: title, presenters (user search, at least one required), event date, description, thumbnail (auto-generated or custom image), playlists, tags. Validation uses `yup`; the upload status is shown in the card footer (`role="status"`).
4. **Publish**:
   - Selecting Publish while the upload is still running queues the submission ("Queued…"); it publishes automatically when the upload finishes, or is dropped if the upload fails.
   - New tags (free-text entries) are created first with `createTag`, then `createEvent` is sent as `multipart/form-data` with the video asset id.
   - On success the user is taken to `/videos/<slug>`; on failure a "Failed to publish" toast is shown.

### `useVideoUpload`

Returns `{ uploadProgress, isUploading, videoAssetId, error, startUpload }`.

| Situation                     | Behavior                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| `201` with a valid JSON body  | `videoAssetId` is set                                        |
| `201` with an invalid body    | `error`: "Upload failed. Please try again."                  |
| `401`                         | Dispatches `logout()` and sets a "session has expired" error |
| Other status                  | `error`: "Upload failed. Please try again."                  |
| Network error                 | `error`: "Network error during upload."                      |
| New file selected mid-upload  | The previous request is aborted, state is reset              |
| Component unmounts mid-upload | The in-flight request is aborted                             |

### `useCloseOnScroll(containerId, onScroll)`

Attaches a `scroll` listener to the element with the given id and calls the latest `onScroll`. The form's autocompletes and date picker use it with `FORM_SCROLL_CONTAINER_ID` so open popups close when the form scrolls.

## Analytics

Events are in the `upload_video` category (see [Analytics Tracking](./analytics-tracking.md)). Payloads contain only counts, flags, MIME type and size.

## Edge Cases and Known Limitations

- The BFF proxy streams the request body to the backend (`duplex: "half"`, `content-length` forwarded). Reverse proxies or ingress in front of the app (for example an nginx `client_max_body_size`) must allow bodies up to 1 GB; that configuration is outside this repository.
- If `createEvent` fails after new tags were created, those tags remain on the backend. Retrying the publish in the same form reuses them instead of creating duplicates.
- Thumbnails must have an `image/*` MIME type (checked client-side). There is no client-side size limit because the backend limit is not defined in this repository.
- API failures during publish show the single error toast from `customBaseQuery`; the form only adds a success toast and analytics.
- The `uploadVideo` feature flag no longer exists; access is controlled by `is_staff`.

## Tests

`videoPicker.test.tsx`, `uploadVideo.test.tsx`, `form.test.tsx`, `form.analytics.test.tsx` (feature); `src/hooks/useVideoUpload.test.tsx`, `src/hooks/useCloseOnScroll.test.tsx`; `src/redux/events/uploadEndpoints.test.tsx`; `src/redux/login/selectors.test.ts`.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| "Upload a video" is missing from the user menu | The logged-in user's `is_staff` is `false`, or the session was persisted before `is_staff` existed (log in again) |
| Visiting `/upload-video` sends you back to `/videos` | Same as above: `FileUpload` redirects non-staff users |
| "Your session has expired. Please log in again." | The proxy returned `401`; `logout()` was dispatched and the `access` cookie is cleared |
| "Upload failed. Please try again." for a large file | A non-`201` response or a body the frontend could not parse. A reverse proxy body-size limit is a possible cause (unverified) |
| "Network error during upload." | The request never completed (connection dropped or the proxy/backend was unreachable) |
| Upload requests return `403` `{"message":"Forbidden"}` | The `x-requested-with: session-portal` guard header is missing; uploads must go through `useVideoUpload` |
