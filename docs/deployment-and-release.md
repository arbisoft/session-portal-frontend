# Deployment and Release

## Docker Deployment

The repository includes both a `Dockerfile` and `docker-compose.yml`.

## Dockerfile Summary

The Docker build is multi-stage:

### Build stage

- base image: `node:22.14.0-alpine`
- installs dependencies with `npm ci`
- builds the app with `npm run build`
- accepts build args:
  - `NEXT_PUBLIC_BASE_URL`
  - `NEXT_PUBLIC_CLIENT_ID`
  - `NEXT_PUBLIC_GTM_ID`
- exports environment variables for `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_CLIENT_ID`
- accepts `NEXT_PUBLIC_GTM_ID` as a build argument, but the current `Dockerfile` does not export it through a matching `ENV` instruction in the builder stage

### Runtime stage

- base image: `node:22.14.0-alpine`
- creates a non-root `app` user
- uses standalone Next.js output
- copies:
  - `.next/standalone`
  - `.next/static`
  - `public/`
- sets environment:

```text
NODE_ENV=production
PORT=4200
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
```

- exposes port `4200`
- starts with:

```json
["server.js"]
```

## Docker Compose Summary

`docker-compose.yml` defines one service:

- service name: `web`
- build context: current repository
- publishes `4200:4200`
- passes build args for:
  - `NEXT_PUBLIC_BASE_URL`
  - `NEXT_PUBLIC_CLIENT_ID`
- does not currently pass `NEXT_PUBLIC_GTM_ID`, even though the `Dockerfile` accepts it as a build argument
- runtime environment includes `NODE_ENV=production`
- restart policy: `unless-stopped`

## Next.js Build Configuration Relevant to Deployment

From `next.config.js`:

- standalone output is enabled
- production browser source maps are disabled
- compression is enabled
- build-time ESLint failures are ignored

## Release Process

The release process is configured via `release-it` in `package.json`.

Observed behavior:

- Git commit on release
- GitHub release creation enabled
- npm publishing disabled
- changelog written to `CHANGELOG.md`
- conventional commit categorization used for changelog sections
- `package.json` version is currently `1.2.0`, matching the latest changelog entry

## Changelog File

`CHANGELOG.md` exists and includes at least release `1.2.0` dated `2025-11-20`.

The root `README.md` now links directly to `CHANGELOG.md` under additional documentation.

## CI/CD Notes

The root `README.md` badges reference GitHub Actions, and `renovate.json` exists. However:

- no GitHub workflow files were inspected during this pass
- deployment triggers, target environment, and full CI pipeline details are therefore not documented here as confirmed facts

## Operational Gaps

The repository currently documents container build and release mechanics, but it does not explicitly define:

- production deployment steps
- rollback procedure
- monitoring or alerting setup
- application log collection or inspection workflow
- credential rotation procedure

## Open Questions

- What production platform runs the container image?
- Is `NEXT_PUBLIC_GTM_ID` intentionally omitted from the current container build flow, or should it be forwarded alongside the other public build arguments?
- Are environment variables injected only at build time, or also at runtime in deployment?
- Which CI workflow publishes or deploys the built image?

These items should be documented once corresponding workflow or platform configuration is reviewed.
