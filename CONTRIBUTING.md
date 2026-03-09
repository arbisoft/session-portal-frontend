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

Test files should follow the existing naming patterns:

- `*.test.ts`
- `*.test.tsx`
- `*.spec.ts`
- `*.spec.tsx`
- files under `__tests__/`

## Development Expectations

When contributing:

- keep changes focused and small where possible
- follow the existing code style and project structure
- place tests alongside code when appropriate
- update documentation when behavior changes

## Suggested Local Checks

Before opening a pull request, run the checks already documented in the project:

```bash
npm run dev
npm run test
```

If your change affects coverage-sensitive code, also review the coverage output in `./coverage/`.

## Environment Setup

The repository currently documents use of:

- `.env.local`
- `example.env.local`

Do not commit secrets or local-only environment values.

## Pull Requests

When opening a pull request:

- push your branch to your fork
- open the pull request from your fork to the upstream repository
- describe the purpose of the change clearly
- mention any setup or testing steps reviewers should know
- include screenshots or recordings for UI changes when useful
- note any follow-up work if the change is partial

## Areas That May Need Future Clarification

This repository did not include a dedicated contribution guide before this file was created, so some workflow details are still not explicitly documented in source files, including:

- branch naming rules
- PR title conventions
- review and approval expectations
- release responsibilities

If the team has internal standards for these, they can be added here later.
