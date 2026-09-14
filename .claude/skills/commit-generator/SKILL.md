---
name: commit-generator
description: "Analyzes git staged changes in the Session Portal frontend repo, splits unrelated changes into separate logical commits with semantic messages, actually creates those commits, and generates a structured Pull Request title + description covering all of them. Self-heals its own scope/path tables when the repo's folder layout has moved on."
argument-hint: "Provide a brief description of the changes you made, or simply ask to generate a commit message and PR description based on your staged changes."
user-invocable: true
---

# Session Portal Commit and PR Generator

## Purpose

This skill analyzes git staged changes in the **Session Portal frontend** repo — a Next.js 15 App Router app, no backend in this repository — splits them into separate logical commits when they cover unrelated work, creates those commits, and generates:

1. High-quality **semantic commit messages** (one per logical group, actually committed)
2. A single **PR title**
3. A **fully formatted Pull Request description** covering all commits, matching this repo's actual `.github/PULL_REQUEST_TEMPLATE.md`
4. Intelligent **change summaries**
5. **Reviewer guidance**

The generated output follows **Conventional Commits** (enforced by `commitlint` via the commit-msg hook, extending `@commitlint/config-conventional`). Tickets live in Taiga and show up as `ASP-NN` branch names (see Step 1); only cite a ticket ID the branch actually carries.

**This skill creates real commits.** Splitting staged changes into separate commits means unstaging and re-staging hunks/files (`git reset`, then targeted `git add`), then running `git commit` multiple times. Follow the Git Safety Protocol: never use `git add -A`/`git add .` (stage named paths or hunks explicitly), never force anything, and confirm the plan with the user before committing if the split is ambiguous (see Step 5.5). Since this changes repo history, walk through Steps 1–5.5 and show the user the proposed commit groups before running any `git commit`.

**Pre-commit hook runs `lint` → `test:cov` → `build` on every commit** (1–2 minutes each). Warn the user this will run for every commit in a multi-commit split, not just once.

---

# Trigger

Activate this skill when the user says:

- generate commit
- generate commit message
- write commit message
- summarize my changes
- generate PR
- create PR description
- prepare pull request
- summarize git diff
- split my changes into commits
- create logical commits

---

# Step 1 — Get Branch Name

Retrieve the current branch:

```bash
git rev-parse --abbrev-ref HEAD
```

This repo's tickets follow `ASP-NN`, either as the bare branch name or embedded in a descriptive branch:

```
ASP-294
ASP-167
ASP-275
feature/ASP-231-add-x
fix/dockerignore-next-config
chore/update-dependencies
```

A branch carrying `ASP-NN` means the work has a real Taiga ticket — fill the PR's "Related Issues" section with `https://projects.arbisoft.com/project/arbisoft-sessions-portal-20/us/NN`. On a branch with no `ASP-NN` pattern there is no ticket; leave that section empty or drop it rather than inventing an ID. Either way, the ticket ID never goes in the commit subject — commit history here is plain Conventional Commits.

---

# Step 2 — Retrieve Git Changes

Get staged changes:

```bash
git diff --staged
```

If no staged files exist, tell the user nothing is staged and ask whether to stage everything or specific paths — don't silently fall back to the unstaged diff, since this skill ends by running `git commit` and committing unstaged work without confirmation would surprise the user. (This initial stage-everything step is distinct from Step 5.5's re-staging, where `git add -A`/`git add .` is disallowed because it could pull unrelated files into the wrong group.)

Also retrieve changed file list and per-file stats:

```bash
git diff --name-only --staged
git diff --staged --stat
```

---

# Step 3 — Detect Change Scope

Infer scope from modified file paths, using this repo's actual layer structure.

| Path | Scope |
| --- | --- |
| `src/app/login/` | login |
| `src/app/videos/[videoId]/` | video |
| `src/app/videos/results/` | search |
| `src/app/videos/` (other files) | videos |
| `src/app/upload-video/` | upload |
| `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx` | app |
| `src/app/` (other, layout/page shells) | app |
| `src/middleware.ts` | auth |
| `src/features/LoginPage/` | login |
| `src/features/VideoDetail/` | video |
| `src/features/SearchResultsPage/` | search |
| `src/features/VideosListingPage/` | videos |
| `src/features/UploadVideo/` | upload |
| `src/features/HomePage/` | home |
| `src/components/**` | ui |
| `src/components/containers/MainLayoutContainer/` | layout |
| `src/components/Notification/` | notification |
| `src/hooks/**` | hooks |
| `src/redux/events/` | events |
| `src/redux/login/` | login |
| `src/redux/store/`, `src/redux/customBaseQuery.ts`, `src/redux/parseError.ts` | redux |
| `src/models/**` | models |
| `src/utils/**` | utils |
| `src/constants/featureFlags.ts` | flags |
| `src/instrumentation.ts`, `src/instrumentation-client.ts` | monitoring |
| `src/services/**` | services |
| `src/endpoints/**` | api |
| `.storybook/`, `**/*.stories.tsx` | storybook |
| `e2e/`, `playwright.config.ts` | e2e |
| `Dockerfile*`, `.dockerignore` | docker |
| `.github/workflows/` | ci |
| `sonar-project.properties` | ci |
| `next.config.ts`, `tsconfig.json`, `jest.config.*` | build |
| `eslint.config.mjs`, `.prettierrc*`, `commitlint.config.*` | lint |
| `package.json`, `package-lock.json` | deps |
| `.claude/skills/`, `CLAUDE.md` | claude |

