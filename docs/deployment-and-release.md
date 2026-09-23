# Deployment and Release

## Docker Deployment

The repository includes both a `Dockerfile` and `docker-compose.yml`.

## Dockerfile Summary

The Docker build is **multi-stage**:

### Stage 1: deps

- Base: `node:22.14.0-alpine`
- Copies `package*.json`, runs `npm ci`

### Stage 2: builder

- Base: `node:22.14.0-alpine`
- Accepts build args: `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_CLIENT_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` (all exported as `ENV`)
- Runs `npm run build` with an optional BuildKit secret `sentry_auth` exposed as `SENTRY_AUTH_TOKEN` for source map upload
- Reuses deps/node_modules from stage 1
- Copies source, builds with `npm run build`
- Standalone output (`output: "standalone"`)

### Stage 3: runner (production)

- Base: `node:22.14.0-alpine`
- Non-root user (`app`)
- Copies standalone, static, public
- Env: `NODE_ENV=production`, `PORT=4200`, `HOSTNAME=0.0.0.0`, `NEXT_TELEMETRY_DISABLED=1`
- Exposes `4200`
- CMD: `["node", "server.js"]`

## Docker Compose Summary

`docker-compose.yml` defines `web` service:

- Build: current dir + `Dockerfile`, args:
  - `NEXT_PUBLIC_BASE_URL`
  - `NEXT_PUBLIC_CLIENT_ID`
  - `NEXT_PUBLIC_GTM_ID`
  - (no Sentry args are passed by compose, so Sentry stays disabled in compose builds)
- Ports: `"4200:4200"`
- Env: `NODE_ENV=production`
- Restart: `unless-stopped`

## Next.js Build Configuration Relevant to Deployment

From `next.config.ts`:

- `output: "standalone"`
- `compress: true`
- `productionBrowserSourceMaps: false`
- ESLint ignored during builds

## Release Process

Releases are automated with [`release-it`](https://github.com/release-it/release-it) (config in `.release-it.json`, plus the `@release-it/conventional-changelog` plugin). `.github/workflows/release.yml` runs it whenever a `dev` → `main` PR is merged: it infers the version bump from conventional commits since the last tag, updates `CHANGELOG.md`, bumps `package.json`, commits (`chore(release): v<version>`), tags the commit `v<version>`, and publishes a GitHub release. That release publish triggers the container build/deploy workflow below — see the `GH_RELEASE_TOKEN` note under [Operational Gaps](#operational-gaps) for why the workflow authenticates with a PAT instead of the default `GITHUB_TOKEN`. `npm run release` runs the same flow locally (interactively, unless `--ci` is passed).

Latest release tag: `1.3.6` (see `CHANGELOG.md`; `package.json` matches at `1.3.6`).

## Changelog File

`CHANGELOG.md` exists and includes an entry for every release tag (latest `1.3.6`, `2026-09-14`).

The root `README.md` now links directly to `CHANGELOG.md` under additional documentation.

## CI/CD Pipeline

Three GitHub Actions workflows are defined in `.github/workflows/`:

### Build (`build.yml`) — "Lint, test and analyze"

- Triggers on push to `dev` or `main`, and on pull request (opened, synchronize, reopened) targeting `dev`
- Runs `npm ci`, `npm run lint`, `npm run test:cov`
- Runs `npm audit --omit=dev --audit-level=critical` (fails the job on a critical production-dependency vulnerability)
- Runs `npm run build` with `NEXT_PUBLIC_BASE_URL=https://example.invalid` (a placeholder value so the production build compiles in CI without a real backend)
- Runs the SonarQube scan (`SonarSource/sonarqube-scan-action`) using `SONAR_TOKEN` and `SONAR_HOST_URL` secrets; config is in `sonar-project.properties` (sources and tests under `src`, coverage from `coverage/lcov.info`)
- The Sonar quality-gate check step is present but commented out, so a red gate does not fail the job

### Release (`release.yml`)

- Triggers when a pull request into `main` is closed, gated to only run `if: github.event.pull_request.merged == true && github.event.pull_request.head.ref == 'dev'` (i.e. only for merged `dev` → `main` PRs, not other branches merged to `main`)
- Declares `permissions: contents: write` as least-privilege baseline, though the actual checkout/push/release-create auth comes from the `GH_RELEASE_TOKEN` secret (see [Operational Gaps](#operational-gaps)), not the ambient `GITHUB_TOKEN`
- Runs `npm ci`, configures a `github-actions[bot]` git identity (required for the commit `release-it` makes), then runs `npm run release -- --ci`
- `release-it` (see [Release Process](#release-process) above) does the version bump, changelog update, tag and GitHub release

### Build and Push Container Image (`build-and-push-container-image.yml`)

- Triggers when a GitHub release is published, or on manual `workflow_dispatch`
- Authenticates to AWS ECR using `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` secrets
- Builds the Docker image with `UID`, `GID`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_CLIENT_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` as build args, and `SENTRY_AUTH_TOKEN` as the `sentry_auth` build secret
- Pushes to ECR with two tags: the release tag and `latest`
- Triggers downstream deployment via a GitHub App token dispatching a workflow in a separate deployment repository

The deployment repository and target environment are configured via `GH_TRIGGER_OWNER`, `GH_TRIGGER_REPO`, and `GH_TRIGGER_WORKFLOW_ID` secrets. The specific hosting platform is external to this repository.

## Operational Gaps

- Production hosting platform is external to this repository and not documented here.
- Error monitoring is Sentry (see [Monitoring and Error Recovery](./modules/monitoring-and-error-recovery.md)); log aggregation and rollback procedures are not documented.
- `docker-compose.yml` declares `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_CLIENT_ID` and `NEXT_PUBLIC_GTM_ID` build args without values (taken from the shell/`.env`) and declares no Sentry args.
- The release flow assumes `dev` → `main` PRs are the only way commits reach `main` (branch protection is not configured in this repo, so this is a convention, not an enforced rule); a direct push to `main` would not trigger `release.yml` at all, since it only listens for merged PRs.
- **`release.yml` requires a `GH_RELEASE_TOKEN` repo secret** (a PAT or GitHub App installation token with `contents: write` on this repo) for both the checkout step and the `release-it` GitHub-release step. This is deliberate, not an oversight: GitHub suppresses events generated by the default `GITHUB_TOKEN` from starting other workflow runs (to prevent recursive triggers), which would otherwise silently stop `build-and-push-container-image.yml`'s `on: release: published` trigger from firing after `release-it` publishes a release. Using a PAT/App token instead avoids that entirely — `build-and-push-container-image.yml`'s own cross-repo dispatch uses the same pattern (a GitHub App token) for the identical reason. If `GH_RELEASE_TOKEN` is not set, `release.yml` will fail at checkout; add the secret under repo Settings → Secrets and variables → Actions before relying on this workflow.
