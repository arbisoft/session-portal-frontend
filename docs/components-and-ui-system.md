# Components and UI System

## UI Stack

The application uses:

- Material UI (`@mui/material`)
- Emotion (`@emotion/react`, `@emotion/styled`)
- custom reusable components under `src/components/`

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
- auth enforcement through `useAuth()`

### `Navbar`

Used as the top navigation bar. Based on surrounding code and tests/stories, it also handles drawer toggle behavior.

### `Sidebar`

Used for left-side navigation and drawer rendering.

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

### `ReadMore`

Used on the video detail page to expand/collapse long descriptions.

## Video Presentation Components

### `VideoCard`

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
- `posterSrc`
- `posterAlt`
- `playsInline`
- `crossOrigin`

## Form-Related UI

The repository includes shared components such as:

- `Select`
- `Button`

It also enforces React Hook Form performance practices via ESLint rules.

## Storybook Presence

Storybook stories are present beside multiple components, including:

- `Button`
- `Navbar`
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
