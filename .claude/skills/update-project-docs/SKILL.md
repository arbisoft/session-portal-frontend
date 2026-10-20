---
name: update-project-docs
description: Intelligently refreshes project documentation by analyzing repository structure, modified files, git changes, configuration updates, and new features. Ensures README, CONTRIBUTING, CHANGELOG, and docs/* remain synchronized with the actual implementation.
argument-hint: Provide a description of the documentation update or run after code changes to synchronize documentation with the repository.
user-invocable: true
---

# Intelligent Project Documentation Synchronizer

## Purpose

This skill ensures project documentation remains synchronized with the **actual repository implementation**.

It analyzes:

- repository structure
- modified files and directories
- configuration updates
- environment variables
- dependencies
- new modules or features
- deleted functionality

Documentation is updated **only where changes affect documentation**.

---

# When To Use This Skill

Use this skill when:

- new features were implemented
- files or modules were added
- directories were restructured
- APIs were modified
- scripts or commands changed
- environment variables were added or removed
- dependencies were updated
- deployment setup changed
- documentation drift is suspected

Typical triggers:

```

after feature development
before opening a pull request
after infrastructure changes
after refactoring modules

```

---

# Documentation Targets

Primary documents:

README.md CONTRIBUTING.md CHANGELOG.md

Secondary documentation:

- docs/
- docs/README.md
- docs/setup/
- docs/deployment/
- docs/architecture/
- docs/api/
- docs/features/

Configuration files that affect docs:

- package.json
- package-lock.json
- .env.example
- example.env.local
- tsconfig.json
- next.config.ts
- Dockerfile
- docker-compose.yml
- Makefile

Source directories that define behavior:

- src/
- app/
- pages/
- routes/
- features/
- modules/
- services/
- lib/
- api/
- scripts/

---

# Source-of-Truth Priority

Always treat the following as authoritative:

1️⃣ Source code 2️⃣ Configuration files 3️⃣ Environment variable definitions 4️⃣ Infrastructure configuration 5️⃣ Existing documentation

If documentation conflicts with code, **update documentation**.

Never invent undocumented functionality.

---

## Self-Healing This Skill

This file cites paths, doc names and conventions that drift as the repo changes. Treat it as fallible:

1. **Verify before trusting.** At the start of every run, check that the files and directories this skill names exist (`git ls-files`, `ls`) and that the **Project Doc Map** below still matches the real `docs/` layout, `package.json` scripts and `example.env.local`.
2. **Patch drift in the same run.** If a cited path no longer exists, a doc was renamed or split, a script or env var was added or removed, or a rule here contradicts what correct code in this repo does now, fix this SKILL.md in the same pass and list it under "Skill self-heal" in the final report. Do not leave it for a later run.
3. **Only fix what you observed.** Do not speculatively rewrite sections you did not touch or verify.
4. **Never invent.** If a replacement fact cannot be confirmed from the repository, write "not defined in the repository" instead of guessing.
5. **Skill-specific checks:** the _Documentation Targets_ and _Detect Documentation Impact_ tables use generic paths (`docs/api/`, `docs/setup/`, `.env.example`, `requirements.txt`, `go.mod`). Correct them to the Project Doc Map when a run shows they do not exist here.

## Automatic Execution

This skill is part of the documentation pipeline that runs after every task that changes code, configuration, dependencies, CI or Docker files, in this order: `update-project-docs` → `documentation-generator` → `documentation-reviewer`. The project `CLAUDE.md` requires it, and the `Stop` hook in `.claude/settings.json` (`.claude/hooks/docs-sync-check.mjs`) re-prompts once when source files changed but no documentation did. If the docs already match the code, report "Documentation is already synchronized" and change nothing.

## Project Doc Map (source of truth for this repo)

Verify this table against `git ls-files docs README.md CONTRIBUTING.md CHANGELOG.md` and the real code before using it. It replaces the generic `docs/api/`, `docs/setup/`, `.env.example` style paths used elsewhere in this skill.

| Change in | Update |
| --- | --- |
| `src/redux/**/apiSlice.ts`, `src/endpoints/**`, `src/app/bff/**` | `docs/api.md`, `docs/state-management-and-api-layer.md` |
| `src/models/**` | `docs/data-models.md` |
| `src/features/<Name>/**` | `docs/modules/<module>.md` (see `docs/README.md` index), `docs/routing-and-application-flows.md`, `docs/folder-structure.md` |
| `src/components/**` | `docs/components-and-ui-system.md` |
| `src/hooks/**`, `src/utils/**` | `docs/ARCHITECTURE.md` (hooks table), `docs/modules/data-transforms.md` |
| `src/middleware.ts`, `src/app/login/**`, `src/redux/login/**`, `src/redux/store/**` | `docs/modules/authentication.md`, `docs/ARCHITECTURE.md`, `docs/state-management-and-api-layer.md` |
| `src/utils/analytics.ts` | `docs/modules/analytics-tracking.md` |
| `src/constants/featureFlags.ts` | `docs/modules/feature-flags.md` |
| `package.json` scripts, `jest.config.ts` | `docs/scripts-and-tooling.md`, `docs/testing-guide.md`, `README.md` |
| `example.env.local`, `next.config.ts`, `Dockerfile`, `.github/**` | `docs/environment-and-configuration.md`, `docs/deployment-and-release.md` |
| `CHANGELOG.md` | generated by `release-it`; never hand-edit |

A new feature module also needs a row in the `docs/README.md` module list and a link from `README.md`.

---

# Workflow

---

# Step 1 — Detect Modified Files and Directories

Identify changes introduced in the repository.

Run:

```bash
git diff --name-only HEAD
```

or for PR context:

```bash
git diff --name-only origin/main
```

Also inspect staged changes:

```bash
git diff --name-only --staged
```

Determine:

- modified files
- newly added files
- removed files
- renamed directories

Group changes by **directory/module**.

Example classification:

```
src/features/wishlist/*
src/api/products/*
src/components/*
config/*
scripts/*
```

---

# Step 2 — Detect Documentation Impact

Map changed files to documentation areas.

Examples:

| Changed Path   | Documentation Impact      |
| -------------- | ------------------------- |
| src/api        | API docs                  |
| src/features   | Feature documentation     |
| src/components | UI documentation          |
| package.json   | scripts + setup           |
| Dockerfile     | deployment docs           |
| .env.example   | environment configuration |
| scripts        | developer workflow        |
| routes         | API / routing docs        |

Mark documentation sections that require updates.

---

# Step 3 — Detect New Modules or Features

Identify newly added directories.

Example:

```
src/features/collaborator-wishlist
```

If a **new feature/module** exists:

Update:

```
README feature list
docs/features/*
architecture docs
```

Generate documentation for new modules when missing.

---

# Step 4 — Detect Removed Functionality

If files or modules were removed:

Remove or update documentation referencing them.

Example:

```
removed src/api/legacy-orders
```

Update:

```
docs/api
README
```

---

# Step 5 — Detect Configuration Changes

Inspect configuration changes.

Important sources:

```
package.json
.env.example
Dockerfile
docker-compose.yml
Makefile
next.config.ts
```

Check for:

- new scripts
- removed scripts
- dependency updates
- runtime version changes
- environment variables added or removed

Update documentation sections accordingly.

---

# Step 6 — Detect Environment Variable Changes

Parse:

```
.env.example
example.env.local
```

Compare with documentation.

Update:

```
README environment section
docs/setup
docs/configuration
```

Document:

- variable name
- purpose
- example value

---

# Step 7 — Detect Dependency Changes

Inspect dependency updates in:

```
package.json
requirements.txt
go.mod
Cargo.toml
```

Update documentation for:

- required runtime versions
- dependency installation instructions
- new tooling requirements

---

# Step 8 — Detect Script Changes

Inspect `package.json` scripts.

Example:

```
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "lint": "eslint ."
}
```

Update:

```
README scripts section
docs/development
```

Ensure commands remain accurate.

---

# Step 9 — Update Documentation Sections

Apply targeted updates.

Affected sections include:

### README

Update:

- project overview
- feature list
- setup instructions
- scripts
- environment variables
- architecture summary

---

### CHANGELOG

Generate entries based on git changes.

Example:

```
## Added
- collaborator wishlist feature

## Fixed
- filter infinite loading issue

## Refactored
- API request logic
```

---

### Architecture Documentation

Update when directories change.

Reflect:

```
src/features
src/modules
src/services
```

Explain module responsibilities.

---

### API Documentation

If API routes changed:

Update:

```
docs/api/*
```

Include:

- endpoint description
- parameters
- response format

---

### Deployment Documentation

Update when:

```
Dockerfile
docker-compose.yml
```

changes.

Document:

- build commands
- runtime environment
- container setup

---

# Step 10 — Cross-Document Consistency Check

Ensure no contradictions between:

```
README.md
CONTRIBUTING.md
CHANGELOG.md
docs/*
```

Validate:

- setup instructions match scripts
- environment variables match `.env.example`
- deployment docs match Docker configuration

---

# Step 11 — Navigation and Links

Verify documentation navigation.

Ensure:

README links to docs docs index links to subdocs no broken relative links

Prevent orphan documentation.

---

# Step 12 — Markdown Quality Check

Validate formatting.

Ensure:

- correct heading hierarchy
- valid code blocks
- consistent formatting
- no malformed markdown

---

# Decision Rules

## If documentation already matches code

Do **not rewrite the document**.

Only report:

```
Documentation is already synchronized.
```

---

## If documentation gaps exist

Generate missing sections using **verified repository facts only**.

---

## If behavior cannot be confirmed

Write explicitly:

```
This behavior is not explicitly defined in the repository.
```

Never guess.

---

# Output Format

Return a structured report.

---

# Documentation Update Summary

Modified documentation:

- README.md
- docs/api/products.md
- docs/setup/environment.md

---

# Documentation Changes

### Updated

- documented new environment variables
- updated setup instructions
- refreshed API documentation

### Added

- docs/features/collaborator-wishlist.md

### Removed

- outdated API documentation for legacy endpoints

---

# CHANGELOG Entry

Provide suggested changelog entry.

Example:

```
## Added
- collaborator wishlist feature

## Updated
- environment variable documentation

## Fixed
- outdated setup instructions
```

---

# Open Questions

List items that could not be verified from repository.

Example:

```
Environment variable PAYMENT_SECRET usage not found in code.
```

---

# Example Commands

Refresh docs after repository changes:

```
/update-project-docs refresh documentation after feature development
```

Update API documentation:

```
/update-project-docs update API docs after route changes
```

Update environment documentation:

```
/update-project-docs sync environment variables
```

Update deployment documentation:

```
/update-project-docs update Docker and deployment setup docs
```

```

---

# What This Upgrade Adds

| Improvement | Benefit |
|---|---|
Git change awareness | updates docs only when necessary |
Directory analysis | detects new modules automatically |
Feature detection | updates README features |
Changelog generation | automatic release documentation |
API change detection | keeps API docs accurate |
Env variable tracking | prevents missing configuration docs |
Dependency tracking | keeps setup instructions correct |
Cross-doc validation | prevents conflicting instructions |
```
