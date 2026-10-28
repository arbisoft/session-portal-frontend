# Upload Video Module

## Responsibility

Lets staff users upload a video file (up to 20 GB), describe it, and publish it as an event. The page is a single form: every field is visible from the start and the video picker is a section of it, not a separate first step. The video is uploaded in the background in resumable chunks while the user fills in the metadata; publishing is allowed as soon as the upload starts and is queued until the server has finished processing the file. An interrupted upload (lost connection, refresh, server restart) continues from the last byte the server confirmed instead of starting over.

## Who and Why

- **Users:** accounts whose login response has `user_info.is_staff === true`. Everyone else cannot see the entry point and is redirected away from the route.
- **Purpose:** moves publishing out of back-office tooling and into the portal.

## Where It Lives

| Concern | File |
| --- | --- |
| Route | `src/app/upload-video/page.tsx` |
| Orchestrator and staff guard | `src/features/UploadVideo/uploadVideo.tsx` |
| Form (layout, validation, publish) | `src/features/UploadVideo/form.tsx` |
| Video dropzone (no file yet) | `src/features/UploadVideo/videoPicker.tsx` |
| Video status panel and publish status text | `src/features/UploadVideo/uploadStatus.tsx` |
| Sticky Publish footer | `src/features/UploadVideo/publishBar.tsx` |
| Thumbnail source toggle | `src/features/UploadVideo/thumbnailField.tsx` |
| Text / date fields, `FieldLabel` | `src/features/UploadVideo/fields.tsx` |
| Presenter, playlist, tags | `src/features/UploadVideo/selectFields.tsx` |
| Leave-page confirmation | `src/features/UploadVideo/leaveGuardDialog.tsx` |
| Shared confirmation dialog | `src/components/ConfirmDialog/` |
| Upload hook | `src/hooks/useVideoUpload.ts` |
| Upload speed / time left | `src/hooks/useUploadRate.ts` |
| Unsaved-work guard | `src/hooks/useLeaveGuard.ts` |
| Stray file-drop guard | `src/hooks/usePreventFileDrop.ts` |
| Upload engine (no React) | `src/services/resumableUpload/` (see below) |
| Pure helpers | `src/utils/upload.ts` (sizes, rate, video type check, title from file name, event timestamp), `src/utils/tags.ts` |
| Endpoint paths | `src/endpoints/events.ts` (`uploadVideoAsset`), `src/endpoints/users.ts` |
| RTK Query endpoints | `src/redux/events/apiSlice.ts` |
| Staff selector | `src/redux/login/selectors.ts` (`selectIsStaff`) |
| Navbar entry | `src/components/Navbar/navbar.tsx` ("Upload a video" menu item) |

## How It Works

### Access Control

- The Navbar shows "Upload a video" only when `selectIsStaff` is `true`.
- `FileUpload` redirects non-staff users to `/videos` with an info toast ("Only staff members can upload videos") and renders nothing.
- The proxy only requires a valid session for `/upload-video` (like every non-public route).
- This is a UI convenience. The backend must enforce staff permission on `POST /events/videoassets/` and `POST /events/`; that is not verifiable from this repository.
- Sessions persisted before `is_staff` existed default to non-staff (persist migration v2) until the next login.

### Flow

The page is one card with a **Video** section and the metadata fields side by side from `md` up (video first, stacked above the fields on small screens; the DOM order is the same so Tab order matches what is on screen). The page scrolls normally and the footer with Publish is sticky, so it is always reachable.

