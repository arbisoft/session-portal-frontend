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

Defined in `jest.config.ts`. It imports `next/jest.js` (with the explicit extension, and an `eslint-disable-next-line import/extensions` comment) because Node 24 loads the TypeScript config natively as ESM, where the extensionless `next/jest` specifier does not resolve.

Key settings:

| Setting             | Value                                                  |
| ------------------- | ------------------------------------------------------ |
| Environment         | `jsdom`                                                |
| Setup file          | `jest.setup.ts`                                        |
| Coverage provider   | `v8`                                                   |
| Coverage directory  | `./coverage/`                                          |
| Coverage thresholds | branches 80%, functions 80%, lines 80%, statements 80% |

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
- Proxy authentication (`src/proxy.ts`)
- Session verification (`src/features/AuthSession`): protected vs public routes, `401` redirect, kept session on 5xx/network errors, aborted in-flight verification, single request under React StrictMode, re-verification on rapid navigation
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
- `src/proxy.test.ts`
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
- `src/components/Button/button.test.tsx`
- `src/features/UploadVideo/form.test.tsx`, `form.analytics.test.tsx`, `fields.test.tsx`, `selectFields.test.tsx`, `videoPicker.test.tsx`, `uploadVideo.test.tsx`
- `src/features/VideoDetail/videoDetail.test.tsx`

### Mocking conventions used by the feature tests

- `react-virtuoso` renders no rows in jsdom (no layout), so `videoDetail.test.tsx` replaces `Virtuoso` with a stand-in that renders every item and the footer.
- `@/redux/events/apiSlice` hooks are mocked per test file; `form.test.tsx` uses empty data, while `selectFields.test.tsx` returns tags, playlists and users to exercise the option lists.
- `form.analytics.test.tsx` stubs `./fields` and `./selectFields` so the publish flow can be driven without MUI pickers.

### Node-environment tests and timers

`src/redux/store/configureStore.node.test.ts` runs with `@jest-environment node` and imports the real store. `redux-persist` arms a 5 second rehydrate timeout (`persistReducer`) on import that is never cleared, which kept the Jest worker alive and produced `A worker process has failed to exit gracefully`. The test therefore calls `jest.useFakeTimers()` before a dynamic `import("./configureStore")` and restores real timers afterwards. The warning only appears when Jest runs suites in parallel workers (`--detectOpenHandles` runs in band and does not reproduce it), so check with a plain `npx jest` run. Use the same pattern for any new test that imports the store outside jsdom.

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
