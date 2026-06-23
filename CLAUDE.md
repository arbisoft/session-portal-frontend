# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build (Turbopack)
npm run lint         # ESLint + TypeScript check
npm run typecheck    # TypeScript only
npm run test         # Jest (all tests)
npm run test:cov     # Jest with coverage (80% branch/function/line thresholds)
npm run sb           # Storybook on port 6006
npx playwright test  # E2E tests (requires: npx playwright install)
```

Run a single Jest test file:

```bash
npx jest src/redux/parseError.test.ts --verbose
```

Run Jest tests matching a name pattern:

```bash
npx jest --testNamePattern="should parse error"
```

**Pre-commit hook** (runs automatically on every commit): `lint` → `test:cov` → `build`. All three must pass. Expect 1–2 minutes per commit.

## Architecture

The app is a Next.js 15 App Router frontend with four distinct layers:

```
src/app/          → thin route entry points (page.tsx files)
src/features/     → page-level components with all business logic
src/components/   → reusable UI primitives (no business logic)
src/redux/        → RTK Query API slices + login slice + store
src/hooks/        → custom hooks (no auth hook — auth is middleware-only)
src/models/       → TypeScript interfaces for API shapes
src/utils/utils.ts → pure transform/display helpers
```

**Route → Feature mapping:**

- `/` and `/upload-video` → middleware redirects both to `/videos`
- `/login` → `LoginPage`
- `/videos` → `VideosListingPage`
- `/videos/results` → `SearchResultsPage`
- `/videos/[videoId]` → `VideoDetail` (uses slug, not numeric ID)

## Authentication

Auth has no `useAuth` hook. It is split across three places:

1. **`src/middleware.ts`** — Edge Runtime, runs on every request. Reads the `access` HttpOnly cookie, validates JWT expiry locally (no network call), and redirects unauthenticated requests to `/login?redirect_to=<path>`.
2. **`src/app/login/actions.ts`** — Next.js server action `loginAndSetCookie`. POSTs Google `access_token` to `POST /api/v1/users/login`, sets the HttpOnly cookie, returns data. The client then dispatches `loginActions.login(data)` to update Redux.
3. **`src/redux/customBaseQuery.ts`** — Any `401` response dispatches `{ type: "login/logout" }`, resetting Redux login state.

`MainLayoutContainer` does NOT enforce auth — it is purely layout.

## RTK Query Infinite Scroll Cache

`getEvents` and `recommendation` both use a custom accumulation strategy that lets infinite scroll work without pagination-keyed cache entries:

- **`serializeQueryArgs`**: excludes `page` from the cache key — all pages of the same filter share one cache entry
- **`merge`**: if `page === 1`, resets `results` to `[]`; otherwise appends results deduped by `id`
- **`forceRefetch`**: uses `lodash/isEqual` to deep-compare args

This means when a filter changes, setting page back to 1 (via `setPage(1)` in `useVideoQueryManager`) causes `merge` to clear and repopulate the cache correctly.

## Feature Flags

Feature flags in `src/constants/featureFlags.ts` can be overridden via URL query params during development:

```
/videos?darkModeSwitcher=true
```

`useFeatureFlags` reads `useSearchParams()` and applies: URL param > config > semver check. Both current flags (`darkModeSwitcher`, `uploadVideo`) are `enabled: false`.

## Key ESLint Rules That Will Catch You

- **Imports**: must be sorted in groups (builtin → external → internal `@/` → parent/sibling). `import/order` is enforced as an error.
- **Test names**: `test()` calls must start with `"should"` — use `it("should …")` or `test("should …")`.
- **React Hook Form**: `watch()`, `formState` destructuring, and `control` property access are all `no-restricted-syntax` errors. Use `useWatch`, `useFormState`, and pass `control` as a prop.
- **`React.use*`**: accessing hooks via `React.useX` is restricted; import the hook directly.
- **`no-console`**: only `console.warn` and `console.error` are allowed.
- **Max line length**: 130 characters.
- **Double quotes** enforced by Prettier via ESLint.

## Notification System

`notificationManager` (exported from `src/components/Notification/notification.tsx`) is a singleton accessible outside React. `customBaseQuery` uses it directly to show API error toasts. Inside components use the `useNotification()` hook instead.

## Branching and CI

- All PRs target `dev`. Never commit directly to `main`.
- Merging `dev` → `main` triggers automated release via `release-it`.
- Lint CI runs on push/PR to `dev`.
- Conventional commits are enforced by `commitlint` via the commit-msg hook.

## Path Alias

`@/` maps to `src/`. Use it for all non-relative imports within the project.