1. **Choose a video** (`VideoPicker`, shown in the Video section until a file is chosen). Drag-and-drop onto the dashed zone or the "Select video" button. The type is checked with `isAllowedVideoFile` (`ALLOWED_TYPES`, falling back to `ALLOWED_VIDEO_EXTENSIONS` when the browser reports no MIME type, e.g. some `.mov` files) and the size limit is `MAX_VIDEO_FILE_SIZE_BYTES` (20 GB, the same as the backend `RESUMABLE_UPLOAD_MAX_FILE_BYTES`). The file dialog is filtered with the same constants (`ALLOWED_TYPES` plus `ALLOWED_VIDEO_EXTENSIONS`), so a `.mov` that reports no MIME type is still selectable. A rejection shows a persistent inline error alert. Dropping several files uses the first and says so. `usePreventFileDrop` stops a file dropped anywhere else on the page from making the browser open it and leave the page. If an unfinished upload from an earlier page load exists, an info alert names it and offers **Discard** (with a confirmation); selecting the same file continues it, any other file starts over.
2. **Upload starts immediately** (`useVideoUpload.startUpload`). The upload engine creates (or re-attaches to) a server upload session and sends the file in sequential chunks (the server's `chunk_size`, 8 MiB by default) through the BFF proxy. The Video section becomes `UploadStatusPanel`: file name and size, progress bar, `percent · bytes sent of total · speed · time left` (speed and time left from `useUploadRate`, shown after a few seconds of data), and **Pause / Resume (Retry now) / Cancel upload** buttons. **Cancel upload** and **Remove video** (after completion) ask for confirmation, then return to the picker; **Choose another video** after a failure does not ask. The form keeps everything typed. Focus moves to "Select video" when the picker comes back.
3. **Fill the form** (`VideoForm`) at any time, including before choosing a video. Fields: title (suggested from the file name via `titleFromFileName` when empty, max 255 characters), presenters (user search from 2 characters, at least one required), session date (defaults to today), description, thumbnail, playlists, tags. Required fields carry the label asterisk, optional ones say "(optional)". Validation uses `yup` with `mode: "onTouched"` (a field is checked when the user leaves it, then on every change); errors are `helperText` linked to the input, and a failed submit focuses the first invalid field and the footer says "Fix the highlighted fields to publish."
   - **Thumbnail** (`ThumbnailField`): a two-button toggle (Auto-generated / Custom image, exposed with `aria-pressed`). A custom image must be JPG, PNG or WebP and at most `THUMBNAIL_MAX_BYTES` (5 MB; a client-side policy, the backend limit is not defined in this repository), is previewed at 16:9 and can be replaced or removed.
   - **Tags**: type and press Enter to create. Input is normalized (`normalizeTagSelection`): leading `#` removed, empty and duplicate names dropped, and a name matching an existing tag in any letter case reuses that tag instead of creating a duplicate. Names are capped at `TAG_MAX_LENGTH` (100, the backend column size).
   - **Presenters**: chips show the name; two selected people with the same name also show their email.
4. **Publish** (`PublishBar`; a single `role="status"` line next to the button says what is happening and why Publish is unavailable, from `getPublishStatus`):
   - Publish is disabled with no video, after a failed upload, while publishing and while queued.
   - Selecting Publish while the upload is still running or being processed queues the submission ("Queued…"; **Cancel queued publish** is offered). When the server reports the upload `COMPLETED` the form is read again, so edits made while queued are published; it is dropped if the upload fails or the video is removed.
   - New tags (free-text entries) are created first with `createTag`, then `createEvent` is sent as `multipart/form-data` with the video asset id. `event_time` is the chosen day pinned to 12:00 local time (`toEventTimestamp`) so it cannot land on the previous day in another timezone. A guard prevents two publishes running at once.
   - On success the user is taken to `/videos/<slug>` with a "Session published successfully!" toast; on failure the API error toast from `customBaseQuery` is shown.

### Protecting unsaved work

`LeaveGuardDialog` mounts `useLeaveGuard` while a video is chosen or the form has been edited. A reload or tab close gets the browser's native prompt. A click on an in-app link is intercepted in the capture phase (the App Router has no navigation blocker), and a "Leave this page?" `ConfirmDialog` is shown; confirming calls `router.push` with the intercepted path (validated with `isValidInternalRedirectPath`). External, new-tab, download, modified-click and same-page links are not intercepted, and programmatic navigation after publishing is not blocked. The browser Back button is not intercepted. An unfinished upload can be continued later by selecting the same file.

### Resumable upload engine (`src/services/resumableUpload/`)

Framework-free TypeScript; `useVideoUpload` is its React binding. Unlike `src/services/runs-on-server-side/`, this folder runs in the browser.

| File | Role |
| --- | --- |
| `uploadManager.ts` | `UploadManager`: the state machine (create/re-attach, chunk loop, retries, pause/resume/cancel, finalization polling) |
| `transport.ts` | `createUploadApi`: `fetch` calls to `/bff/events/videoassets` with the `x-requested-with` guard header; `UploadApiError`. The session id is URL-encoded before it is joined to the path, because it is also read back from `localStorage` |
| `storage.ts` | Persists the minimum needed to find the session again (`localStorage`, best effort) |
| `failures.ts` | Failure messages, notices and error-to-failure mapping |
| `environment.ts` | Abortable sleep and online/offline detection |
| `types.ts` | `UploadPhase`, `UploadSnapshot`, `UploadEvent` |
| `fakeUploadServer.ts` | In-memory implementation of the protocol, used by tests only |

Backend protocol (see the backend's `UPLOADS.md`): `POST /events/videoassets/` creates a session, `PATCH /events/videoassets/<id>/` appends a chunk at `Upload-Offset`, `GET` returns the confirmed `offset` and status, `DELETE` cancels, `POST .../finalize/` re-queues finalization. The same endpoints are listed in [API Reference](../api.md).

**The server decides where to resume.** Progress shown is `confirmedOffset / fileSize`, never an estimate from bytes in flight. After any chunk that failed, was aborted (pause) or got no response, the next step is a status query, so a chunk the server already committed (lost acknowledgement) is not sent twice and a chunk it did not commit is not skipped. A `409 offset_mismatch` carries the server offset, and the client continues from it.

**Phases** (`UploadPhase`): `idle`, `creating`, `uploading`, `paused`, `interrupted`, `finalizing`, `completed`, `failed`, `cancelled`. At the end of the transfer the percentage is 100 but the phase is `finalizing` ("Processing video…"): the video asset id is only exposed in `completed`, after the backend has verified the file and created the asset.

**Retries.** Transient failures (network errors, `500/502/503/504`, `408/425/429`, `upload_in_progress`, `incomplete_chunk`, `checksum_mismatch`) are retried with exponential backoff and full jitter (1 s base, 30 s cap, a longer `Retry-After` is honoured up to 5 minutes). After 8 retries in a row (the 9th consecutive failure) the upload stops in `interrupted` with `stalled: true` and the user chooses **Retry now**; the session and its progress are kept. Failures while the browser is offline do not use up retries: the engine waits for the `online` event. Retry counting restarts only when a chunk is committed, so a flaky connection where status queries succeed but chunks fail still stops eventually.

**Per-chunk integrity.** Each chunk carries `Upload-Checksum: sha256 <base64>` (computed with SubtleCrypto when available, skipped in insecure contexts); the backend rejects a chunk whose bytes do not match and commits nothing. The backend also verifies the file size and container signature at finalization.

**Surviving a reload.** After every committed chunk `{ sessionId, fingerprint (name, size, lastModified), confirmedBytes, updatedAt }` is written to `localStorage` under `upload-video:session:v1:<userId>`. It contains no token, no file content and no file path; the file cannot be stored, so after a reload the user must select the same file. A selected file continues the session only when its fingerprint matches and the server still reports a usable session for the same size; otherwise a new session is created (and a mismatching stored one is cancelled on the server). Navigating away or unmounting stops the transfer but does not cancel the server session.

**Pause** aborts the in-flight request, so at most the current chunk is re-sent after resuming. **Cancel** stops the transfer, asks the server to delete the partial file (retrying briefly if a chunk is still being written) and returns to the picker.

### `useVideoUpload`

Returns the original fields `{ uploadProgress, isUploading, videoAssetId, error, startUpload }` plus `phase`, `notice`, `canPause`, `canResume`, `canCancel`, `pauseUpload`, `resumeUpload`, `cancelUpload`, `pendingUpload` and `discardPendingUpload`.

| Situation | Behavior |
| --- | --- |
| Upload completes (`COMPLETED`) | `videoAssetId` is set, `isUploading` is `false` |
| Connection lost / server error | `phase: "interrupted"`, `notice` explains, `isUploading` stays `true`, `error` stays `null` |
| Retries exhausted | `phase: "interrupted"`, resume with **Retry now** |
| Session rejected as unauthorized (`401`) | Dispatches `logout()`, `error`: "Your session has expired. Please log in again." |
| Session expired or cancelled on server | `error` asks the user to select the file again; the stored reference is dropped |
| Server out of disk (`507`) | `error` says so; retryable, the stored session is kept |
| File failed verification or processing | `error` explains; start a new upload |
| New file selected mid-upload | The running upload is stopped and replaced |
| Component unmounts mid-upload | The transfer stops, the server session is kept so it can be resumed |

The hook only re-renders when something visible changes (phase, whole percent, notice, failure), not on every chunk.

## Analytics

Events are in the `upload_video` category (see [Analytics Tracking](./analytics-tracking.md)). Payloads contain only counts, flags, MIME type, size and static reasons, never file names or session ids. The confirmation dialogs, queue cancel, multi-file drop and leave guard have their own events; see the table in Analytics Tracking.

## Edge Cases and Known Limitations

- The BFF proxy streams each chunk to the backend (`duplex: "half"`, `content-length` and the `upload-offset` / `upload-checksum` headers forwarded) instead of buffering it. `/bff` is excluded from the `src/proxy.ts` matcher, so Next's request-body buffering limit does not apply; chunks of at most 16 MiB stay far below any such limit anyway.
- Reverse proxies or ingress in front of the app and the backend must accept request bodies of at least the chunk size (`max_chunk_size`, 16 MiB by default) and allow enough time for one chunk on a slow uplink. A 20 GB body limit is no longer needed (for example nginx `client_max_body_size 16m;`, whose default of 1 MB would reject every chunk). This configuration is outside this repository and could not be verified.
- Finalization of a very large file takes minutes on the backend after the last chunk (verification, ffmpeg). The UI shows "Processing video…" and polls the session every 2 to 10 seconds; it never reports completion before the backend does.
- The engine uploads one chunk at a time per file. Two browser tabs on the same stored upload are safe (the server answers `upload_in_progress` or `offset_mismatch` and both reconcile) but waste bandwidth.
- Resume compatibility is checked with name, size and last-modified time plus the size the server holds. A different file with identical metadata would be accepted; the final size and container signature are verified by the backend.
- Browser persistence needs `localStorage`. In private windows or with blocked site data the upload still works, it only does not survive a reload.
- Each upstream `5xx` seen by the BFF is reported to Sentry (`bff_proxy`), so a backend restart during an upload can produce several reports.
- If `createEvent` fails after new tags were created, those tags remain on the backend. Retrying the publish in the same form reuses them instead of creating duplicates.
- Thumbnails are limited client-side to JPG/PNG/WebP up to 5 MB. This is a UI policy; the backend only validates that the file is an image (`ImageField`) and its own size limit is not defined in this repository.
- API failures during publish show the single error toast from `customBaseQuery`; the form only adds a success toast and analytics. Upload requests do not use `customBaseQuery`, so transient chunk failures never produce error toasts.
- The `uploadVideo` feature flag no longer exists; access is controlled by `is_staff`.
- The upload engine calls `fetch` itself rather than RTK Query: chunks are streamed `Blob` bodies with per-chunk abort, retry and reconcile semantics, and a toast per transient failure would be noise. It still goes through `/bff` with the guard header, so the token stays in the HttpOnly cookie.

## Tests

`videoPicker.test.tsx`, `uploadVideo.test.tsx`, `uploadStatus.test.tsx`, `form.test.tsx`, `form.analytics.test.tsx`, `selectFields.test.tsx`, `thumbnailField.test.tsx`, `leaveGuardDialog.test.tsx` (feature); `src/components/ConfirmDialog/confirmDialog.test.tsx`; `src/hooks/useVideoUpload.test.tsx`, `useUploadRate.test.ts`, `useLeaveGuard.test.tsx`, `usePreventFileDrop.test.tsx`; `src/services/resumableUpload/*.test.ts` (the manager is tested against `fakeUploadServer.ts`, including interruptions, lost acknowledgements, reloads, pause and cancel, and asserts the received bytes equal the file); `src/utils/upload.test.ts`, `src/utils/tags.test.ts`; `src/app/bff/[...path]/route.test.ts` (upload headers); `src/redux/events/uploadEndpoints.test.tsx`; `src/redux/login/selectors.test.ts`.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| "Upload a video" is missing from the user menu | The logged-in user's `is_staff` is `false`, or the session was persisted before `is_staff` existed (log in again) |
| Visiting `/upload-video` sends you back to `/videos` | Same as above: `FileUpload` redirects non-staff users |
| "Your session has expired. Please log in again." | The proxy returned `401`; `logout()` was dispatched and the `access` cookie is cleared |
| "Connection problem. Retrying…" that never ends | The backend or a proxy rejects chunk requests (for example a body-size limit below 16 MiB). After 8 retries the upload stops with a Retry now button |
| "Upload paused after repeated connection problems" | The connection was unstable; **Retry now** continues from the confirmed offset |
| "Unfinished upload: …" in the Video section | A previous upload was interrupted by a reload. Select the same file to continue, or Discard |
| "This upload expired or was cancelled" | The server session passed its expiry (72 h without activity by default), was cancelled, or was cleaned up. Select the file again |
| Stuck on "Processing video…" | The backend Celery worker is not running or cannot reach the media volume; finalization is queued there |
| "Network error during upload." | No longer shown: connection problems now surface as an interrupted upload that retries |
| "Leave this page?" appears when clicking a link | Intentional: a video is chosen or the form has unsaved edits. Stay to keep working, or leave and select the same file later to continue |
| Upload requests return `403` `{"message":"Forbidden"}` | The `x-requested-with: session-portal` guard header is missing; uploads must go through `useVideoUpload` |
