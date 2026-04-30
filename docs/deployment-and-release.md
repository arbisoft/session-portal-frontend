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
- Accepts build args: `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_CLIENT_ID`, `NEXT_PUBLIC_GTM_ID`
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
  - `NEXT_PUBLIC_GTM_ID:`
- Ports: `"4200:4200"`
- Env: `NODE_ENV=production`
- Restart: `unless-stopped`

## Next.js Build Configuration Relevant to Deployment

From `next.config.js`:
- `output: "standalone"`
- `compress: true`
- `productionBrowserSourceMaps: false`
- ESLint ignored during builds

## Release Process

`release-it` from `npm run release`:
- Commits changes
- GitHub releases
- Updates `CHANGELOG.md` (conventional commits)
- No npm publish

Current version: `1.3.0` (see `CHANGELOG.md`).

## Changelog File

`CHANGELOG.md` exists and includes at least release `1.2.0` dated `2025-11-20`.

The root `README.md` now links directly to `CHANGELOG.md` under additional documentation.

## CI/CD Notes

The root `README.md` badges reference GitHub Actions, and `renovate.json` exists.

A release workflow exists at `.github/workflows/release.yml` that:
- Triggers on pull request merged to `main` from `dev` branch
- Runs `release-it` to create releases, update changelog, and tag commits

Deployment triggers, target environment, and full CI pipeline details are not documented here as confirmed facts beyond the release process.

## Operational Gaps

- Prod platform/CI-CD not documented.
- Monitoring/logging/rollback missing.
- `NEXT_PUBLIC_GTM_ID` empty in compose.
