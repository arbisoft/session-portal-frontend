# Components and UI System

## UI Stack

The application uses:

- Material UI (`@mui/material`)
- Emotion (`@emotion/react`, `@emotion/styled`)
- custom reusable components under `src/components/`

### Styling convention

Material UI 9 no longer supports system props (`<Box display="flex" mb={1}>`, `<Typography textAlign="center">`). They fail type-checking and are forwarded to the DOM element, which makes React log "does not recognize the `justifyContent` prop" warnings. Pass one-off styles through the `sx` prop instead (`<Box sx={{ display: "flex", mb: 1 }}>`).

For `Autocomplete`, `renderInput` params expose `params.slotProps.input`, `params.slotProps.inputLabel` and `params.slotProps.htmlInput`; `params.InputProps` no longer exists. Spread `params` into `TextField`, and when you override `slotProps`, merge `params.slotProps` first (see `src/features/UploadVideo/selectFields.tsx`).

## Theme System

The theme provider is implemented in `src/components/theme/theme-provider.tsx`.

Observed characteristics:

- MUI `createTheme` + `responsiveFontSizes`
- CSS variable color scheme support
- custom dark-mode-first palette configuration
- global typography configuration using `Inter` and `Roboto Condensed`
- custom typography variants:
  - `bodySmall`
  - `bodyMedium`
  - `bodyLarge`
- global body background styling through `MuiCssBaseline`

`InitColorSchemeScript` is loaded at the app root to reduce theme flashing on load.

## Shell and Navigation Components

### `MainLayoutContainer`

Provides the authenticated application shell:

- top navbar
- left sidebar on larger screens
- optional drawer for smaller screens
- optional right sidebar region
- auth redirect enforcement is handled by the proxy, not by this component

### `Navbar`

Used as the top navigation bar. Based on surrounding code and tests/stories, it also handles drawer toggle behavior.

### `Sidebar`

Used for left-side navigation and drawer rendering. The first item is **Home** (links to `/videos`; it used to be labeled "All Videos"). Next to it sits a filter button (`aria-label="Filter and sort videos"`) that opens `FilterSortMenu`; the button is a sibling of the Home link, not inside it, and is not part of the playlist `role="menu"`. The Home link sits in a presentational `MenuList` (`role="none"`) because MUI 9 `MenuItem`s must be inside a `MenuList`. Playlists and tags follow.

### `FilterSortMenu`

