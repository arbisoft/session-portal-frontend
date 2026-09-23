# Scripts and Tooling

## npm Scripts

From `package.json`:

| Script | Command | Purpose | | ----------------------- | -------------------------------------------------------------- | -------------------------------- | ----- | --- | ----- | --------------------------- | | `dev` | `next dev --turbopack` | Start local development server | | `build` | `next build --turbopack` | Create production build | | `build:e2e` | `cp -n example.env.local .env.local && next build --turbopack` | Build with env bootstrap for E2E | | `start` | `next start` | Run built app | | `typecheck` | `./node_modules/.bin/tsc --project ./tsconfig.json` | Run TypeScript checking | | `lint` | `eslint && npm run typecheck` | Run linting and type checking | | `prepare` | `is-ci                                                         |                                  | husky |     | true` | Set up Git hooks outside CI | | `release` | `release-it` | Create a release | | `generate:resource` | `hygen generate resource` | Legacy, see note below (broken) | | `postgenerate:resource` | `npm run lint -- --fix` | Runs after `generate:resource` | | `format:check` | `prettier --check .` | Check formatting | | `format` | `prettier --write .` | Apply formatting | | `sb` | `storybook dev -p 6006` | Start Storybook | | `build-storybook` | `storybook build` | Build Storybook static output | | `test` | `jest --verbose` | Run Jest tests | | `test:cov` | `jest --coverage --verbose` | Run Jest with coverage |

## Tooling Summary

### Linting and formatting

Configured tools found:

- ESLint
- Prettier integration through ESLint plugin
- TypeScript strict mode

### Commit hygiene

Configured tools found:

- Husky: `.husky/pre-commit` runs `npm run lint`, `npm run test:cov`, `npm run build`; `.husky/commit-msg` runs `npx commitlint --edit`
- CommitLint
- conventional commits

### Release tooling

`release-it` (config in `.release-it.json`) automates releases: `npm run release` runs it locally, and `.github/workflows/release.yml` runs it in CI (`npm run release -- --ci`) whenever a `dev` → `main` PR is merged. The `@release-it/conventional-changelog` plugin infers the version bump from conventional commits, updates `CHANGELOG.md`, and `release-it` tags the release as `v<version>` and publishes a GitHub release, which triggers the container build/deploy workflow — see [Deployment and Release](./deployment-and-release.md#operational-gaps) for the `GH_RELEASE_TOKEN` secret this depends on.

The root `README.md` also links directly to `CHANGELOG.md`, making release history part of the main repository navigation.

### Static analysis and CI

- `.github/workflows/build.yml` runs lint, coverage tests and a SonarQube scan on push/PR to `dev` (see [Deployment and Release](./deployment-and-release.md)).
- Jest coverage thresholds (`jest.config.ts`): branches, functions and lines at 80% globally.

### Dependency maintenance

- `.github/dependabot.yml` configures dependency update automation. Dependabot covers npm, GitHub Actions, and Docker ecosystems (weekly, PRs targeting `dev`), groups minor/patch npm updates, and excludes major-version bumps of `next`/`react`/`react-dom`/`node` from automated PRs.
- `package.json` pins transitive dependency versions via `overrides`: `react`, `react-dom`, `@types/react`, `@types/react-dom`, and `conventional-changelog-conventionalcommits` (the last one pinned for compatibility with the `conventionalcommits` preset used by release tooling above).

### Storybook

Storybook dependencies and scripts are present, indicating component exploration and isolated UI development support.

## Tooling Notes

- `generate:resource` is a leftover: Hygen is not in `package.json` dependencies and there is no `_templates/` directory (the project removed Hygen in March 2025). Running it will fail.
- Prettier formatting is enforced through `eslint-plugin-prettier` and can also be run directly with `npm run format` / `npm run format:check`. `npm run lint -- --fix` applies auto-fixable changes.
- ESLint enforces many custom architectural/performance restrictions such as sorted imports, `no-console` (except `warn`/`error`), test names starting with `should`, restricted MUI import paths, and React Hook Form performance rules.
- The `build:e2e` script bootstraps `.env.local` from `example.env.local` (using `cp -n` to avoid overwriting) before building. Useful in CI environments where `.env.local` is not committed.
