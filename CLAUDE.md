# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Turbopack, port 4200)
npm run build        # Production build
npm run lint         # ESLint + TypeScript check
npm run typecheck    # TypeScript only
npm run test         # Jest tests
npm run test:cov     # Jest with coverage
npm run sb           # Storybook on port 6006
npm run generate:resource  # Hygen scaffolding for new features
```

Run a single test file:
```bash
npx jest src/path/to/file.test.tsx --verbose
```

## Environment Setup

Copy `example.env.local` to `.env.local` and set:
- `NEXT_PUBLIC_BASE_URL` — backend API host (e.g. `http://127.0.0.1:8000/`)
- `NEXT_PUBLIC_CLIENT_ID` — Google OAuth client ID
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager ID

**Important:** `NEXT_PUBLIC_*` vars are inlined at compile time into client bundles. After changing `.env.local`, delete `.next/` and restart the dev server. When using Docker Compose, these are passed as build args — Docker reads from `.env` (not `.env.local`), so copy accordingly and rebuild with `--no-cache`.

## Architecture

### Layer model

```
src/app/          → Route entry points (thin, delegate to features)
src/features/     → Page-level orchestration (state, API calls, composition)
src/components/   → Reusable UI primitives co-located with tests/stories/styled
src/hooks/        → Reusable custom hooks
src/redux/        → Store, RTK Query slices, selectors, error handling
src/models/       → TypeScript domain types (Auth, Events)
src/endpoints/    → API path constants
src/constants/    → App-wide constants and env var exports
```

### Providers (wired in `src/app/layout.tsx`)

`GoogleOAuthProvider` → Redux `Provider` + `PersistGate` → MUI `ThemeProvider` → `NotificationProvider`

### Authentication

- Google OAuth login initiated in `src/features/LoginPage/loginPage.tsx` via `useGoogleLogin`
- `loginAndSetCookie` server action (`src/app/login/actions.ts`) validates the token, sets an HttpOnly cookie, and returns session data for Redux
- Route protection is handled by `src/middleware.ts` — `/videos` and `/videos/*` require auth; unauthenticated users are redirected to `/login?redirect_to=...`
- `useAuth` hook enforces client-side auth redirects within the authenticated shell
- `401` API responses dispatch `login/logout` via `customBaseQuery`

### Data fetching

- `src/redux/customBaseQuery.ts` — base URL from `NEXT_PUBLIC_BASE_URL`, Bearer token injection, `401` → logout, error normalization via `parseError`
- `src/redux/baseApi.tsx` — shared RTK Query instance; all API slices inject into this
- `src/redux/events/apiSlice.ts` — video/event endpoints with infinite scroll merge strategy
- Redux Persist whitelists only `login.session` to local storage

### Navigation

Use `useNavigation` hook (not `useRouter` directly) for all internal navigation. It centralizes route definitions:
- `home` → `/`, `login` → `/login`, `videos` → `/videos`, `searchResult` → `/videos/results`, `videoDetail(id)` → `/videos/:id`, `uploadVideo` → `/upload-video`

### Component conventions

Components follow a co-located pattern: `Component.tsx`, `index.ts`, `styled.tsx`, `component.test.tsx`, `component.stories.tsx`. MUI components must use deep imports (enforced by ESLint) — e.g. `import Button from "@mui/material/Button"`, not `import { Button } from "@mui/material"`.

### Coding conventions

- Commits must follow Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.) — enforced by commitlint
- `no-console` except `warn`/`error`
- Test names must start with `should`
- Coverage thresholds: 80% branches, functions, and lines
- `@/` path alias maps to `src/`
