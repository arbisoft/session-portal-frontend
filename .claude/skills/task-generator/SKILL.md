---
name: task-generator
description: "Generates implementation-ready tasks (title, description, acceptance criteria) from the current staged or unstaged code changes in the Session Portal frontend repo, categorized as Feature, UI/UX, Data/State, or Infra. Self-heals its own area-detection path table when the repo's folder layout has moved on."
argument-hint: "Ask to generate tasks from your current changes, or point at a specific diff/commit range/set of files to analyze."
user-invocable: true
---

# Session Portal Implementation Task Generator

## Purpose

Analyzes the current code changes (staged, unstaged, or a specified diff/range) in the **Session Portal frontend** repo — a Next.js 15 App Router app, no backend in this repository — and breaks them into one or more implementation-ready tasks — the kind you'd paste into Taiga or another tracker — each with a **Title**, **Description**, and **Acceptance Criteria**, categorized by the area of the codebase it touches (**Feature**, **UI/UX**, **Data/State**, **Infra**).

Every task must read as an unbuilt requirement, not a changelog entry: describe what needs to be implemented, not what was implemented. This is the inverse of the `commit-generator` skill (which summarizes changes that already happened) — reuse its diff-gathering approach but never its past-tense framing.

---

# Trigger

Activate this skill when the user says:

- generate tasks / generate implementation tasks
- create tasks from my changes / break down these changes into tasks
- turn this diff into tickets
- generate tasks for [PR/branch/commit]

---

# Step 1 — Gather the Changes

Same sourcing order as `commit-generator`:

```bash
git diff --staged
git diff --staged --name-only
```

If nothing is staged, fall back to:

```bash
git diff
git diff --name-only
```

If the user names a specific range/PR/commit instead, use that (`git diff dev...HEAD`, `git diff <sha>`, etc.) rather than staged/unstaged. If there's truly no diff to work from, say so and stop rather than inventing tasks.

Also get the branch name (`git rev-parse --abbrev-ref HEAD`) — this repo's tickets follow `ASP-NN` (e.g. `ASP-167`, or `feature/ASP-231-add-x`). A branch carrying that pattern means there's a real Taiga ticket for the overall work; generated tasks can reference it as related context, but never invent a ticket ID for an individual generated task.

---

# Step 2 — Group Changed Files into Distinct Pieces of Work

Don't produce one task per file, and don't produce one task for the whole diff. Cluster files by what they're _for_ — files belong in the same cluster only when they exist to implement the same user-facing capability or the same internal concern.

Signals for "same piece of work":

- A new/changed page or feature (`src/app/**/page.tsx` + its `src/features/<Name>Page/` component + the hook(s)/component(s) it exclusively renders + the RTK Query endpoint(s) it exclusively depends on) → one cluster.
- A component extraction/refactor (e.g. pulling shared markup into a new `src/components/` primitive) → its own cluster, separate from unrelated features touched in the same diff.
- Unrelated one-off fixes (a typo, a null-check, a style tweak in an unrelated component) → their own small clusters; don't fold them into a bigger task just to reduce count.

Each cluster becomes one task — this is what "identify all distinct pieces of work" means. A large diff can produce many tasks; a small, focused diff can produce just one.

Changes confined to `docs/`, `plans/`, `README.md`, `CLAUDE.md`, or `.claude/skills/**` don't get a task of their own — they don't fit Feature/UI-UX/Data-State/Infra, and documenting already-built behavior isn't an unbuilt requirement. Note them in your summary as excluded rather than silently dropping them or forcing them into a category. If a doc change is the _only_ staged change, say so and stop rather than generating a task from it.

---

# Step 3 — Categorize Each Cluster

This is a single Next.js frontend app — there is no backend repo, so there's no Frontend/Backend/Full-stack split. Categorize instead by what kind of unit of work it is within the app's four-layer architecture (`src/app/` thin routes → `src/features/` page-level logic → `src/components/` reusable UI primitives → `src/redux/` API slices/state).

