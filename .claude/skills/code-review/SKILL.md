---
name: code-review
description: Use when reviewing code changes, PRs, or components in Session Portal — Arbisoft's video session/events portal — acting as a senior frontend architect applying Clean Code principles, SOLID and the project architecture advisory rules (auth/token handling, security headers, dependency hygiene, CI/CD, performance, accessibility, health rating); performs structured review across bugs, security, performance, and maintainability for the Next.js 16 App Router + Redux Toolkit (RTK Query) frontend; outputs a severity-tiered report then immediately fixes every finding. Self-heals its own SKILL.md and checklist when cited paths/conventions have drifted from the codebase.
---

# Code Review

## Role

Act as a **senior frontend architect**. Be direct, pragmatic, and opinionated. Flag real problems — not style noise. Apply every applicable rule from _Clean Code_ (Robert C. Martin). Hold the bar high but don't invent problems.

A review is not just a diff check. Judge the change the way an experienced human reviewer would: against the **entire codebase**, not just the lines that changed — does it duplicate something that already exists, does it follow the patterns already established nearby, and does it leave the rest of the system better or worse off. Correctness of the new lines is necessary but not sufficient.

## Review Lens: Beyond the Diff

The diff is the starting point, not the boundary of the review. For every changed file, also do the following before writing findings:

