# Code Review Checklist — Session Portal

Apply every applicable item. Mark Critical / Warning / Suggestion per the severity definitions below.

---

## Severity Definitions

| Level | Meaning |
| --- | --- |
| 🔴 Critical | Causes crash, data loss, security breach, or blocks app function. Block merge. |
| 🟡 Warning | Bug-prone, degrades performance, or violates project conventions. Should fix. |
| 🟢 Suggestion | Style, readability, or minor maintainability. Optional but encouraged. |

---

## 1. Correctness & Bugs

### Auth & Middleware (Critical)

- [ ] `src/middleware.ts`'s `protectedRoutes` / path-prefix checks are updated when a new route needs auth gating — a new route under an existing protected prefix is covered automatically, but a new top-level route is not
- [ ] JWT validity check (`isValidToken`) stays a local, no-network-call check (Edge Runtime constraint) — don't introduce a `fetch`/API call into middleware
- [ ] Any redirect target read from a query param (`redirect_to`) is validated via `isValidInternalRedirectPath` before being used in a `NextResponse.redirect` — an unvalidated redirect target is an open-redirect vulnerability
- [ ] `src/app/login/actions.ts`'s server action sets the `access` cookie as HttpOnly server-side — never move token storage to `localStorage`/a non-HttpOnly cookie from client code
- [ ] Client-side Redux login state (`loginActions.login`) is only dispatched after the server action returns successfully — not optimistically before the cookie is confirmed set
- [ ] `customBaseQuery`'s `401` → `{ type: "login/logout" }` dispatch is preserved in any new base query or query wrapper — don't bypass `customBaseQuery` with a raw `fetchBaseQuery` for a new API slice

### RTK Query Correctness (Critical / Warning)

- [ ] New endpoints are added via `baseApi.injectEndpoints`, not a separate, parallel `createApi` instance
- [ ] Endpoints that raise `401`s go through `customBaseQuery` (the shared `baseApi` base query), not a hand-rolled `fetch` that skips the shared 401/error-toast handling
- [ ] Paginated/infinite-scroll endpoints follow the `getEvents`/`recommendation` pattern (`src/redux/events/apiSlice.ts`): `serializeQueryArgs` excludes `page` from the cache key so all pages of the same filter share one cache entry; `merge` resets `results` to `[]` when `arg.page === 1` and otherwise appends deduped by `id`; `forceRefetch` deep-compares args via `lodash/isEqual`. A new paginated list endpoint that instead keys the cache per-page will break infinite scroll silently (each page becomes its own cache entry, nothing accumulates)
- [ ] Any caller that changes a filter on a paginated endpoint resets to `page(1)` (mirroring `useVideoQueryManager`) — without it, `merge`'s reset-on-`page===1` branch never fires and stale results accumulate under the new filter
- [ ] Cache invalidation tags (`providesTags`/`invalidatesTags`) are correct for new mutations — a mutation that changes data an existing query depends on invalidates the matching tag rather than requiring a manual refetch
- [ ] Generated hook names exported from an API slice follow the existing convention (`use<Name>Query`, `useLazy<Name>Query`, `use<Name>Mutation`)

### React Correctness (Critical)

