---
name: documentation-generator
description: Audits the Session Portal codebase against its documentation and creates the docs that are missing or too thin. Use after update-project-docs when a change adds a module, hook, endpoint, route or tool that has no documentation yet, or when asked to generate onboarding, architecture, module or contribution documentation.
---

# Documentation Generator

Creates documentation that does not exist yet. Step 2 of the documentation pipeline. Principle: **documentation reflects the actual codebase, not assumptions.**

**Read `.claude/references/documentation-pipeline.md` first.** It holds the Project Doc Map, the pipeline order and the shared rules. This skill covers only what is specific to generating new documentation.

## Use when

- A module, hook, endpoint, route, component family or tool has no matching doc.
- A module doc exists but omits responsibilities, flows or edge cases the code clearly has.
- Onboarding, architecture or contribution material is missing or stale.

Do not use for inline code comments or marketing copy.

## Must

- Inspect the code before writing; read every business-logic module you document.
- Extend the file the Project Doc Map names before creating a new one, and link every new doc from `docs/README.md`.
- Use exact commands, paths and variable names that exist in the repo.
- Mark uncertain items instead of inventing details.

## Must not

- Invent APIs, scripts, env vars or workflows.
- Remove useful existing content without preserving or improving it.
- Create empty or redundant files, or write vague steps such as "run the app".

## Coverage the finished docs must give

| Area | Required content |
| --- | --- |
| Overview | Purpose, scope, features, tech stack |
| Setup | Prerequisites (versions from `.nvmrc` and `package.json` engines), install, env vars, local commands |
| Architecture | Folder structure, layers, data flow, integrations (BFF proxy, backend API, Sentry, GTM) |
| Modules | Per module: responsibility, who uses it, when it runs, where it lives, inputs, outputs, side effects, edge cases and error handling |
| API layer | RTK Query endpoints, BFF proxy contract, auth and error handling |
| Configuration | Env vars, feature flags, secrets handling |
| Testing | Strategy, commands, helpers in `src/jest/utils`, the 80% coverage gate |
| Workflow | Branching (PRs target `dev`), conventional commits, hooks, review expectations |
| Operations | Docker, CI, release, health check, rollback, monitoring |
| Onboarding | First-day setup, key files to read, common tasks, troubleshooting |

## Workflow

1. **Inventory**: root and config files, `src/` layers, scripts, tests, CI, existing docs, env templates.
2. **Audit existing docs** for accuracy, completeness, duplication and contradictions. Keep what is useful, correct what is stale.
3. **Document modules**: for each undocumented module or flow, write the table rows above in `docs/modules/<module>.md`. For logic spanning modules, document the end-to-end flow.
4. **README**: keep it the navigable entry point (overview, stack, structure, setup, commands, testing, links to `docs/`). Move depth into `docs/`.
5. **Onboarding and contribution**: required tools and versions, setup sequence, how to run and debug, branch and commit rules, PR checklist, documentation expectations.
6. **Validate** with the real checks listed in the shared reference. Remove speculative claims.

## Exit criteria

README is accurate and navigable, every business-logic module is documented or covered by a broader doc, every new doc is linked from `docs/README.md`, and every command, path, link and variable has been checked against the codebase. Report what you created, what you extended, and what could not be verified.
