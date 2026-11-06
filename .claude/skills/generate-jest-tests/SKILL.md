---
name: generate-jest-tests
description: Generates Jest and React Testing Library unit tests for new or changed Session Portal code and for uncovered modules, following the repo's test conventions and the 80% coverage gate. Use when asked to write or add tests, improve coverage, or cover a diff, component, hook, util, RTK Query slice, server action or route handler.
argument-hint: Give changed files, a git diff, or a module to cover.
user-invocable: true
---

# Jest Unit Test Generator

Writes production-quality tests that match this repo's setup. Re-verify the stack in step 1 before relying on anything below.

## 1. Confirm the test environment

Read `jest.config.ts`, `jest.setup.ts`, `package.json` and a neighbouring test. At the time of writing:

- Jest 30 through `next/jest`, `jsdom` environment, V8 coverage, `@/` mapped to `src/`, CSS mapped to `identity-obj-proxy`.
- Global threshold in `jest.config.ts`: 80% branches, functions, lines and statements. Never lower it or add `coveragePathIgnorePatterns` entries to pass.
- `jest.setup.ts` loads `@testing-library/jest-dom`, `whatwg-fetch` and `jest-fetch-mock` (`fetchMock` is reset before each test), sets `NEXT_PUBLIC_BASE_URL`, mocks `useFeatureFlags`, and runs RTL `cleanup` after each test.
- Helpers: `customRender` in `src/jest/utils/testUtils.tsx` wraps the Redux `Providers` and the MUI `ThemeProvider`; manual mocks live in `__mocks__/` (`next/navigation`, `@reduxjs/toolkit`).

## 2. Find what needs tests

```bash
git diff --name-only HEAD
npm run test:cov    # uncovered files; the text report skips fully covered ones
```

Target `src/features`, `src/components`, `src/hooks`, `src/utils`, `src/redux`, `src/services`, `src/app/**/actions.ts`, `src/app/api/**` and `src/app/bff/**`. Skip `*.test.*`, `*.stories.*` and pure type files. Prioritize new and modified files, then the biggest coverage gaps.

## 3. Follow the project conventions

- Co-locate the test as `<name>.test.ts(x)` beside the source. Check the neighbours before choosing a different layout.
- Every `it`/`test` name starts with `should` (ESLint-enforced). Group with `describe(<unit>)`.
- Imports sorted per `import/order`; double quotes; lines at most 130 characters; `@/` alias for non-relative imports.
- Prefer `userEvent` (installed; the Testing Library docs recommend it because it simulates the full interaction) over `fireEvent`. Call `userEvent.setup()` before `render`, never inside hooks like `beforeEach` that run after it; use `fireEvent` where `user-event` cannot express the event or a neighbouring test already does. Query by role or accessible name before test ids.
- Test behavior (rendered output, dispatched actions, returned values, requests sent), not implementation details.
- Server-side code (route handlers, `proxy.ts`, server actions) uses `/** @jest-environment node */` and covers the failure paths: missing cookie, invalid input, upstream error.
- Wrap `window.location` access through `src/utils/browserLocation.ts` helpers in code and tests; jsdom's `location` cannot be redefined.
- Snapshots only where the neighbouring tests use them, and never updated to hide a behavior change.

## 4. Write the tests

Cover, per unit: the main behavior, edge inputs (`null`, `undefined`, empty arrays, boundaries), error handling, and every branch of the changed code.

| Target | Pattern |
| --- | --- |
| Pure util | Direct input/output assertions, no mocks (see `src/utils/utils.test.ts`); `it.each` for many similar cases |
| Component | `customRender`, assert output and interactions; mock RTK Query hooks or use `fetchMock` at the network boundary |
| Hook | `renderHook` from `@testing-library/react` (the separate hooks-testing package is obsolete); mock `next/navigation` as in `src/hooks/useVideoFilters.test.ts` |
| RTK Query slice | Dispatch through the real store with `fetchMock`; assert `serializeQueryArgs`, `merge` and `forceRefetch` as in `src/redux/events/events.test.tsx` |
| Server action / route handler | Node environment; mock `next/headers` cookies; assert status codes and that no token leaks |
| Analytics | Mock `@next/third-parties/google` `sendGTMEvent`; assert event name, category and params |

Jest 30 specifics: use canonical matchers (`toHaveBeenCalled`, `toHaveBeenCalledWith`, `toThrow`; the old `toBeCalled*` and `toThrowError` aliases are removed), `jest.createMockFromModule` instead of `genMockFromModule`, and `jest.mock` paths whose casing matches the file. Pass `--testPathPatterns` (plural) when filtering by path. `toHaveBeenCalledWith` is now type-checked against the function signature.

## 5. Validate

```bash
npx jest <new test files> --verbose
npm run lint
npm run test:cov
```

Tests must compile, be deterministic (fake timers or awaited async, no real network or clock), and keep the 80% gate green. Fix the cause of any failure; never skip or delete a test to pass.

## 6. Report

List the test files created or extended, what behavior each validates, and the coverage change for the touched files. Mention any code that was untestable without a refactor.
