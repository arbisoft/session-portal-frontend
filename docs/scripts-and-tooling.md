# Scripts and Tooling

## npm Scripts

From `package.json`:

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `next dev --turbopack` | Start local development server |
| `build` | `next build --turbopack` | Create production build |
| `build:e2e` | `cp -n example.env.local .env.local && next build --turbopack` | Build with env bootstrap for E2E |
| `start` | `next start` | Run built app |
| `typecheck` | `./node_modules/.bin/tsc --project ./tsconfig.json` | Run TypeScript checking |
| `lint` | `eslint && npm run typecheck` | Run linting and type checking |
| `prepare` | `is-ci || husky || true` | Set up Git hooks outside CI |
| `release` | `release-it` | Create a release |
| `generate:resource` | `hygen generate resource` | Generate scaffolding via Hygen |
| `postgenerate:resource` | `npm run lint -- --fix` | Lint/fix after generation |
| `sb` | `storybook dev -p 6006` | Start Storybook |
| `build-storybook` | `storybook build` | Build Storybook static output |
| `test` | `jest --verbose` | Run Jest tests |
| `test:cov` | `jest --coverage --verbose` | Run Jest with coverage |

## Tooling Summary

### Linting and formatting

Configured tools found:

- ESLint
- Prettier integration through ESLint plugin
- TypeScript strict mode

### Commit hygiene

Configured tools found:

- Husky
- CommitLint
- conventional commits

### Release tooling

`release-it` is configured in `.release-it.json`.

Observed release behavior:

- release commit message: `chore(release): v${version}`
- GitHub releases enabled with conventional changelog
- npm publishing disabled
- Automated via GitHub Actions workflow on PR merge to main from dev
- changelog written to `CHANGELOG.md`
- conventional commit sections customized for features, fixes, docs, refactors, tests, CI, and more

The root `README.md` also links directly to `CHANGELOG.md`, making release history part of the main repository navigation.

### Dependency maintenance

- `renovate.json` exists, indicating Renovate-based dependency update automation.

### Storybook

Storybook dependencies and scripts are present, indicating component exploration and isolated UI development support.

## Tooling Notes

- `generate:resource` depends on Hygen, but the exact scaffolding templates were not inspected here.
- There is no `format` script in the current `package.json`, even though repository memory references formatting practices.
- ESLint is configured as a primary enforcement layer and includes many custom architectural/performance restrictions.