Presentational, URL-agnostic menu for sorting (Newest/Oldest first) and filtering by year, with a "Clear All Filters" item. The selected sort and year carry a check mark (not only MUI's subtle highlight) and `aria-checked`. It is controlled through props (`anchorEl`, `sort`, `year`, `onSortChange`, `onYearChange`, `onClear`, `onClose`) and has no mount-time side effects. It fires the `video_sort_change`, `video_filter_year` and `video_filter_clear` analytics events. Used by `Sidebar` and `FilterSortControl`; the URL logic lives in `useVideoFilters`. Sort options and labels are shared through `src/constants/sort.ts`.

### `FilterSortControl`

The labelled **Filter and Sort** dropdown shown at the top right of the videos listing, next to the page title. The button always shows the current choice (`Newest first`, or `2020 · Oldest first` when a year is applied) and owns the open/close state of a `FilterSortMenu`. It takes the same value/handler props as the menu (`availableYears`, `sort`, `year`, `onSortChange`, `onYearChange`, `onClear`).

## Feedback and Utility Components

### `NotificationProvider`

Implemented in `src/components/Notification/notification.tsx`.

Features:

- global notification manager singleton
- snackbar rendering with severity
- `useNotification()` hook for client components
- external `notificationManager.showNotification(...)` support

### `EmptyState`

Used across listing/search flows for:

- request failure states
- no results states
- empty content states

### `ConfirmDialog`

Implemented in `src/components/ConfirmDialog/confirmDialog.tsx`. A presentational MUI dialog (`title`, `description`, `confirmLabel`, optional `cancelLabel`, `onConfirm`, `onCancel`) with `aria-labelledby` / `aria-describedby`. The safe (cancel) button is focused first, and Escape or a backdrop click calls `onCancel`. Used by the upload page to confirm cancelling or removing a video, discarding an unfinished upload and leaving the page.

### `ReadMore`

Used on the video detail page to expand/collapse long descriptions.

It has two modes:

- **Word limit** (default): shows the first `amountOfWords` words (default 36) and hides the rest behind a toggle.
- **Line clamp** (`maxLines`): clamps the text to that many lines with CSS (`-webkit-line-clamp`, driven by the `--read-more-max-lines` custom property). The "Show More / Show Less" toggle only appears when the text actually overflows; overflow is re-measured on window resize, and the component collapses again when `text` changes. The full text always stays in the DOM, so screen readers read it even while clamped. The video detail page uses `maxLines={4}`.

The toggle is a native `<button type="button">` with `aria-expanded` (restyled to look like a link via `.show-more-button`), so Enter and Space work without custom key handlers. Do not replace it with a `role="button"` span (Sonar `typescript:S6819`).

Both modes accept an optional `onToggle(isExpanded)` callback fired on click or keyboard toggle, so features can attach analytics without business logic living in the component (the video detail page tracks `video_description_toggle` this way).

## Video Presentation Components

### `VideoCard`

Displays video thumbnails with metadata, supports responsive image sizing for different screen sizes.

Used across:

- featured slider
- video listing grid
- search results list
- recommendation sidebar

Observed variants include:

- `featured-card`
- `search-card`
- `related-card`

### `VideoPlayer`

Used on the video detail page and receives fields such as:

- `videoSrc`
- `videoType` (`"video/mp4"` by default, or `"video/webm"` / `"video/ogg"`): the MIME type handed to Vidstack alongside `videoSrc`. The stream URL (`/bff/video/<slug>`) has no file extension, so without it Vidstack cannot pick a loader and logs "could not find a loader for any of the given media sources" before falling back to fetching the source headers
- `posterSrc`
- `posterAlt`
- `playsInline`
- `crossOrigin`
- `controlsDelay` (milliseconds of inactivity during playback before the controls auto-hide; default `3000`, controls stay visible while paused)
- `keyTarget` (`"document"` by default, or `"player"`): where Vidstack keyboard shortcuts listen. With `"document"` the arrow keys (and `j`/`l`) seek (5s, 10s with Shift), the number keys `0`-`9` jump to 0-90% of the video, Space/`k` toggles play, `m`/`f`/`c`/`i` toggle mute/fullscreen/captions/picture-in-picture, and Up/Down change volume wherever focus is on the page. Vidstack ignores them while focus is in an input, textarea, select, contenteditable, menu item (`role=menuitem*`) or timer, and for Enter/Space on a `button` or `[role=button]`. The tradeoff is that Space and Up/Down no longer scroll the page (including when a plain link is focused). The shortcuts are bound to the first player on the page, which is fine because only the video detail page mounts one. With `"player"` they only work while focus is inside the player, which is why seeking silently stopped after clicking elsewhere on the page.

The player is built on Vidstack and themed in `src/components/VideoPlayer/styles.css`. The seek bar (`.vds-time-slider`) fill uses a blue gradient, driven by `--seek-gradient-start` (`#1d4ed8`) and `--seek-gradient-end` (`--focus-color`, `#4e9cf6`) on `.player`; its thumb (the dot) is solid `--focus-color`. The volume slider keeps Vidstack's default brand color. The settings menu is trimmed: `noAudioGain` removes the Audio Boost slider, and a top-level CSS rule hides the "Announcements" toggle in the Accessibility menu (Vidstack has no prop for it; announcements are on by default, and the rule matches the English `aria-label`, so revisit it if `translations` is ever passed to `DefaultVideoLayout`). The toggle's choice is persisted by Vidstack in `localStorage` (`vds-player::announcements`), so a user who had already switched announcements off keeps that setting but can no longer change it. Vidstack 1.15.7's default layout has no "Loop" control, so there is nothing to remove for it.

## Form-Related UI

The repository includes shared components such as:

- `Select`
- `Button`

It also enforces React Hook Form performance practices via ESLint rules.

## Storybook Presence

Storybook stories are present beside multiple components, including:

- `Button`
- `Navbar`
- `ConfirmDialog`
- `Notification`
- `ReadMore`
- `Select`
- `MainLayoutContainer`

This indicates the codebase supports isolated component development and visual review.

## Accessibility Signals Found

Recent changelog entries and feature code suggest active accessibility work, including:

- keyboard-accessible navigation and sidebar interactions
- accessible naming for controls
- keyboard focus handling for content and cards
- tab order improvements on filters and metadata

## Notes

- Component-level prop APIs are only partially documented here because a full symbol-by-symbol component reference was not generated from every component file.
- If desired, this documentation can be extended into per-component reference pages later.
