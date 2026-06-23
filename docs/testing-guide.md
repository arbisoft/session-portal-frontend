# Testing Guide

## Testing Stack

The repository includes the following testing tools:

- Jest
- React Testing Library
- `@testing-library/jest-dom`
- Storybook

## Unit and Component Tests

### Run tests

```bash
npm run test
```

### Run coverage

```bash
npm run test:cov
```

## Jest Configuration

Defined in `jest.config.ts`.

Key settings:

| Setting             | Value                                                            |
| ------------------- | ---------------------------------------------------------------- |
| Environment         | `jsdom`                                                          |
| Setup file          | `jest.setup.ts`                                                  |
| Coverage provider   | `v8`                                                             |
| Coverage directory  | `./coverage/`                                                    |
| Coverage thresholds | branches 80%, functions 80%, lines 80% (statements not enforced) |

### Module mappings

- CSS modules/styles -> `identity-obj-proxy`
- `@/` -> `src/`

## Jest Setup Behavior

`jest.setup.ts` performs several important actions:

- imports `@testing-library/jest-dom`
- imports `whatwg-fetch`

## Test Coverage

Current test suite includes unit tests for:

- Utility functions (`src/utils/utils.ts`)
- Middleware authentication (`src/middleware.ts`)
- Feature pages: HomePage, LoginPage, VideosListingPage, SearchResultsPage, VideoDetail
- Redux slices and API integrations
- Reusable components (Navbar, Sidebar, etc.)

New tests added for previously untested feature pages to improve coverage on routing, loading states, and error handling.

- enables `jest-fetch-mock`
- mocks `@/hooks/useFeatureFlags`
- resets fetch mocks before each test
- populates a global `preloadedState` for Redux-backed tests

It also sets:

```ts
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:1234";
```

## Test File Locations

Examples found in the repository:

- `src/components/Navbar/navbar.test.tsx`
- `src/components/Notification/notification.test.tsx`
- `src/components/ReadMore/readMore.test.tsx`
- `src/components/Select/select.test.tsx`
- `src/hooks/useNavigation.test.ts`
- `src/middleware.test.ts`
- `src/redux/parseError.test.ts`
- `src/utils/utils.test.ts`

## Current Test Coverage

The current documentation baseline for active test work is Jest-based unit and component coverage under `src/`.

Examples found in the repository include:

- `src/redux/store/redux.test.ts`
- `src/redux/login/login.test.tsx`
- `src/redux/events/events.test.tsx`
- `src/components/VideoCard/videoCard.test.tsx`
- `src/components/VideoPlayer/videoPlayer.test.tsx`
- `src/components/Sidebar/sidebar.test.tsx`
- `src/components/ThemeToggle/themeToggle.test.tsx`

## End-to-End Tests (Playwright)

Playwright tests live in `playwright-tests/` and use `.spec.ts` naming. They are separate from Jest.

Install browsers before first use:

```bash
npx playwright install
```

Run tests:

```bash
npx playwright test
```

The Playwright config (`playwright.config.ts`) sets base URL to `http://localhost:3000` and adjusts retries/workers based on the `CI` environment variable.

## Jest Test File Pattern

Jest picks up files matching:

- `**/__tests__/**/*.[jt]s?(x)`
- `**/?(*.)+(test).[jt]s?(x)`

The `.spec.ts` extension in `playwright-tests/` is intentionally excluded — those files are only picked up by Playwright, not Jest.

## Storybook

Storybook stories are co-located with components (`*.stories.tsx`). Run Storybook for isolated component development:

```bash
npm run sb
```

No visual regression testing tooling is configured beyond manual Storybook review.
