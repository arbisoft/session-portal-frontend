---
name: documentation-generator
description: Use when auditing a codebase to generate, update, or repair project documentation - reviews README, setup, architecture, business logic modules, workflows, onboarding, and contribution guidelines so documentation is complete and accurate
---

# Documentation Generator

## Summary

Perform a comprehensive documentation audit of the current codebase and produce complete, accurate, and up-to-date documentation.

Analyze the full project structure, existing documentation, configuration, scripts, workflows, and all business logic modules. Update the README and create or revise supporting documentation files where necessary. Prioritize clarity for new developer onboarding and ensure contribution guidelines are detailed enough for consistent team collaboration.

Core principle: **Documentation must reflect the actual codebase, not assumptions.**

## Applies When

Use when:

- Generating documentation for an existing codebase
- Updating an outdated README
- Creating onboarding material for new developers
- Documenting architecture, modules, services, APIs, or workflows
- Establishing contribution guidelines
- Auditing documentation for missing or stale information
- Updating module-level documentation after business logic changes

Do not use when:

- Only a small inline code comment is needed
- The user asks for marketing copy rather than technical documentation
- The codebase is unavailable and cannot be inspected

## Must

- Inspect the entire codebase before writing final documentation
- Review existing documentation before replacing or restructuring it
- Update the README with accurate, complete, and navigable information
- Create or revise documentation files when the README would become too large
- Read every business logic module and update or create module documentation
- Document setup, installation, environment variables, scripts, and local development
- Document architecture, data flow, major modules, services, integrations, and workflows
- Add clear onboarding instructions for new developers
- Include comprehensive contribution guidelines
- Identify undocumented assumptions, required services, credentials, and dependencies
- Keep documentation organized for easy navigation
- Prefer accurate code-derived facts over generic best practices
- Mark uncertain items clearly instead of inventing details

## Must Not

- Assume project behavior without checking the code
- Omit important business logic
- Ignore module-level documentation
- Leave README inconsistent with supporting docs
- Create vague documentation such as “run the app” without exact commands
- Skip setup, architecture, workflows, onboarding, or contribution guidance
- Remove useful existing documentation without preserving or improving its content
- Invent APIs, scripts, environment variables, or workflows not present in the codebase

## Required Documentation Coverage

Ensure documentation covers:

| Area                 | Required Content                                                     |
| -------------------- | -------------------------------------------------------------------- |
| Project overview     | Purpose, scope, main features, tech stack                            |
| Setup                | Prerequisites, installation, environment variables, local commands   |
| Usage                | How to run, build, test, lint, debug, and deploy if applicable       |
| Architecture         | Folder structure, major components, data flow, external integrations |
| Business logic       | Module responsibilities, rules, workflows, edge cases                |
| APIs                 | Endpoints, request/response shapes, auth, errors if applicable       |
| Configuration        | Required config files, environment variables, secrets handling       |
| Testing              | Test strategy, commands, fixtures, coverage expectations             |
| Development workflow | Branching, commits, PR process, review expectations                  |
| Code standards       | Formatting, linting, naming, patterns, anti-patterns                 |
| Onboarding           | First-day setup, key files to read, common tasks                     |
| Troubleshooting      | Known issues, setup failures, debugging tips                         |

## Self-Healing This Skill

This file cites paths, doc names and conventions that drift as the repo changes. Treat it as fallible:

1. **Verify before trusting.** At the start of every run, check that the files and directories this skill names exist (`git ls-files`, `ls`) and that the **Project Doc Map** below still matches the real `docs/` layout, `package.json` scripts and `example.env.local`.
2. **Patch drift in the same run.** If a cited path no longer exists, a doc was renamed or split, a script or env var was added or removed, or a rule here contradicts what correct code in this repo does now, fix this SKILL.md in the same pass and list it under "Skill self-heal" in the final report. Do not leave it for a later run.
3. **Only fix what you observed.** Do not speculatively rewrite sections you did not touch or verify.
4. **Never invent.** If a replacement fact cannot be confirmed from the repository, write "not defined in the repository" instead of guessing.
5. **Skill-specific checks:** the suggested `docs/` tree in step 5 (`architecture.md`, `onboarding.md`, `contribution.md`, ...) is an example. Prefer extending the existing files listed in the Project Doc Map (`docs/ARCHITECTURE.md`, `docs/contributing-notes.md`, `docs/modules/*.md`) over creating duplicates, and add every new doc to `docs/README.md`.

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
| `src/proxy.ts`, `src/app/login/**`, `src/redux/login/**`, `src/redux/store/**` | `docs/modules/authentication.md`, `docs/ARCHITECTURE.md`, `docs/state-management-and-api-layer.md` |
| `src/utils/analytics.ts` | `docs/modules/analytics-tracking.md` |
| `src/constants/featureFlags.ts` | `docs/modules/feature-flags.md` |
| `package.json` scripts, `jest.config.ts` | `docs/scripts-and-tooling.md`, `docs/testing-guide.md`, `README.md` |
| `example.env.local`, `next.config.ts`, `Dockerfile`, `.github/**` | `docs/environment-and-configuration.md`, `docs/deployment-and-release.md` |
| `CHANGELOG.md` | generated by `release-it`; never hand-edit |