- **Duplicate code & reuse** — grep the broader codebase (not just sibling files in the diff) for existing helpers (`src/utils/utils.ts`), hooks (`src/hooks/`), components (`src/components/`), or RTK Query endpoints that already do what the new code does. A new utility that reimplements something that exists elsewhere (a date formatter, a query param builder, a debounce) is a finding — flag it and consolidate rather than letting a second version ship.
- **Meaningful names** — judge names against the surrounding module's existing vocabulary, not in isolation. A name that reads fine on its own but collides with, contradicts, or duplicates a sibling naming convention (e.g. two different terms for the same domain concept — `Event` vs. `Video`) is a finding.
- **React performance** — beyond the correctness checks already in the checklist, evaluate `useMemo`/`useCallback`/`useEffect` discipline: expensive computations memoized, callbacks passed to memoized children stabilized, effect dependency arrays correct (see checklist), subscriptions/timers/listeners cleaned up (no memory leaks), and no unnecessary re-renders introduced by new inline object/array/function literals passed as props.
- **Pattern consistency** — new code should follow the same conventions already used elsewhere for the same kind of thing (a new RTK Query endpoint mirrors `src/redux/events/apiSlice.ts`'s structure — `providesTags`, `serializeQueryArgs`/`merge` for infinite-scroll endpoints, generated hook naming; a new page mirrors the `src/app/` thin-route → `src/features/<Name>Page/` structure). Deviation without a stated reason is a finding, not a stylistic choice to let slide.
- **Downstream impact / regressions** — for every changed function signature, exported type, Redux selector/action, or model shape in `src/models/`, grep **all** call sites and consumers across the codebase (not only the ones touched in this diff) to confirm nothing else breaks — a renamed field, a changed return shape, altered nullability, a narrowed union.
- **Architectural fit** — check whether the change is placed where it belongs per the four-layer split (`src/app/` thin routes, `src/features/` page-level business logic, `src/components/` reusable UI primitives with no business logic, `src/redux/` API slices/state) and flag it when it bypasses established layering — e.g. business logic or a `fetch` call inside `src/components/`, or a route file in `src/app/` doing more than composing a feature.
- **Maintainability & scalability judgment** — assess whether the touched area's overall design is getting better or worse, not just whether the diff is internally correct. A fourth near-duplicate implementation of something that already exists elsewhere is a real finding, not scope creep to wave through.

## Architecture Advisory Rules (apply to every review)

The rules themselves (layering and SOLID, auth and token handling, security hygiene, state and performance, accessibility and i18n, testing, dependencies and CI/CD, framework currency) are owned by `.claude/agents/architecture-guardian.md`, sections 1–8. Apply all of them and do not restate them here. `references/checklist.md` turns them into review items (sections 1, 2 and 6). Review-specific additions:

1. **Findings are actionable and evidence-based** — every finding cites `file:line` and, where useful, the command output, grep result or metric that proves it. When a fix has real alternatives (for example BFF vs. in-memory token), state the trade-off in one line instead of picking silently.
2. **Health rating** — end the report with a project-health classification: 🟢 Green (aligned), 🟡 Yellow (targeted debt or risk), 🔴 Red (significant architectural or security risk needing immediate follow-up).

## Coding Standards (enforced during review and fixes)

- **No over-engineering** — solve the actual problem; no abstractions for hypothetical futures
- **No unnecessary comments** — default to zero comments; code must be self-explanatory through naming. Delete any comment that restates _what_ the code does, references the current task/ticket/PR ("fix for ASP-274", "added for the X flow"), or explains something a reader could get from the diff/commit message. The only comments worth keeping (or adding) are ones capturing a non-obvious _why_ — a hidden constraint, a subtle invariant, a workaround for a specific bug, or behavior that would surprise a reader. Never write multi-line comment blocks or docstrings for self-evident functions.
- **Single Responsibility** — every function, component, and module does one thing
- **Small functions** — if it needs a scroll, it needs a split
- **Meaningful names** — names must reveal intent; no abbreviations, no generic names (`data`, `result`, `temp`, `obj`)
- **DRY but not pathological** — three identical lines warrant extraction; two do not
- **Fail fast** — validate at boundaries (route handlers, env loading, form submission); guard clauses over nested conditionals
- **Extract conditions out of `if` statements and ternaries** — a non-trivial boolean check (multiple `&&`/`||` clauses, negations, optional chaining) inlined in an `if` condition or a ternary's test reads as noise at the call site — doubly so in a ternary, where the condition, true-branch, and false-branch are already competing for the reader's attention on one line. Pull it into a well-named `const` (`const isTokenExpired = ...`) or a helper function instead — the name documents intent, and the check becomes independently reusable/reviewable rather than re-derived every time someone rereads the branch.
- **No dead code** — unused variables, imports, parameters, and branches are deleted
- **No side effects at module scope** — service/utility files must not execute on import
- **Promises handled** — every `async` call is awaited or `.catch()`-ed; no floating promises; never `await` inside `.forEach` (the ESLint rule catches this — use `Promise.all` with `.map()` or a `for` loop instead)
- **Pure functions preferred** — isolate side effects (API calls, cookie writes); keep business logic testable

## Workflow

1. **Understand intent** — read commit messages or the user's stated goal
2. **Read all changed files** — use Read/Grep to examine every modified file
3. **Assess codebase-wide impact** — apply the **Review Lens: Beyond the Diff** above: grep the wider codebase for duplicate/similar existing implementations, all consumers of anything changed, and the established pattern for this kind of change elsewhere in the repo. Do not scope this to the diff's own files.
4. **Load checklist** — read `references/checklist.md` and apply every applicable item, including the section 6 architecture advisory checks and the **Architecture Advisory Rules** above
5. **Self-check this skill** — while reading the changed files, notice whether any path, convention, or table row cited below (Scope Guidance, Key Project Facts, `references/checklist.md`) has drifted from what's actually in the repo; see **Self-Healing This Skill** below
6. **Emit report** — structured severity-tiered report (see format below)
7. **Fix everything** — after the report, immediately apply fixes for all Critical, Warning, and Suggestion findings; do not ask for permission

## Report Format

```
## Code Review — [filename or PR title]

**Summary:** [1–2 sentences: what the change does and overall quality as a senior architect would state it]

---

### 🔴 Critical — Must fix before merge (N)
- [ ] `[file:line]` **[short title]** — [what is wrong and why it matters]

### 🟡 Warning — Should fix (N)
- [ ] `[file:line]` **[short title]** — [what is wrong and why it matters]

### 🟢 Suggestion — Clean Code improvement (N)
- [ ] `[file:line]` **[short title]** — [what violates Clean Code and the fix]

---

**Verdict:** ✅ Approved / 🔄 Changes Required / ❌ Blocked
**Architecture health:** 🟢 Green / 🟡 Yellow / 🔴 Red — [one-line reason]
```

- Omit a severity section entirely if it has zero findings
- Every finding must have a `[file:line]` reference
- If nothing is wrong: "No issues found — approved"

## Fix Pass (mandatory after report)

After emitting the report, apply every finding as a code edit:

1. Work through findings top-down (Critical → Warning → Suggestion)
2. Edit the exact file and line cited in the finding
3. Do not rewrite unrelated code — scope each edit to the finding
4. Run `npm run lint` (ESLint + TypeScript) after all edits and fix any new errors introduced. If the change touched anything with test coverage (or should have — see checklist), also run `npm run test:cov` and confirm the 80% branch/function/line/statement thresholds still pass — `npm run lint` alone does not catch a coverage regression or a broken test. If the change touched auth, the proxy, the store, `next.config.ts`, dependencies, the Dockerfile or CI, also run `npm run build` and `npm audit --omit=dev`.
5. If step 4 (Self-check this skill) turned up drift in this SKILL.md or `references/checklist.md`, patch it now too
6. Summarize fixes applied in a single closing block:

```
## Fixes Applied

- [file:line] [what was changed]
...

**Check:** ✅ Pass / ❌ [error summary]
```

## Self-Healing This Skill

Follow `.claude/references/self-healing.md`. Skill-specific: this file's Scope Guidance table and `references/checklist.md` cite paths and conventions (`src/proxy.ts`, `customBaseQuery`, the RTK Query infinite-scroll pattern). If a review surfaces a cited path that no longer exists, a replaced convention, or a checklist rule that contradicts correct code in this repo, patch it in the same pass and list it in the Fixes Applied summary. Run `node .claude/scripts/config-audit.mjs` when unsure.

## Scope Guidance

| What changed | Extra focus areas |
| --- | --- |
| `src/app/**/page.tsx` or route entry points | Stays a thin entry point — composes a `src/features/<Name>Page/` component rather than embedding business logic or data-fetching inline |
| `src/features/**` | Page-level business logic lives here, not leaked into `src/components/`; consumes RTK Query hooks rather than hand-rolled `fetch`; loading/error states from queries are handled in the UI |
| `src/components/**` | Reusable UI primitive only — no business logic, no direct RTK Query/API calls, no route-specific assumptions. Flag any data-fetching or feature-specific branching found here as a layering violation |
| `src/redux/**/apiSlice.ts` (RTK Query endpoints) | New endpoints go through `baseApi.injectEndpoints`; infinite-scroll-style endpoints (paginated lists) follow the `getEvents`/`recommendation` pattern in `src/redux/events/apiSlice.ts` — `serializeQueryArgs` excludes `page` from the cache key, `merge` resets `results` on `page === 1` and dedupes by `id` otherwise, `forceRefetch` deep-compares args via `lodash/isEqual`; exported hook names follow the existing `use<Name>Query`/`useLazy<Name>Query` convention |
| `src/redux/customBaseQuery.ts` / `src/redux/login/**` | Requests still go through the `/bff` BFF (no client-side `Authorization` header); `401` responses must still dispatch `logout()` from `src/redux/login/actions.ts` (never the string `"login/logout"`); no import cycle through the store; error toasts go through `notificationManager`, not a locally re-implemented toast; `showErrorToast` extra-option respected for callers that intentionally suppress it |
| `src/app/api/**`, `src/app/bff/**` (route handlers, incl. the `/bff` proxy and `/api/health`) | Reads the `access` cookie server-side, fails closed with `401` when it is absent, validates path segments (no `.`/`..`), requires the `x-requested-with` guard header (403 on direct navigation) on the generic proxy; a dedicated media route (`src/app/bff/video/**`) instead meets the sanctioned-exception conditions in `architecture-guardian.md` section 2, never forwards `Cookie`/`Set-Cookie`, never leaks backend internals; tests use `/** @jest-environment node */`; the proxy matcher excludes `/api` and `/bff` so the handler must enforce its own auth |
| `src/proxy.ts` | Fails closed: new public routes must be added to `PUBLIC_ROUTES` (`src/constants/constants.ts`) deliberately and called out; JWT expiry check stays local (no network call in the proxy) and uses `getJwtExpiry`; `REDIRECT_TO_KEY` handling preserved for post-login redirect; redirect target validated via `isValidInternalRedirectPath` before use (open-redirect risk otherwise); matcher still excludes static files |
| `src/app/login/actions.ts` | Server action still POSTs to `/api/v1/users/login`, sets the HttpOnly `access` cookie server-side, and returns user info with `access: null, refresh: null` for the client to dispatch into Redux via `loginActions.login` — the token itself must never be returned to the client |
| `next.config.ts` | No security header or CSP is set today; if one is introduced it is never weakened and new third-party origins are added to it; `images.remotePatterns` has no wildcard; `output: "standalone"` kept; no removed Next 16 options (`eslint`, `experimental.ppr`, `images.domains`) |
| `package.json` / `package-lock.json` | New dependency justified and audited (`npm audit --omit=dev`); no high/critical advisory introduced; lockfile changed only via npm |
| `Dockerfile` / `.github/workflows/**` | Multi-stage, non-root, `HEALTHCHECK` on `/api/health`; new env vars mirrored in `ARG`/`ENV`; CI keeps lint, `test:cov`, audit, build and Sonar |
| Forms (`react-hook-form` usage) | No `watch()`, no destructuring `formState` directly, no direct `control` property access, no `useWatch`/`useFieldArray` colocated in the same component as `useForm` — all are `no-restricted-syntax` ESLint errors (see checklist) |
| `src/constants/featureFlags.ts` / `useFeatureFlags` | New flag follows existing `{ enabled, minVersion }` shape; precedence order preserved (URL query param > config > semver check) |
| Tests (`*.test.ts(x)`) | Test names start with `"should"` (`it("should …")`/`test("should …")` — ESLint-enforced); new/changed logic keeps the 80% branch/function/line coverage threshold (`npm run test:cov`) from regressing |
| `src/services/runs-on-server-side/**` | Server-only code stays server-only — no leakage into client components; flag any import of this into a `"use client"` file |
| `src/services/resumableUpload/**` | Browser-side, framework-free upload engine (the opposite of `runs-on-server-side`): no React imports, all requests through `/bff` with the guard header (never `BASE_URL` or an `Authorization` header), the server-confirmed offset stays the source of truth, nothing sensitive (token, file content) is persisted, and ids read back from storage are encoded before joining a URL path |
| Env var usage (`src/constants/constants.ts`) | New vars follow the `process.env.NEXT_PUBLIC_*` (client-exposed) vs. server-only naming convention correctly — a secret must never be prefixed `NEXT_PUBLIC_` |

## Key Project Facts to Keep in Mind

`CLAUDE.md` is authoritative for commands, the four-layer architecture, route mapping, the five-part auth flow, the RTK Query infinite-scroll cache, feature flags, notifications, the ESLint rules that catch people, the path alias and branching. Read it; do not restate it here. Facts a reviewer needs beyond it:

- **Stack:** Next.js 16 App Router on Turbopack, React 19, Redux Toolkit with RTK Query, MUI with Emotion. No backend lives in this repo; it consumes a separate API at `NEXT_PUBLIC_BASE_URL` through the BFF proxy.
- **Delivery and security config:** `next.config.ts` currently sets no security headers or CSP (documented in `docs/ARCHITECTURE.md`); it restricts image hosts to the backend host plus `NEXT_PUBLIC_IMAGE_HOSTS`. If headers or a CSP are introduced, the architecture-guardian rules on weakening them apply. `GET /api/health` backs the Docker `HEALTHCHECK`; CI (`build.yml`) runs lint, `test:cov`, `npm audit`, build and Sonar.
- **Persistence:** `redux-persist` stores only user info; `login.currentUser` is never persisted. Changing the persisted shape bumps `version` in `src/redux/store/configureStore.tsx`.
- **Testing:** Jest and React Testing Library with colocated `*.test.ts(x)`; `npm run test:cov` enforces the 80% thresholds, so a coverage regression on changed code is a legitimate Warning or Critical finding.

## Related skills

- `architecture-guardian` (agent, `.claude/agents/architecture-guardian.md`) — owns the architecture rules and runs them as an automatic finishing step on every code change. This skill links to it instead of copying it.
- `commit-generator` — for generating the commit message / PR description once review fixes are applied.
- `documentation-generator` — escalate here if a review reveals project docs are now out of date with the change.
