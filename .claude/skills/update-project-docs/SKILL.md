---
name: update-project-docs
description: Refreshes the Session Portal documentation from the current diff. Use after any task that changes code, configuration, dependencies, CI or Docker files, or when documentation drift is suspected. Maps changed files to the docs they affect (README, CONTRIBUTING, docs/*), updates only what the change makes inaccurate, and reports "Documentation is already synchronized" when nothing needs to change.
argument-hint: Run after code changes, or describe the documentation update needed.
user-invocable: true
---

# Project Documentation Synchronizer

Keeps `README.md`, `CONTRIBUTING.md` and `docs/*` in step with the implementation. Step 1 of the documentation pipeline.

**Read `.claude/references/documentation-pipeline.md` first.** It holds the Project Doc Map, the pipeline order and the rules shared with `documentation-generator` and `documentation-reviewer`. Do not restate them here.

## Workflow

### 1. Find what changed

```bash
git status --short
git diff --name-only HEAD
git diff --name-only dev...HEAD   # PR context; all PRs target dev
```

Group changes by directory or module. Note added, removed and renamed files separately.

### 2. Map changes to documentation

Use the Project Doc Map. Beyond it, check these triggers:

- **Scripts or tooling**: compare `package.json` scripts with the README and `docs/scripts-and-tooling.md`.
- **Environment variables**: compare `example.env.local` and `src/constants/constants.ts` with `docs/environment-and-configuration.md`. Record name, purpose and example value.
- **Dependencies or runtime versions**: update required versions in the README, `docs/setup-and-installation.md` and `.nvmrc` references.
- **Docker, CI, release**: compare `Dockerfile`, `docker-compose.yml` and `.github/workflows/*` with `docs/deployment-and-release.md`.
- **New feature module**: add `docs/modules/<module>.md`, a row in the `docs/README.md` list, and a README link.
- **Removed functionality**: delete or rewrite every doc passage that mentions it. Grep the docs for the removed name.

### 3. Update

Make targeted edits. Do not rewrite a document that is already accurate. Do not touch `CHANGELOG.md`; `release-it` generates it from conventional commits.

### 4. Check consistency

Setup steps match the scripts, env vars match `example.env.local`, deployment docs match the Docker and CI files, README links and the `docs/README.md` index resolve, and Markdown is well formed (`npx prettier --check README.md docs CONTRIBUTING.md`).

## Output

```
## Documentation update summary
Updated: <file> — <what changed and why>
Added: <file>
Removed: <passage or file>
Open questions: <anything not verifiable from the repository>
```

If nothing needed to change, output only: `Documentation is already synchronized.`
