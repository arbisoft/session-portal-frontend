# Folder Structure

## Top-Level Layout

```text
.
├── src/                  # Application source
├── public/               # Static assets
├── playwright-tests/     # End-to-end tests
├── __mocks__/            # Jest/manual mocks
├── docs/                 # Generated project documentation
├── Dockerfile            # Production container build
├── docker-compose.yml    # Container orchestration for app image
├── package.json          # Dependencies, scripts, release config
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
├── jest.config.ts        # Jest configuration
├── playwright.config.ts  # Playwright configuration
├── eslint.config.mjs     # ESLint flat config
├── commitlint.config.js  # Commit message validation
└── CHANGELOG.md          # Release history
```

## `src/` Overview

```text
src/
├── app/         # Next.js App Router routes and page entry points
├── components/  # Reusable UI components and layout containers
├── constants/   # App-wide constants and feature flags
├── endpoints/   # API endpoint path definitions
├── features/    # Page/feature-level modules
├── hooks/       # Reusable custom hooks
├── jest/        # Test utilities
├── models/      # TypeScript domain models
├── redux/       # Store, slices, API, selectors, error handling
├── services/    # Service utilities, including server-side helpers
└── utils/       # General utilities
```

## Route Files

Routes visible from `src/app/`:

| Route | File |
| --- | --- |
| `/` | `src/app/page.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/videos` | `src/app/videos/page.tsx` |
| `/videos/[videoId]` | `src/app/videos/[videoId]/page.tsx` |
| `/videos/results` | `src/app/videos/results/page.tsx` |
| `/upload-video` | `src/app/upload-video/page.tsx` |

## Feature Modules

| Feature folder | Main responsibility inferred |
| --- | --- |
| `HomePage` | Startup route behavior and auth redirect shell |
| `LoginPage` | Login screen and Google OAuth initiation |
| `VideosListingPage` | Browsing videos, featured content, filters, virtualized list with infinite loading |
| `SearchResultsPage` | Search-specific result presentation |
| `VideoDetail` | Player page with metadata and recommendations |
| `UploadVideo` | Upload-related UI flow |

## Component Organization Pattern

Several component folders follow a co-located pattern such as:

- implementation file
- `index.ts` barrel export
- `styled.tsx`
- `.test.tsx`
- `.stories.tsx`
- snapshot files where relevant

Examples:

- `src/components/Button/`
- `src/components/Navbar/`
- `src/components/ReadMore/`
- `src/components/Select/`
- `src/components/containers/MainLayoutContainer/`

## State and API Structure

```text
src/redux/
├── baseApi.tsx          # RTK Query root API object
├── customBaseQuery.ts   # Shared fetch behavior
├── parseError.ts        # API error normalization
├── events/              # Event-related API endpoints/tests
├── login/               # Login slice, selectors, API slice
└── store/               # Store setup and provider
```

## Models

Observed model groups:

- `src/models/Auth/`
- `src/models/Events/`

These define request/response and domain object shapes used across features and API slices.

## Testing Structure

- Unit/integration tests live beside source files as `*.test.ts(x)`.
- End-to-end tests live in `playwright-tests/`.
- Manual mocks live in `__mocks__/`.

## Notes

- No existing repository `docs/` directory was found before this documentation task.
- Some folders such as `src/services/runs-on-server-side/` were not deeply documented here because their responsibilities were not fully inferable from the inspected subset.