A new feature module also needs a row in the `docs/README.md` module list and a link from `README.md`.

## Workflow Steps

### 1. Inventory the Codebase

Review:

- Root files
- Package/config files
- Source directories
- Scripts
- Tests
- CI/CD files
- Existing docs
- Environment examples
- Business logic modules

Create a mental map of what the project actually does before editing documentation.

### 2. Audit Existing Documentation

Check whether existing docs are:

- Accurate
- Complete
- Current
- Duplicated
- Contradictory
- Missing important workflows

Preserve useful content, but correct stale or misleading information.

### 3. Analyze Business Logic Modules

For every business logic module and feature:

- Identify its responsibility (what it does)
- Explain who uses it and who maintains it
- Describe why it exists (business purpose and value)
- Document when it's triggered or used (conditions, triggers, lifecycle)
- Specify where it's implemented (files, components, services)
- Detail how it works (logic flow, algorithms, key decisions)
- Document inputs, outputs, side effects, and dependencies
- Capture important edge cases and error handling
- Update existing module docs or create new module documentation

If business logic spans multiple modules, document the end-to-end workflow with the same who/why/when/where/how details.

### 4. Update README

README must provide the primary entry point for new developers.

Include:

- Project name and purpose
- Feature summary
- Tech stack
- Repository structure
- Setup instructions
- Environment configuration
- Common commands
- Usage examples
- Testing instructions
- Links to deeper docs
- Contribution summary

Keep README navigable. Move deep details into `docs/` when needed.

### 5. Create or Update Supporting Docs

Create files as needed, commonly:

```text
docs/
  architecture.md
  onboarding.md
  contribution.md
  development-workflow.md
  business-logic.md
  modules/
    <module-name>.md
  api.md
  troubleshooting.md
```

Only create files that add clarity. Do not create empty or redundant docs.

### 6. Add New Developer Onboarding

Include:

- Required tools and versions
- Setup sequence
- Local run instructions
- First files to understand
- Common development tasks
- How to run tests
- How to debug
- Where business logic lives
- How to safely make changes

### 7. Add Contribution Guidelines

Document:

- Branch naming
- Commit message expectations
- PR checklist
- Code review expectations
- Testing requirements
- Formatting and linting rules
- Code standards
- Documentation update requirements
- Release or deployment process if applicable

### 8. Validate Documentation Against Code

Before finishing:

- Verify every command exists
- Verify every referenced file exists
- Verify environment variables are real
- Verify module names and paths are correct
- Verify README links work
- Verify contribution instructions match actual tooling
- Remove outdated or speculative claims

## Output Requirements

Final documentation must be:

- Accurate to the current codebase
- Clear for a new developer
- Structured for easy navigation
- Comprehensive without being bloated
- Specific, not generic
- Updated at README and module level
- Honest about unknowns or missing information

## Common Mistakes

| Mistake                               | Fix                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------- |
| Writing README before inspecting code | Audit codebase first                                                      |
| Documenting only setup                | Include architecture, workflows, business logic, and contribution process |
| Skipping business logic modules       | Read each module and document responsibilities and rules                  |
| Creating one massive README           | Use README as index and move details into `docs/`                         |
| Inventing missing information         | Mark unknowns clearly or infer only when strongly supported               |
| Ignoring existing docs                | Update, merge, or remove stale documentation deliberately                 |
| Generic contribution guide            | Match actual tooling, branching, tests, and project workflow              |

## Exit Criteria

Documentation is complete only when:

- README is accurate, current, and navigable
- Required supporting docs exist and are linked
- Setup, usage, architecture, workflows, and testing are documented
- Every business logic module is documented or intentionally covered by a broader module doc
- New developer onboarding is clear and actionable
- Contribution guidelines include code standards, branching, PR process, and documentation expectations
- All commands, paths, links, and environment variables have been checked against the codebase
- No critical project behavior is omitted