If changes span multiple unrelated scopes, omit the scope or use the most dominant one — don't invent a combined scope.

**Self-heal check:** if the staged diff touches a path not covered by this table (a new top-level `src/` directory, a renamed feature folder, a route the table doesn't list), don't just fall back to guessing a scope for this run — add the missing row to the table above in the same pass, and remove/rename any row for a path that no longer exists. This table is the skill's only map of the repo — a stale map produces a wrong scope on every future commit until someone fixes it by hand.

Example commit scopes actually seen in this repo's history:

```
fix(filters): add aria heading roles to sort and filter section labels
feat(app): add error boundary and not-found pages
feat(monitoring): integrate Sentry for error tracking and session replay
fix(login): move try/catch inside startTransition and use notificationManager
fix(docker): include next.config.ts in build context
```

---

# Step 4 — Classify Change Type

Determine commit type based on diff patterns.

| Type     | Condition                                          |
| -------- | -------------------------------------------------- |
| feat     | new functionality                                  |
| fix      | bug fix                                            |
| refactor | internal restructuring                             |
| perf     | performance improvements                           |
| style    | formatting only                                    |
| test     | new or updated tests with no accompanying source change |
| docs     | documentation (`CLAUDE.md`, `README.md`, `.claude/skills/**`) |
| chore    | dependencies/config/cleanup                        |
| build    | build system changes (Next.js config, tsconfig, Dockerfiles) |
| ci       | `.github/workflows/` changes                       |

This repo **has** a real Jest test suite with enforced 80% branch/function/line coverage thresholds (`npm run test:cov`) — use `test` freely when a commit's diff is test-only, and do suggest adding/adjusting test coverage in PR checklists when relevant. ESLint (`import/order`, `no-restricted-syntax` for RHF/`React.use*` patterns, `test()` names must start with "should"), Prettier, TypeScript, and a Husky pre-commit hook (`lint` → `test:cov` → `build`) are all enforced — don't claim otherwise.

---

# Step 5 — Analyze Code Changes

Analyze the diff and detect:

### Structural Changes

- new components, routes, or pages
- new functions, hooks, or modules
- deleted code
- moved/renamed files

### Behavior Changes

- validation updates
- RTK Query API slice changes (`src/redux/events/`, `src/redux/login/`) — flag if the infinite-scroll accumulation strategy (`serializeQueryArgs`/`merge`/`forceRefetch`, see `CLAUDE.md`) was touched without updating both `getEvents` and `recommendation` consistently
- feature flag changes (`src/constants/featureFlags.ts`) — flag if a flag's `enabled` default changed without a corresponding note in the PR
- UI changes
- auth/session changes (`src/middleware.ts`, `src/app/login/actions.ts`, `src/redux/customBaseQuery.ts`)
- bug fixes

### Code Improvements

Detect:

- performance optimizations
- accessibility improvements
- error handling
- edge case handling
- test coverage additions/changes

---

# Step 5.5 — Group Into Logical Commits and Commit Them

Decide whether the staged changes represent **one** logical change or **several unrelated** ones.

**Group by intent, not by file or scope.** Two files in the same feature folder can belong to different commits (e.g. an unrelated lint fixup alongside a new component); conversely one logical change often spans multiple scopes (a new feature component + its route entry in `src/app/` + its RTK Query endpoint + its test file belong in the **same** commit). Typical split signals in this repo:

- A new feature/page/component next to an unrelated bug fix in a different feature.
- A source change and its accompanying test file (one commit) alongside an unrelated UI tweak (a separate commit).
- Dependency/config bumps (`package.json`, `package-lock.json`) unrelated to the feature work in the same diff.
- `CLAUDE.md`/`.claude/skills/**` updates that don't describe the code in the rest of the diff (separate commit); docs that describe the accompanying feature stay in that feature's commit.

For each candidate group, list the files/hunks it covers and a one-line description. **If the split is ambiguous** (e.g. it's unclear whether two changes are related, or a single file contains hunks belonging to different groups), show the proposed grouping to the user and confirm before committing — don't silently guess when it could scramble their history.

If everything staged is genuinely one logical change, skip splitting — proceed to Step 6 and commit once.

To execute an approved split:

1. Unstage everything first: `git reset` (safe — this only unstages, it doesn't discard any working-tree changes).
2. For each group, stage only its files (`git add <path> <path>...`) or, when a single file spans multiple groups, its specific hunks (`git add -p <path>`, selecting only the relevant hunks).
3. Run Steps 6–7 for that group to produce its commit message, then commit it (`git commit -m "..."`, or `-m` heredoc for a multi-line body per the Git Safety Protocol). Remind the user each commit re-triggers the full `lint` → `test:cov` → `build` pre-commit hook.
4. Repeat for the next group until every originally-staged change has been committed.
5. After the last commit, run `git status` to confirm the working tree is clean (or contains only files that were never staged, e.g. genuinely unrelated in-progress work the user didn't ask to include).

Never use `git add -A`/`git add .` when re-staging a group — always name the specific paths (or hunks) that belong to it, so an unrelated file never rides along into the wrong commit.

---

# Step 6 — Generate Commit Message

Generate one commit message per logical group identified in Step 5.5 (or a single message if there was no split).

Format:

```
type(scope): short description
```

No ticket prefix in the subject line — even on an `ASP-NN` branch, the ticket ID belongs in the PR's "Related Issues" link, not the commit message.

Examples:

```
fix(video): prevent Picture-in-Picture desync when navigating between pages

feat(videos): support recurring filter reset on page change

refactor(hooks): simplify useVideoQueryManager pagination handling
```

Rules:

- Imperative tone
- < 72 characters for the subject line
- Specific but concise
- Avoid generic words like "update stuff"

---

# Step 7 — Generate Commit Body (Optional)

Include details when a single group contains multiple related changes.

Example:

```
fix(login): move try/catch inside startTransition and use notificationManager

- Wrap the Google login flow's error handling inside startTransition
- Surface login failures via notificationManager instead of an unguarded throw
- Add regression test for the failed-login toast path
```

Commit each group (Step 5.5) with its own message + optional body before moving to the next group.

---

# Step 8 — Generate PR Title and Pull Request Description

Once all commits are created, produce **one PR title** and **one PR description** that together cover every commit made in Step 5.5–7 — the PR aggregates the whole branch's work, not just the last commit. All PRs target `dev`, never `main`.

### PR Title

A single Conventional-Commits-style line summarizing the overall change (not a list of every commit subject). If the commits share one dominant theme, title it after that theme; if they're genuinely disparate (e.g. a feature plus an unrelated fix), pick the most significant piece and mention the rest in the description.

```
feat(videos): add infinite-scroll filter reset handling
```

### PR Description

Use the project's actual template at `.github/PULL_REQUEST_TEMPLATE.md`. Get the full set of commits on this branch (e.g. `git log dev..HEAD --oneline`) so "Changes Implemented" reflects all of them, not just the diff of one.

```
### **🚀 Description**

_Provide a concise description of the changes introduced in this PR._

#### **📌 Summary**

_Explain what this PR accomplishes in a few sentences._

#### **🔧 Changes Implemented**

- ✅ _Describe key changes made in this PR._
- ✅ _List major improvements or fixes._
- ✅ _Mention any refactors or optimizations._

#### **🛠️ How It Works?**

1. _Explain the workflow of the implemented changes._
2. _Provide details on how it behaves in different scenarios._
3. _Mention any edge cases handled._

#### **✅ Checklist Before Merging**

- [ ] _Tested all relevant functionalities._
- [ ] _Verified expected behavior on different use cases._
- [ ] _Ensured code follows best practices and security standards._

#### **📸 Screenshots (if applicable)**

_(Add screenshots, videos, or GIFs if necessary.)_

#### **🔗 Related Issues**

_Link to the associated Taiga ticket_ https://projects.arbisoft.com/project/arbisoft-sessions-portal-20/us/NN

#### **📢 Notes for Reviewers**

_(Mention anything important for reviewers to check or be aware of.)_
```

Fill in each section with real content instead of the italicized placeholders — replace the "Related Issues" line's `NN` with the actual ticket number from Step 1, or drop the section if the branch carries no `ASP-NN` ticket. When the branch's commits span multiple unrelated concerns, list each as its own bullet (or its own sub-heading) under "Changes Implemented" rather than blending them into one narrative, so a reviewer can tell which commit addresses which concern.

---

# Step 9 — Generate Reviewer Notes

If detected:

### RTK Query infinite-scroll changes (`src/redux/events/`, `getEvents`/`recommendation`)

Remind the reviewer to confirm `serializeQueryArgs` still excludes `page`, `merge` still resets on `page === 1` and dedupes by `id` otherwise, and `forceRefetch` still deep-compares args — per the accumulation strategy documented in `CLAUDE.md`.

### Auth changes (`src/middleware.ts`, `src/app/login/actions.ts`, `src/redux/customBaseQuery.ts`)

Mention cookie/JWT expiry handling, the `redirect_to` flow, and whether the `401` → `login/logout` dispatch path was touched.

### Feature flag changes (`src/constants/featureFlags.ts`)

Note the flag's current `enabled` default and whether it's expected to ship on or off, and remind the reviewer that URL query params override config in dev.

### UI changes

Ask reviewer to verify responsiveness, dark/light theme (`src/components/theme/`, `ThemeToggle`), and accessibility (aria roles/labels) per existing `src/components/` patterns.

### Test coverage changes

Mention whether `npm run test:cov` thresholds (80% branch/function/line) are still met, especially for new branches added to existing logic.

### Performance changes

Mention benchmarking.

---

# Output Format

If the split (Step 5.5) was ambiguous, first present the proposed commit groups and wait for confirmation before committing anything.

Once commits are created, return the response as:

```
Commits Created
---------------

1. <commit message subject 1> (<n> files)
2. <commit message subject 2> (<n> files)
...

Pull Request Title
-------------------

<generated PR title>

Pull Request Description
------------------------

<generated PR description>
```

If there was only one logical group, "Commits Created" still lists the single commit — don't drop the section, so the output format stays consistent regardless of whether a split happened.

---

# Example

### Input

Staged changes contain two unrelated fixes:

```
- fixed Picture-in-Picture desync when navigating between video pages (src/features/VideoDetail/)
- bumped a stale dependency in package.json, unrelated to the PiP fix
```

Branch:

```
fix/video-pip-navigation
```

---

### Output

Since the diff covers two unrelated concerns, Step 5.5 splits it into two groups, confirms with the user, then commits each (`git reset` → stage group 1 → commit → stage group 2 → commit):

Commits Created

```
1. fix(video): resolve Picture-in-Picture desync when navigating between pages (2 files)
2. chore(deps): bump outdated axios version (1 file)
```

Pull Request Title

```
fix(video): resolve Picture-in-Picture desync when navigating between pages
```

Pull Request Description

```
### **🚀 Description**

Fix a Picture-in-Picture desync bug when navigating between video pages, and bump a stale dependency.

#### **📌 Summary**

This PR fixes the video player continuing to reference a stale video element in Picture-in-Picture mode after navigating to a different video, and separately bumps an outdated dependency flagged unrelated to the fix.

#### **🔧 Changes Implemented**

- ✅ Reset Picture-in-Picture state when the active video changes
- ✅ Bumped axios to the latest patch version

#### **🛠️ How It Works?**

1. The video player now tears down and re-establishes PiP state on video change instead of reusing a stale reference.
2. The dependency bump is a patch-level version change with no code changes required.

#### **✅ Checklist Before Merging**

- [ ] Tested all relevant functionalities.
- [ ] Verified expected behavior on different use cases.
- [ ] Ensured code follows best practices and security standards.

#### **📢 Notes for Reviewers**

Two unrelated commits: the PiP fix and an incidental dependency bump — review independently.
```

---

# Best Practices

The skill must:

- Prioritize **clarity**
- Avoid **guessing functionality**
- Ignore **whitespace-only changes**
- Ignore **lock file changes** (`package-lock.json`) as their own commit — fold a lock file update into whichever `package.json` change produced it
- Summarize **functional behavior**, not code lines
- Never invent ticket IDs, Taiga links, or template sections this repo doesn't use — the only valid ticket URL pattern is `https://projects.arbisoft.com/project/arbisoft-sessions-portal-20/us/NN`
- Never use `git add -A`/`git add .` when re-staging a split group — always name specific paths or hunks (`git add -p`), per the Git Safety Protocol
- Don't split when it isn't warranted — a diff that's genuinely one logical change (even across several files/scopes) stays one commit; splitting for its own sake creates noise
- Remember every commit re-runs the full pre-commit hook (`lint` → `test:cov` → `build`, ~1–2 minutes) — warn the user before a multi-commit split

---

# Self-Healing This Skill

This SKILL.md cites specific paths and conventions (`src/app/`, `src/features/`, `src/components/`, `src/redux/`, `src/hooks/`, `src/models/`, `src/middleware.ts`, the `ASP-NN` ticket prefix, the scope table in Step 3, the reviewer-notes triggers in Step 9). Don't treat it as permanently accurate:

- If a run surfaces a cited path that no longer exists, a layer that's been restructured, or a scope row that no longer fits how the codebase is organized, that's a stale skill, not a one-off exception.
- Patch this SKILL.md in the same pass — add or fix the relevant row/example — rather than leaving the correction for a future run to rediscover.
- Only fix what you actually observed drifting during this run; don't speculatively rewrite sections you didn't touch.
