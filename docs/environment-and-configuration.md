# Environment and Configuration

## Environment Variables Found

`example.env.local` defines the following variables explicitly:

| Variable | Present in example file | Usage observed |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Yes | API host prefix in `src/constants/constants.ts` and media URL composition |
| `NEXT_PUBLIC_CLIENT_ID` | Yes | Google OAuth provider in `src/app/layout.tsx` |
| `NEXT_PUBLIC_GTM_ID` | Yes | Google Tag Manager initialization in `src/app/layout.tsx` |

`src/app/layout.tsx` also embeds a Hotjar initialization script directly in the document head.

Additional variables are referenced elsewhere:

| Variable | Usage observed | Notes |
| --- | --- | --- |
| `CI` | `playwright.config.ts` | Controls retries, worker count, and server command |
| `NODE_ENV` | store config / Docker | Used for dev tools and production behavior |

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

`next.config.js` currently configures:

- `reactStrictMode: true`
- `compress: true`
- `productionBrowserSourceMaps: false`
- Emotion compiler support
- standalone build output (`output: "standalone"`)
- relaxed remote image host allowlist for:
  - `sessions.arbisoft.com`
  - `www.google.com`
  - `localhost`
  - `loremflickr.com`
- build-time ESLint suppression via `ignoreDuringBuilds: true`

## TypeScript Configuration

Important `tsconfig.json` settings:

| Setting | Value |
| --- | --- |
| `strict` | `true` |
| `noEmit` | `true` |
| `moduleResolution` | `bundler` |
| `jsx` | `preserve` |
| `baseUrl` | `.` |
| path alias | `@/* -> ./src/*` |

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
- The `Dockerfile` accepts `NEXT_PUBLIC_GTM_ID` as a build argument, but the builder stage does not currently export it through an `ENV NEXT_PUBLIC_GTM_ID=...` instruction.
- No explicit `.env.production` or deployment-specific environment documentation exists in the repository.
