# Contributing Notes

## Current Contribution Signals in the Repository

The repository now includes a dedicated `CONTRIBUTING.md` file at the root. This document summarizes the contribution-related guidance currently visible across:

- `CONTRIBUTING.md`
- `README.md`
- `package.json`
- `commitlint.config.js`
- `eslint.config.mjs`

## Before You Start

Recommended setup based on repository files:

1. Use Node.js 22
2. Fork the repository to your own GitHub account
3. Clone your fork locally
4. Add the original repository as `upstream`
5. Install dependencies with `npm install`
6. Copy `example.env.local` to `.env.local`
7. Run local checks before opening a pull request

## Fork-Based Workflow

The current documented contribution flow is fork-based rather than direct cloning of the upstream repository.

Typical setup:

```bash
git clone https://github.com/<your-username>/session-portal-frontend.git session-portal
cd session-portal
git remote add upstream https://github.com/arbisoft/session-portal-frontend.git
npm install
cp example.env.local .env.local
```

To keep the fork updated:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

If the default branch is not `main`, contributors should use the actual default branch name of their fork.

## Branch and Commit Hygiene

### Commit messages

`commitlint.config.js` extends conventional commits, so commit messages should follow that format.

Examples of commit types visible in the changelog:

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `ci`
- `chore`

### Git hooks

The `prepare` script enables Husky outside CI:

```bash
is-ci || husky || true
```

That indicates local hook-based checks are expected once dependencies are installed.

## Code Quality Expectations

Visible quality gates include:

- ESLint
- TypeScript strict mode
- Jest tests
- Playwright tests
- Storybook for component-level review

## Code Organization Expectations

Based on the project layout:

- reusable UI should go in `src/components/`
- page/business logic should go in `src/features/`
- route entry files should stay in `src/app/`
- shared types should go in `src/models/`
- API integration should use `src/redux/` RTK Query slices
- endpoint constants should stay in `src/endpoints/`

## Testing Expectations

Before submitting changes, the repository strongly suggests running:

```bash
npm run lint
npm run test
npx playwright test
```

For UI components, Storybook coverage may also be useful:

```bash
npm run sb
```

Playwright browser installation is required before first use:

```bash
npx playwright install
```

## Pull Requests

The current contribution guidance indicates that contributors should:

- push changes to a branch on their fork
- open the pull request from the fork to the upstream repository
- describe the purpose of the change clearly
- mention any setup or testing notes for reviewers
- include screenshots or recordings for UI changes when useful
- mention follow-up work when the change is partial

## Pre-Commit Hook

Husky installs a pre-commit hook at `.husky/pre-commit` that runs three checks on every commit:

```bash
npm run lint
npm run test:cov
npm run build
```

All three must pass before a commit is accepted. This means commits take longer locally but ensures the tree is always in a buildable, tested, linted state.

The commit-msg hook at `.husky/commit-msg` runs `npx commitlint --edit` to enforce conventional commit format.

## Pull Request Template

A PR template is defined at `.github/PULL_REQUEST_TEMPLATE.md`. It requires:

- A concise description and summary
- A list of changes implemented
- A "How It Works" section
- A pre-merge checklist (tested, verified, code standards)
- Screenshots or recordings for UI changes
- A link to the associated Taiga ticket: `https://projects.arbisoft.com/project/arbisoft-sessions-portal-20/us/XXX`
- Notes for reviewers

## Branch and Release Workflow

The repository uses a two-branch model:

| Branch | Purpose                                                                          |
| ------ | -------------------------------------------------------------------------------- |
| `dev`  | Active development target; PRs and lint CI run against this branch               |
| `main` | Stable/release branch; a PR merge from `dev` → `main` triggers automated release |

Contributors should branch off `dev` and open PRs targeting `dev`. The release workflow fires automatically when a `dev` → `main` PR is merged — contributors do not need to run `npm run release` manually.

## CI Workflows

| Workflow       | Trigger                       | What it runs                                 |
| -------------- | ----------------------------- | -------------------------------------------- |
| Lint           | Push or PR to `dev`           | `npm run lint` (ESLint + TypeScript)         |
| Release        | PR merged from `dev` → `main` | `npm run release -- --ci` via `release-it`   |
| Build and Push | GitHub release published      | Docker build → ECR push → deployment trigger |
