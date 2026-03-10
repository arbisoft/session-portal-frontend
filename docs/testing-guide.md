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

| Setting | Value |
| --- | --- |
| Environment | `jsdom` |
| Setup file | `jest.setup.ts` |
| Coverage provider | `v8` |
| Coverage directory | `./coverage/` |
| Coverage thresholds | branches 80, functions 80, lines 80, statements -10 |

### Module mappings

- CSS modules/styles -> `identity-obj-proxy`
- `@/` -> `src/`

## Jest Setup Behavior

`jest.setup.ts` performs several important actions:

- imports `@testing-library/jest-dom`
- imports `whatwg-fetch`
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
- `src/hooks/useAuth.test.ts`
- `src/hooks/useNavigation.test.ts`
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

## Important Caveats

- Although `playwright.config.ts` and `playwright-tests/` exist in the repository, this documentation update reflects the current team state described in this request: only Jest unit/component test cases should be treated as the active documented test workflow.
- Storybook is available and likely used for component verification, but no dedicated visual regression tooling configuration was confirmed from the inspected files.