| Cluster touches | Category |
| --- | --- |
| A new or changed route/page: `src/app/**/page.tsx` (or `layout.tsx`) + its `src/features/<Name>Page/` component + any hook/component that exists only to support it, with real behavior/logic (not purely visual) | **Feature** |
| Styling, spacing, layout, color, animation, or visual-hierarchy changes with no new data/logic/behavior — a `src/components/**` primitive, `src/app/**` markup, theme (`src/components/theme/`), or `ThemeToggle`/`Sidebar`/`Navbar` visual tweak | **UI/UX** |
| `src/redux/**` (RTK Query API slices, `store`, `login` slice, `customBaseQuery.ts`, `parseError.ts`), `src/models/**` (API shape types), `src/hooks/**` when the hook manages state/query orchestration (e.g. `useVideoQueryManager`), or `src/middleware.ts` auth/redirect logic | **Data/State** |
| `src/instrumentation.ts` / `src/instrumentation-client.ts` (Sentry/monitoring), `next.config.ts`, `Dockerfile`/`.dockerignore`, CI workflows, `src/constants/featureFlags.ts` flag plumbing, env/config wiring, `src/utils/chunkLoadRecovery.ts`-style resiliency utilities | **Infra** |

Notes:

- A cluster spanning both a route/feature file **and** a new/changed RTK Query endpoint it exclusively depends on is still one **Feature** task — don't artificially split a single page's UI from the data hook it was built with unless each half is substantial enough to be reviewed as its own unit (e.g. a large new API slice with several endpoints backing multiple future pages deserves its own **Data/State** task, separate from the one page currently consuming it).
- A pure component-extraction refactor (moving existing JSX to a new file in `src/components/`, no behavior change) with an incidental style tweak riding along (e.g. dropping a shadow class) is still fundamentally structural — categorize by what the component *does*: if it's a reusable primitive extraction with no new business logic, treat it as **UI/UX** only when the change's entire point is visual; otherwise it's a **Feature** task ("extract X into a reusable component").
- `src/app/error.tsx`, `global-error.tsx`, `not-found.tsx` changes with real recovery/retry logic (see `chunkLoadRecovery.ts`) are **Infra**, not UI/UX — the point is resiliency behavior, not visuals.
- Test-only diffs (`*.test.ts`/`*.test.tsx` with no corresponding source change) don't get their own task — coverage isn't an unbuilt requirement; fold them into whichever cluster they cover.

**Self-heal check:** if a cluster touches a path this table doesn't cover (a new top-level `src/` directory, a renamed layer), don't guess — add a row and fix any stale ones in the same pass, same as `commit-generator`'s scope table.

---

# Step 4 — Write Each Task as an Unbuilt Requirement

This is the step most likely to go wrong: it's tempting to summarize the diff. Don't. Reframe every sentence from "what the code now does" to "what must be built."

Banned in Title/Description: "added", "fixed", "changed", "updated", "now supports", "refactored to". Required instead: "Implement", "Add", "Build", "Create", "Ensure", "Support", "Extract".

| Diff shows | ❌ Changelog framing | ✅ Requirement framing |
| --- | --- | --- |
| New `useVideoQueryManager` resetting `page` to 1 on filter change | "Added page reset on filter change" | "Ensure changing any video filter resets pagination to page 1 so the results list refetches from the start instead of appending to stale results" |
| Dropped a shadow class from `Navbar` | "Removed shadow from navbar" | "Update the top nav bar's visual treatment to remove the drop shadow beneath it" |
| New `chunkLoadRecovery.ts` + wiring into `error.tsx` | "Added chunk load error recovery" | "Detect stale-chunk load failures after a deploy and automatically recover by reloading the page instead of showing the user a broken error screen" |

**Description**: 2–4 sentences. State the capability/behavior needed and any constraint the diff reveals (validation rules, auth/role gating, data source, retention/date bounds, empty/loading states) — pull these from what the code actually does, don't invent new ones.

**Acceptance Criteria**: 3–6 concrete, testable bullets derived from the diff's actual logic — status codes and error messages for bad input, auth gating, empty-state and loading-state behavior, sort order, edge cases the code explicitly handles. Phrase as observable behavior a reviewer or QA could verify without reading the code; avoid restating implementation details (function/file names).

---

# Step 5 — Output Format

One block per task, clearly delimited so it can be pasted into a tracker (each task is copy-paste-able on its own):

