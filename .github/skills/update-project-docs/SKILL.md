---
name: update-project-docs
description: Automatically refreshes project documentation to reflect the current repository state. Ensures README, CONTRIBUTING, CHANGELOG, and docs/* remain accurate and consistent with code, configuration, environment variables, scripts, and deployment setup.
argument-hint: Provide a brief description of the documentation update needed, or ask to refresh project docs based on recent repository changes.
user-invocable: true
---

# Update Project Docs

## Purpose

Synchronize project documentation with the current repository implementation.

This skill prevents documentation drift by validating docs against:

- source code
- configuration files
- environment variables
- scripts and dependencies
- deployment infrastructure

It updates documentation **only where discrepancies exist**.

---

# When to Use This Skill

Use this skill when:

• project documentation may be outdated
• repository configuration changed
• environment variables were added/removed
• scripts in `package.json` changed
• Docker / deployment setup changed
• routes or app structure changed
• contribution workflows changed
• repository structure evolved
• documentation inconsistencies were detected

---

# Documentation Targets

Primary documentation files:

README.md
CONTRIBUTING.md
CHANGELOG.md

Secondary documentation locations:

docs/
docs/README.md
docs/setup/
docs/deployment/
docs/architecture/
docs/api/

Supporting files that may influence documentation:

package.json
example.env.local
.env.example
next.config.js
tsconfig.json
Dockerfile
docker-compose.yml
Makefile

Source directories:

src/
app/
pages/
routes/
scripts/

---

# Source of Truth Hierarchy

When determining facts, prioritize:

1️⃣ Repository implementation
2️⃣ Configuration files
3️⃣ Environment examples
4️⃣ Build scripts and tooling
5️⃣ Existing documentation

If documentation conflicts with code, **code and configuration are authoritative**.

Never invent undocumented behavior.

---

# Workflow

## Step 1 — Detect Documentation Scope

Determine the scope of updates.

Possible scopes:

• single document update
• multiple documentation files
• full documentation refresh

If the request is broad, review all top-level documentation.

---

## Step 2 — Detect Repository Changes

Identify recent changes that may affect documentation.

Run:

```bash
git diff --name-only HEAD
````

or:

```bash
git diff --name-only origin/main
```

Look for changes in:

* configuration
* environment variables
* scripts
* dependencies
* routing
* deployment

Flag documentation areas affected by these changes.

---

## Step 3 — Identify Source-of-Truth Files

For each documentation area, determine the real source.

Examples:

Environment documentation → `.env.example`, `example.env.local`

Scripts documentation → `package.json`

Deployment documentation → `Dockerfile`, `docker-compose.yml`

Routing documentation → `src/app/`, `pages/`, `routes/`

Contributor workflow → `.github/`, `CONTRIBUTING.md`

---

## Step 4 — Inspect Current Documentation

Read the relevant documentation files.

Look for outdated claims such as:

• missing environment variables
• incorrect setup instructions
• outdated scripts
• incorrect runtime versions
• obsolete deployment instructions
• incorrect repository workflows

Identify mismatches between docs and code.

---

## Step 5 — Identify Documentation Deltas

Before editing, explicitly determine:

New items introduced:

* environment variables
* scripts
* configuration
* routes
* commands

Removed or changed items:

* scripts renamed
* env vars removed
* workflows updated
* deployment changes

Track these changes before updating docs.

---

## Step 6 — Apply Targeted Documentation Updates

Update only affected sections.

Guidelines:

• prefer small targeted edits
• avoid rewriting entire documents unnecessarily
• maintain existing formatting style
• keep wording factual and repository-verified

If a documentation gap exists:

Document the confirmed behavior without speculation.

---

## Step 7 — Validate Cross-Document Consistency

Ensure no documentation conflicts remain.

Verify consistency between:

README.md
CONTRIBUTING.md
CHANGELOG.md
docs/*

Check that:

• setup instructions match scripts
• environment variables are consistently described
• deployment docs match Docker configuration
• contributor guidance matches repository workflow

---

## Step 8 — Validate Navigation & Links

Ensure documentation navigation remains correct.

Verify:

• README links to major docs
• docs/README links to subdocuments
• relative links remain valid

Prevent orphaned documentation files.

---

## Step 9 — Documentation Coverage Check

Confirm critical documentation areas exist.

Required sections:

Project overview
Setup instructions
Environment configuration
Development workflow
Scripts and commands
Deployment instructions
Contribution guidelines

If missing, recommend adding them.

---

## Step 10 — Markdown Quality Validation

Ensure markdown quality.

Check:

• headings hierarchy
• valid code blocks
• consistent formatting
• no broken links

Avoid introducing formatting errors.

---

# Decision Rules

## Broad Refresh Request

Re-read:

README.md
CONTRIBUTING.md
docs/README.md
package.json
.env examples
Docker files

Then update affected documentation.

---

## Narrow Update Request

Read only:

• the requested document
• files that provide its source of truth

---

## Code and Docs Disagree

Treat repository code/config as authoritative.

Update documentation accordingly.

---

## Missing Information

If a detail cannot be confirmed in the repository:

Do not guess.

Instead document:

"This behavior is not explicitly defined in the repository."

---

# Quality Checks

Before completing the task confirm:

• documentation reflects current repository state
• no outdated instructions remain
• environment variables are documented
• scripts match package.json
• deployment docs match Docker configuration
• cross-document links are valid
• markdown formatting is correct

---

# Output Format

After completing updates, produce a concise report.

## Documentation Update Summary

Updated files:

* README.md
* CONTRIBUTING.md
* docs/setup.md

Key updates:

* documented new environment variables
* updated scripts from package.json
* corrected deployment instructions
* synchronized contributor workflow

Open questions:

* environment variable `XYZ` usage not confirmed in repository
* deployment workflow partially inferred

---

# Example Commands

Refresh docs after repository changes:

```
/update-project-docs refresh docs after package.json updates
```

Update environment documentation:

```
/update-project-docs sync environment variables with example.env.local
```

Update deployment documentation:

```
/update-project-docs update Docker and deployment docs
```

Re-sync contributor documentation:

```
/update-project-docs align README and CONTRIBUTING workflow
```

```

---

## What this refinement improves

| Improvement | Benefit |
|---|---|
Source-of-truth hierarchy | prevents hallucinated docs |
Git change detection | updates docs only when needed |
Cross-doc validation | prevents contradictions |
Coverage checks | ensures key docs exist |
Link integrity checks | prevents broken navigation |
Structured report output | clearer AI results |

---
