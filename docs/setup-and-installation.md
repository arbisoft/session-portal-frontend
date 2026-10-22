# Setup and Installation

## Prerequisites

From the repository configuration:

- Node.js `>=24.15.0 <25.0.0`
- npm `>=10.2.4`

The root `README.md` also recommends using Node.js 24 through `nvm`.

`.nvmrc` pins Node 24 for `nvm use`, and `.npmrc` sets `engine-strict=true`, so `npm install` fails on a Node version outside the `engines` range in `package.json` instead of only warning. The CI workflows (`.github/workflows/build.yml`, `.github/workflows/release.yml`) and the `Dockerfile` pin Node 24 independently of these files.

### Dependency install scripts

`package.json` has an `allowScripts` field that lists the dependencies allowed to run install-time lifecycle scripts (`preinstall`, `install`, `postinstall`): `@sentry/cli`, `core-js-pure`, `esbuild`, `unrs-resolver` and `fsevents`, each pinned to the reviewed version. With npm 11.19.1 (bundled with Node 24.22.1) this policy is advisory: scripts still run, and `npm install` prints a notice for any dependency with install scripts that is not listed. After adding or upgrading a dependency that has install scripts, review the notice and record the approval with `npm install-scripts approve <pkg>` (`npm install-scripts ls` shows what is pending).

## Basic Local Setup

```bash
git clone https://github.com/<your-username>/session-portal-frontend.git session-portal
cd session-portal
git remote add upstream https://github.com/arbisoft/session-portal-frontend.git
npm install
cp example.env.local .env.local
npm run dev
```

This matches the current fork-based contribution workflow documented in `CONTRIBUTING.md`.

The development server script is:

```bash
next dev
```

## Install Playwright Browsers

Required before running Playwright tests for the first time:

```bash
npx playwright install
```

## Start Supporting Development Tools

### Storybook

```bash
npm run sb
```

Starts Storybook on port `6006`.

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

This runs ESLint and then TypeScript checking.

## Node Version Guidance

The root `README.md` includes `nvm` instructions for switching to Node 24:

```bash
nvm install 24
nvm use 24
```

## Expected Local Ports

| Port   | Purpose                                   |
| ------ | ----------------------------------------- |
| `3000` | Next.js application / Playwright base URL |
| `6006` | Storybook                                 |
| `4200` | Dockerized production container           |

## Setup Notes

- The app expects a local `.env.local` file copied from `example.env.local`.
- `example.env.local` includes `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_CLIENT_ID`, `NEXT_PUBLIC_GTM_ID`, and the Sentry variables (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`). Sentry values can stay as placeholders locally; `next dev` does not upload source maps.
- Next.js 16 uses Turbopack by default for both `dev` and `build`.
- The exact backend service required for live API calls is not described in the repository, so `.env.local` values must point to a working backend environment.