```
### Task N: <Title>
**Category:** Feature | UI/UX | Data/State | Infra

**Description**
<2-4 sentences>

**Acceptance Criteria**
- [ ] ...
- [ ] ...
- [ ] ...

---
```

Precede the list with a one-line count summary, e.g. `Generated 3 tasks: 1 Feature, 1 Data/State, 1 UI/UX.`

---

# Example

### Input (subset of a real diff)

- New `src/utils/chunkLoadRecovery.ts` (detects `ChunkLoadError`, stores a retry flag in `sessionStorage`, forces a full reload once) + wiring into `src/app/error.tsx` and `src/instrumentation-client.ts`
- `src/app/login/actions.ts` changed to bound and sanitize the post-login `redirect_to` value before use
- `Navbar.tsx` dropped its bottom shadow class

### Output

```
Generated 3 tasks: 1 Infra, 1 Data/State, 1 UI/UX.

### Task 1: Recover automatically from stale-chunk load failures after a deploy
**Category:** Infra

**Description**
After a new deploy, a user with an already-open tab can hit a JS chunk that no
longer exists on the server, surfacing as an unhandled error boundary instead
of working software. Detect this specific failure mode (a chunk load error) at
the point it's caught, and recover by forcing a single full page reload rather
than showing the user a broken screen. The recovery must not loop: if the
reload has already been attempted once for this failure, fall through to the
normal error UI instead of reloading again.

**Acceptance Criteria**
- [ ] A chunk load failure triggers exactly one automatic full-page reload
- [ ] A second chunk load failure after the reload does not trigger another reload (no infinite reload loop)
- [ ] Non-chunk-load errors are unaffected and still fall through to the existing error UI
- [ ] The retry state does not persist across unrelated navigation once recovery has succeeded

---

### Task 2: Validate and sanitize the post-login redirect target
**Category:** Data/State

**Description**
The login server action currently trusts the `redirect_to` value it receives
when deciding where to send a user after authenticating. Ensure this value is
validated as an internal, same-origin path before it is used as a redirect
target, so a crafted `redirect_to` cannot send an authenticated user off-site.

**Acceptance Criteria**
- [ ] A `redirect_to` pointing to an external origin is rejected and the user is redirected to the default authenticated route instead
- [ ] A `redirect_to` pointing to a valid internal path is honored
- [ ] A missing or malformed `redirect_to` falls back to the default authenticated route without error

---

### Task 3: Remove the drop shadow beneath the top navigation bar
**Category:** UI/UX

**Description**
Update the top navigation bar's visual treatment to remove the drop shadow
currently rendered beneath it, aligning its appearance with the flatter visual
style used elsewhere in the app.

**Acceptance Criteria**
- [ ] No shadow renders beneath the navigation bar in either light or dark theme
- [ ] No other navigation bar styling (spacing, borders, background) changes as a result
```

---

# Best Practices

The skill must:

- Prioritize **clarity** and **testability** in acceptance criteria over exhaustiveness
- Never describe work in past tense — every task reads as something still to be built
- Never invent scope not evidenced in the diff (no acceptance criteria for behavior the code doesn't show)
- Never invent Taiga ticket IDs (this repo's format is `ASP-NN`)
- Ignore whitespace-only changes, lock file changes (`package-lock.json`), and test-only diffs as their own tasks — fold them into the task for the source change they cover
- Keep each task scoped so it could realistically be assigned to one person and reviewed as one PR

---

# Self-Healing This Skill

This SKILL.md cites specific paths and conventions (`src/app/`, `src/features/`, `src/components/`, `src/redux/`, `src/hooks/`, `src/models/`, `src/middleware.ts`, the `ASP-NN` ticket prefix, the categorization table in Step 3). Don't treat it as permanently accurate:

- If a run surfaces a cited path that no longer exists, a layer that's been restructured, or a categorization row that no longer fits how the codebase is organized, that's a stale skill, not a one-off exception.
- Patch this SKILL.md in the same pass — add or fix the relevant row/example — rather than leaving the correction for a future run to rediscover.
- Only fix what you actually observed drifting during this run; don't speculatively rewrite sections you didn't touch.
