<!-- badges -->

![REACT](https://img.shields.io/badge/React%2019.1.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NEXT JS](https://img.shields.io/badge/next%20js%2015.5.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TYPESCRIPT](https://img.shields.io/badge/TypeScript%205.9.3-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MATERIAL UI](https://img.shields.io/badge/Material%20UI%207.3.4-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![PLAYWRIGHT](https://img.shields.io/badge/Playwright%201.43.1-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white)
![ESLINT](https://img.shields.io/badge/eslint%209.38.0-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)
![GITHUB ACTIONS](https://img.shields.io/badge/Github%20Actions-282a2e?style=for-the-badge&logo=githubactions&logoColor=367cfe)

# Arbisoft Sessions Portal Frontend

## Overview

Frontend application for the Sessions Portal built with Next.js, React, and TypeScript.

## Features

- Google OAuth-based login
- Video listing, filtering, and search flows
- Video detail pages with recommendations
- RTK Query-powered data fetching and Redux state management
- Storybook and Jest support for UI and test workflows

## Requirements

- Node.js 22 LTS
- npm 10.2.4 or later

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/arbisoft/session-portal-frontend.git session-portal
   cd session-portal
   ```

2. Install and use Node.js 22 LTS

   ```bash
   nvm install 22
   nvm use 22
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Copy example environment file

   ```bash
   cp example.env.local .env.local
   ```

5. Run development server

   ```bash
   npm run dev
   ```

## Environment Variables

Copy `example.env.local` to `.env.local` and set:

- `NEXT_PUBLIC_BASE_URL` for the backend API host
- `NEXT_PUBLIC_CLIENT_ID` for Google OAuth
- `NEXT_PUBLIC_GTM_ID` for Google Tag Manager

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run build:e2e` | Build for CI E2E runs after bootstrapping `.env.local` |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint and TypeScript checks |
| `npm run typecheck` | Run TypeScript checks only |
| `npm run test` | Run Jest tests |
| `npm run test:cov` | Run Jest with coverage |
| `npm run release` | Run the configured `release-it` release flow |
| `npm run generate:resource` | Generate scaffolding with Hygen |
| `npm run sb` | Start Storybook |
| `npm run build-storybook` | Build Storybook |

## Architecture

The app uses the Next.js App Router with feature modules under `src/features/`, reusable UI in `src/components/`, and Redux Toolkit with RTK Query in `src/redux/`.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for a deeper architecture overview.

## API

Frontend API integration is documented in [`docs/state-management-and-api-layer.md`](./docs/state-management-and-api-layer.md), including authentication and event-related endpoints.

## Testing

Run tests:

```bash
npm run test
```

Run with coverage:

```bash
npm run test:cov
```

Coverage output is written to `./coverage/`. The test suite includes unit tests for utilities, middleware, Redux state, and feature components with Jest and React Testing Library.

## Deployment

Containerized deployment details are documented in [`docs/deployment-and-release.md`](./docs/deployment-and-release.md).

## Troubleshooting

- If API-backed screens do not load, verify that `.env.local` contains a valid `NEXT_PUBLIC_BASE_URL`.
- If Google login does not initialize, verify `NEXT_PUBLIC_CLIENT_ID` and `NEXT_PUBLIC_GTM_ID` in `.env.local`.

## Contributing

Please use the fork-based workflow documented in `CONTRIBUTING.md`.

## Additional Documentation

- Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Changelog: [`CHANGELOG.md`](./CHANGELOG.md)
- Project docs index: [`docs/README.md`](./docs/README.md)

## Inspiration

Boilerplate Inspiration (https://github.com/brocoders/extensive-react-boilerplate).