- [ ] **No component is defined inside another component's function body.** A `function Foo()` or `const Foo = () => ...` returning JSX, declared inside a parent component (as opposed to at module scope), gets a brand-new identity every parent render — React treats the JSX element as a different component type and **unmounts the entire subtree** instead of reconciling it, losing local state (open menus, focus, scroll position, video playback position) and doing far more DOM work than the change warrants. This is easy to miss in a component with several small "sub-render" helpers closing over the parent's props — hoist it to module scope and pass what it needs as explicit parameters instead. Flag this as Critical, not a style nit — it's a functional regression, and it compounds badly in a list/grid (e.g. the video card grid, playlist rows).
- [ ] `useEffect` cleanup is returned when the effect sets up subscriptions, timers, or event listeners (video player events, resize/intersection observers for infinite scroll, debounce timers)
- [ ] `useEffect` dependency arrays list what the effect actually _reads reactively_ — not a large or frequently-changing value (a full results array, an object prop) included "defensively" when the effect doesn't need to re-run when that value's _contents_ change
- [ ] No state update after unmount — async callbacks (video load, API calls) that call `setState` are guarded or the component lifecycle is respected
- [ ] Keys in lists (video cards, search results, playlist items) are stable and unique — not array index when list order can change (e.g. after `merge`'s dedupe/append on infinite scroll)
- [ ] Loading and error states from RTK Query hooks (`isLoading`, `isError`, `isFetching`) are handled in the UI, not assumed to always resolve successfully
- [ ] Server actions and other server-only code (`src/services/runs-on-server-side/**`) are never imported into a `"use client"` component — this either breaks the build or leaks server-only logic into the client bundle

### Logic Bugs (Critical / Warning)

- [ ] Date/time formatting goes through `date-fns` helpers already in `src/utils/utils.ts` (`formatDateTime`, `convertSecondsToFormattedTime`) rather than a new ad hoc formatter — check before adding a second date-formatting implementation
- [ ] Optional/nullable fields on `Event`/`EventDetail`/`Tag`/`Playlist` (see `src/models/Events`) are guarded before use — absence must not crash a render
- [ ] Feature-flag-gated code checks `useFeatureFlags`'s resolved value (URL param > config > semver check), not the raw `FEATURE_FLAGS` config directly — bypassing the hook skips the URL-override and semver-check precedence

---

## 2. Security

- [ ] No hardcoded secrets (API base URLs, client IDs, Sentry DSNs) in source — these must come from `src/constants/constants.ts`'s `process.env.*` reads
- [ ] A new env var that must stay server-only is **not** prefixed `NEXT_PUBLIC_` — that prefix inlines the value into the client bundle at build time; only genuinely public values (base URL, GTM ID, client ID meant for the browser) should use it
- [ ] No open redirect — any redirect target derived from user input (query params, especially `redirect_to`) is validated against `isValidInternalRedirectPath` or equivalent before use in `NextResponse.redirect`/`router.push`
- [ ] Auth tokens are never read from or written to `localStorage`/`sessionStorage`/a non-HttpOnly cookie — the `access` cookie must stay HttpOnly, set only by the server action
- [ ] User-generated or API-sourced text (event titles/descriptions, tags) rendered in the UI is not passed through `dangerouslySetInnerHTML` without sanitization
- [ ] No `console.log` of tokens, cookies, or user PII in production-path code (only `console.warn`/`console.error` are allowed by ESLint anyway, but check even those for sensitive payloads)
- [ ] File upload handling (`ALLOWED_TYPES` in `src/constants/constants.ts`, the upload-video feature) validates MIME type/extension against the allowlist both client-side and (if applicable) before any request that persists the file

---

## 3. Performance

- [ ] RTK Query hooks use sensible `skip`/cache options for data that doesn't need to refetch every render (tags, event types, playlists) rather than refetching on every mount unnecessarily
- [ ] No redundant sequential `await` calls that could run concurrently via `Promise.all` when independent — and never `await` inside a `.forEach` (ESLint-enforced restricted syntax; the awaits won't actually be sequenced/awaited by the caller)
- [ ] React components avoid unnecessary re-renders from inline object/array/function literals passed as props to memoized children, especially in list-heavy views (video grid, search results, infinite-scroll lists using `react-virtuoso`)
- [ ] Expensive client-side computation is memoized with `useMemo`, not recomputed every render
- [ ] Infinite-scroll/virtualized lists (`react-virtuoso` usage) don't re-mount or reset scroll position on unrelated state changes — check that the item key/data reference is stable across re-renders that shouldn't affect the list

---

## 4. Maintainability & Style

### TypeScript (Warning)

- [ ] No `any` type — use `unknown` and narrow, or define a proper type/interface
- [ ] Types for domain entities (`Event`, `EventDetail`, `Tag`, `Playlist`, `Recommendation`, auth shapes) are imported from `src/models/` rather than redefined ad hoc inline
- [ ] Non-trivial `if`/ternary conditions (multiple `&&`/`||`, negations, chained optional access) are pulled out into a named `const` or helper function rather than left inline
- [ ] No `condition ? true : false` — this is an ESLint restricted-syntax error; simplify to the condition itself

### Component Architecture (Warning / Suggestion)

- [ ] Presentation and data-fetching are separated per the four-layer architecture — `src/app/` stays a thin route, `src/features/<Name>Page/` owns business logic and composes RTK Query hooks, `src/components/` holds only reusable UI primitives with no business logic or data-fetching
- [ ] State is kept minimal and local — lift to Redux only when genuinely shared across features, not for single-component state
- [ ] `react-hook-form` usage avoids the ESLint-restricted patterns: no `watch()` calls (use `useWatch`), no destructuring `formState` directly off `useForm()`'s return (use `useFormState`), no direct property access on a `control` object, no `useWatch`/`useFieldArray` declared in the same component that owns the `useForm()` call (move to a child component)
- [ ] Hooks are imported directly (`useEffect`, `useState`) rather than accessed via `React.useEffect`/`React.useState` — ESLint-restricted

### Code Quality (Suggestion)

- [ ] No dead code (commented-out blocks, unused imports, unused variables) — for a component/file suspected fully unused, verify with a repo-wide grep for its import path before deleting, not just a local read; do the same before removing a "consequently unused" npm dependency (grep `package.json` name across the repo, including inside now-dead files, before removing it)
- [ ] No unnecessary comments — flag and delete any comment that restates what the code already says, narrates a task/ticket/PR ("fix for ASP-274", "handles the Y flow"), or is a leftover `// removed` / commented-out line. Keep only comments that capture a non-obvious _why_
- [ ] Magic strings (event status values, feature flag keys, notification severities) are extracted to named constants (see `src/constants/constants.ts`, `src/constants/featureFlags.ts`) rather than repeated string literals
- [ ] Helper functions (formatters, param builders like `getEventsCacheKey`) are colocated with their consumer and reused instead of duplicated per file

### Project Conventions (Warning)

- [ ] Path alias `@/` used for all non-relative imports within `src/` — no deep relative `../../../` imports where the alias applies
- [ ] `import/order` satisfied: builtin → external → internal `@/` → parent/sibling, alphabetized within groups, blank line between groups (ESLint auto-fixable but flag if clearly hand-arranged wrong)
- [ ] `npm run lint` (ESLint + TypeScript) passes — Husky pre-commit hook enforces `lint` → `test:cov` → `build`
- [ ] No new dependency added without a clear reason; check `package.json` for an existing package that already covers the need before adding one
- [ ] `.env`/secret values are never committed; only `example.env.local`-style placeholders belong in the repo

---

## 5. Test Coverage

This project **has** a test suite (Jest + React Testing Library) with an enforced 80% branch/function/line coverage threshold (`npm run test:cov`) — unlike a test-free repo, missing or inadequate tests on changed logic are a legitimate finding here, not something to wave through.

- [ ] New/changed business logic (features, hooks, utils, Redux slices) has a colocated `*.test.ts`/`*.test.tsx` file exercising it
- [ ] `test()`/`it()` call names start with `"should"` (ESLint-enforced) — flag any that don't
- [ ] Tests assert behavior (rendered output, dispatched actions, returned values), not implementation details that would break on a harmless refactor
- [ ] A change to `src/middleware.ts`, `customBaseQuery`, or the RTK Query `merge`/`serializeQueryArgs` logic in `src/redux/events/apiSlice.ts` gets explicit test coverage given how easy these are to silently break (see `src/redux/events/events.test.tsx` for the existing pattern)
- [ ] Run `npm run test:cov` after fixes and confirm the global 80% branch/function/line thresholds still pass — a genuine regression here blocks merge (Critical), not just a Suggestion to "add tests later"
