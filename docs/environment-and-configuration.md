# Environment and Configuration

## Environment Variables Found

`example.env.local` defines the following variables explicitly:

| Variable | Present in example file | Usage observed |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Yes | API host prefix in `src/constants/constants.ts` and media URL composition |
| `NEXT_PUBLIC_CLIENT_ID` | Yes | Google OAuth provider in `src/app/layout.tsx` |
| `NEXT_PUBLIC_GTM_ID` | Yes | Google Tag Manager initialization in `src/app/layout.tsx` |
| `NEXT_PUBLIC_IMAGE_HOSTS` | No | Extra comma-separated hostnames the image optimizer may fetch from (`next.config.ts`) |
| `NEXT_PUBLIC_HOTJAR_ID` | No | Hotjar site id used by the snippet in `src/app/layout.tsx` (defaults to the current id) |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Sentry DSN for browser, server and edge init (empty disables reporting) |
| `SENTRY_ORG` | Yes | Sentry org for source map upload in `next.config.ts` (build time) |
| `SENTRY_PROJECT` | Yes | Sentry project for source map upload (build time) |
| `SENTRY_AUTH_TOKEN` | Yes (blank) | Secret for source map upload at build time; never commit |

`src/app/layout.tsx` also embeds a Hotjar initialization script directly in the document head.

Additional variables are referenced elsewhere:

| Variable | Usage observed | Notes |
| --- | --- | --- |
| `CI` | `playwright.config.ts` | Controls retries, worker count, and server command |
| `NODE_ENV` | store config / Docker / Sentry | Dev tools, production behavior, Sentry sample rates and `withSentryConfig` gating |
| `NEXT_RUNTIME` | `src/instrumentation.ts` | Set by Next.js; selects the Node.js or edge Sentry config |

## Base URL Behavior

`src/constants/constants.ts` defines:

```ts
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
```

This value is used for:

- API base URL construction in `src/redux/customBaseQuery.ts`
- media URLs in UI helper functions such as `transformVideoToCardData`
- thumbnail/video URLs in search and listing views

## Next.js Configuration

`next.config.ts` currently configures:

- `reactStrictMode: true`
- `compress: true`
- `productionBrowserSourceMaps: false`
- Emotion compiler support
- standalone build output (`output: "standalone"`)
- `images.remotePatterns: [{ hostname: "*" }]` — all external image hostnames are allowed (intentionally permissive for development convenience)
- build-time ESLint suppression via `ignoreDuringBuilds: true`
- Sentry wrapper (`withSentryConfig`) applied for every `NODE_ENV` except `development`

## TypeScript Configuration

Important `tsconfig.json` settings:

| Setting            | Value            |
| ------------------ | ---------------- |
| `strict`           | `true`           |
| `noEmit`           | `true`           |
| `moduleResolution` | `bundler`        |
| `jsx`              | `preserve`       |
| `baseUrl`          | `.`              |
| path alias         | `@/* -> ./src/*` |

## ESLint Configuration

`eslint.config.mjs` uses flat config and includes:

- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-import`
- `eslint-plugin-prettier`
- `@next/eslint-plugin-next`

Notable enforced practices:

- double quotes
- sorted imports with grouping
- strict unused variable checking
- `no-console` except `warn` and `error`
- test names should start with `should`
- restricted MUI import patterns
- several custom restrictions for React Hook Form performance

## Commit Message Configuration

`commitlint.config.js` extends:

```js
@commitlint/config-conventional
```

This indicates conventional commits are expected.

## Ambiguities / Follow-up Needed

- The repository memory mentions Hotjar and GTM; GTM is confirmed in code, while Hotjar is embedded directly in `layout.tsx` rather than being externally configured.
- `SENTRY_AUTH_TOKEN` is supplied to the Docker build as a BuildKit secret (`sentry_auth`) in CI, not as a build arg. See [Monitoring and Error Recovery](./modules/monitoring-and-error-recovery.md).
- No explicit `.env.production` or deployment-specific environment documentation exists in the repository.
