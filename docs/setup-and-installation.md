# Setup and Installation

## Prerequisites

From the repository configuration:

- Node.js `>=22.0.0 <23.0.0`
- npm `>=10.2.4`

The root `README.md` also recommends using Node.js 22 through `nvm`.

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
next dev --turbopack
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

The root `README.md` includes `nvm` instructions for switching to Node 22:

```bash
nvm install 22
nvm use 22
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
- The repo uses Turbopack in both `dev` and `build` scripts.
- The exact backend service required for live API calls is not described in the repository, so `.env.local` values must point to a working backend environment.
