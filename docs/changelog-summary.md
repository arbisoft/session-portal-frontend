# Changelog Summary

## Source

This summary is based on `CHANGELOG.md` currently present in the repository.

The root `README.md` also links to `CHANGELOG.md`, so it is now part of the primary documentation path for the repository.

## Release Notes

### `1.3.6` — `2026-09-14`

- GA event tracking instrumented across core user interactions
- SonarQube static analysis integrated into CI build

### `1.3.5` — `2026-09-07`

- login now validates the access token and preserves the original error cause
- Next.js navigation errors filtered out of Sentry reports
- automatic recovery from stale chunk load errors after a deploy
- Claude code-review skill restructured; task-generator skill added

### `1.3.4` — `2026-07-02`

- Docker build context now includes `next.config.ts`

### `1.3.3` — `2026-07-02`

- Docker build context now includes root-level Sentry configs

### `1.3.2` — `2026-07-02`

- Sentry integrated for error tracking and session replay (with build-time vars wired into the image build)
- error boundary and not-found pages added
- aria heading roles added to sort and filter section labels
- login error handling moved inside `startTransition` and routed through `notificationManager`
- `CLAUDE.md` added, skills migrated to `.claude`, project docs overhauled

### `1.3.1` — `2026-04-22`

- release workflow added, docs updated, RTK Query tags and UI performance improvements

### `1.3.0` — `2026-03-24`

- videos: routing, loading optimization and responsive layout fixes
- secure server-side authentication via middleware and server actions
- project reference and contribution documentation added

### `1.2.0` — `2025-11-20`

- automated deployment trigger, playlist/tag menu responsiveness, post-login redirect to video page
- videos open in a new tab; video hover preview; empty and retry states for sessions
- accessibility improvements across navigation, filters, cards, and sidebar
- Next.js 15 / React 19 and MUI upgrades; Docker image optimization

### `1.1.8` — `2025-08-05`

- featured video slider; default sorting set to newest first
- e2e tests for VideoDetail; GitHub Action now runs on release
- fixes for frequent logout and session expiry, featured video visibility, search icon and recommendation card overlap

### `1.1.7` — `2025-07-10`

- lazy loading, GTM and Hotjar integration, updated page titles and dark mode default
- Jest tests for VideoPlayer
- fixes for scroll flicker, tag filtering, skeleton loader API call, infinite scroll and invalid page errors

### `1.1.6` — `2025-06-26`

- sidebar skeleton loader, pagination and video loading fixes; right suggestion bar scrollbar removed; `order_by` dropped from search API

### `1.1.5` — `2025-06-19`

- fixed header, Google login "Loading..." fix, pagination fixes, filter reset on playlist/tag change, slug-based video URLs

### `1.1.4` — `2025-06-04`

- Arbisoft header logo, larger fonts, featured video shown as a normal card under playlists/tags, "All videos" label, query param pagination fix

### `1.1.3` — `2025-05-27`

- video upload pages, light mode, pagination and styling fixes

### `1.1.2` — `2025-05-15`

- broken thumbnail fix, px to rem font sizes, Notification tests

### `1.1.1` — `2025-05-08`

- dark mode default, page metadata, large play icon, language moved out of URL, favicon

### `1.1.0` — `2025-04-15`

- first release: boilerplate, login, layout, video player, listing and detail pages, redux-persist, Jest/Playwright setup and CI

## Changelog Conventions

Release notes are generated using `release-it` with `@release-it/conventional-changelog`.

Configured changelog sections in `package.json` include:

- Features
- Bug Fixes
- Performance Improvements
- Reverts
- Documentation
- Code Refactoring
- Tests
- Continuous Integration

## Versioning Notes

- Latest git tag and `CHANGELOG.md` release is `1.3.6` (2026-09-14).
- `package.json` still reads `1.2.0`; it has not been bumped by the release tags since `1.2.0`.
- Feature flags reference version thresholds: `darkModeSwitcher` requires `>=1.2.0`, `uploadVideo` requires `>=1.3.0`. Both are currently disabled regardless of version (`enabled: false`).

## Observation

The changelog currently exposes a useful high-level history of product and engineering priorities, especially around UX, accessibility, performance, and infrastructure.
