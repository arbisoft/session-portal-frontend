# Contributing

Thank you for contributing to `session-portal-frontend`.

This guide is based on the current repository files, especially `README.md`, and is intended to help contributors get started quickly and follow the existing project workflow.

## Prerequisites

Before contributing, make sure you have:

- Node.js 22 LTS
- npm installed
- `nvm` installed if you want to manage Node versions easily

The project currently expects Node 22.

### Using `nvm`

```sh
nvm install 22
nvm use 22
```

To verify:

```sh
node -v
npm -v
```

## Getting Started

1. Fork the repository to your own GitHub account.

2. Clone your fork locally:

   ```bash
   git clone https://github.com/<your-username>/session-portal-frontend.git session-portal
   ```

3. Move into the project directory:

   ```bash
   cd session-portal
   ```

4. Add the original repository as an upstream remote:

   ```bash
   git remote add upstream https://github.com/arbisoft/session-portal-frontend.git
   ```

5. Install dependencies:

   ```bash
   npm install
   ```

6. Copy the example environment file:

   ```bash
   cp example.env.local .env.local
   ```

7. Start the development server:

   ```bash
   npm run dev
   ```

## Keeping Your Fork Updated

Sync your fork with the upstream repository before starting new work:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

If your default branch is not `main`, use your repository's default branch name instead.

## Running Tests

The repository currently has Jest-based unit and component tests. Use:

```bash
npm run test
```

For coverage output:

```bash
npm run test:cov
```

## Jest Notes

The repository is configured to use `next/jest` so that Next.js configuration and environment values are loaded into the test environment.

Important Jest details from the current setup:

- test environment: `jsdom`
- setup file: `jest.setup.ts`
- coverage provider: `v8`
- coverage directory: `./coverage/`
- coverage thresholds:
  - branches: 80%
  - functions: 80%
  - lines: 80%

Jest picks up test files matching these patterns:

- `*.test.ts` / `*.test.tsx`
- files under `__tests__/`

Note: `.spec.ts` files in `playwright-tests/` are Playwright end-to-end tests, not Jest tests.

## Git Hooks (Husky)

Once `npm install` completes, Husky installs local Git hooks automatically. The pre-commit hook runs three checks before every commit:

```bash
npm run lint
npm run test:cov
npm run build
```

All three must pass. Expect commits to take 1–2 minutes locally. The commit-msg hook enforces conventional commit format via `commitlint`.

## Commit Messages

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

Supported types used in this project: `feat`, `fix`, `refactor`, `docs`, `test`, `ci`, `chore`, `perf`, `revert`.

Examples:

```
feat(auth): redirect to original page after login
fix(a11y): make sidebar collapse keyboard-accessible
chore(deps): upgrade Next.js to v15
```

## Branch Workflow

| Branch | Purpose                                        |
| ------ | ---------------------------------------------- |
| `dev`  | Active development; all PRs target this branch |
| `main` | Stable/release branch; never commit directly   |

Create a branch from `dev`, open a PR back to `dev`. The release to `main` is automated — do not open PRs directly to `main`.

## Development Expectations

When contributing:

- keep changes focused and small where possible
- follow the existing code style and project structure
- place tests alongside code when appropriate
- update documentation when behavior changes

## Suggested Local Checks

Before opening a pull request, run the full suite:

```bash
npm run lint
npm run test:cov
npm run build
```

These are the same checks the pre-commit hook runs. If your change affects coverage-sensitive code, also review the output in `./coverage/`.

## Environment Setup

The repository currently documents use of:

- `.env.local`
- `example.env.local`

Do not commit secrets or local-only environment values.

## Pull Requests

A PR template is pre-filled when you open a pull request. Complete all sections:

- **Description**: concise summary of what the PR does and why
- **Changes Implemented**: bullet list of key changes
- **How It Works**: step-by-step explanation including edge cases
- **Checklist**: confirm testing, behavior verification, and code standards
- **Screenshots**: required for any UI changes
- **Taiga Ticket**: link to the associated Taiga issue at `https://projects.arbisoft.com/project/arbisoft-sessions-portal-20/us/XXX`
- **Notes for Reviewers**: anything important for code review

Steps:

1. Push your branch to your fork
2. Open the pull request targeting the `dev` branch of the upstream repository
3. Fill in the PR template completely
4. Wait for CI (lint workflow) to pass before requesting review

## CI and Release

| Event                          | What happens                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| Push or PR to `dev`            | Lint + type check runs automatically                             |
| PR from `dev` merged to `main` | `release-it` creates a GitHub release and updates `CHANGELOG.md` |
| GitHub release published       | Docker image built and pushed to AWS ECR; deployment triggered   |

Contributors do not need to run `npm run release` manually.
