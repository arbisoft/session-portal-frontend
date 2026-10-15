# Monitoring and Error Recovery Module

## Responsibility

Reports runtime errors and performance data to Sentry, shows fallback UI when rendering fails, and recovers automatically when a stale browser tab requests a JavaScript chunk that no longer exists after a deploy.

## Where It Lives

| Concern                                     | File                                                          |
| ------------------------------------------- | ------------------------------------------------------------- |
| Server (Node.js) Sentry init                | `sentry.server.config.ts`                                     |
| Edge Sentry init                            | `sentry.edge.config.ts`                                       |
| Runtime selection + server error hook       | `src/instrumentation.ts`                                      |
| Browser Sentry init + global chunk handlers | `src/instrumentation-client.ts`                               |
| Build-time source map upload                | `next.config.ts` (`withSentryConfig`, skipped in development) |
| Route error boundary                        | `src/app/error.tsx`                                           |
| Root error boundary                         | `src/app/global-error.tsx`                                    |
| 404 page                                    | `src/app/not-found.tsx`                                       |
| Stale-chunk recovery                        | `src/utils/chunkLoadRecovery.ts`                              |
| API proxy error capture                     | `src/app/bff/[...path]/route.ts`                              |
| Unparseable API response capture            | `src/redux/customBaseQuery.ts`                                |
| Unreadable upload response capture          | `src/hooks/useVideoUpload.ts`                                 |
| Reporting helpers and request scrubber      | `src/utils/monitoring.ts`                                     |

## Configuration

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | all three `Sentry.init` calls | Empty DSN means nothing is sent |
| `SENTRY_ORG` | `next.config.ts` | Needed at build time for source map upload |
| `SENTRY_PROJECT` | `next.config.ts` | Needed at build time for source map upload |
| `SENTRY_AUTH_TOKEN` | Sentry build plugin (build-time only) | Secret. Never commit it. In Docker it is passed as a build secret (`sentry_auth`) |

All three are read through `src/constants/constants.ts`.

## How It Works

### Sentry initialization

- Traces sample rate is `0.1` in production and `1` otherwise. `enableLogs` and `sendDefaultPii` are on.
- The browser config also enables Session Replay: `replaysSessionSampleRate: 0.1` and `replaysOnErrorSampleRate: 1.0`.
- `src/instrumentation.ts` loads the server or edge config depending on `NEXT_RUNTIME`.
- `onRequestError` forwards server errors to Sentry **except** Next.js control-flow errors. `redirect()` and `notFound()` throw errors whose `digest` starts with `NEXT_REDIRECT;` or equals `NEXT_NOT_FOUND`; these are dropped so they do not show up as issues.
- `next.config.ts` wraps the config with `withSentryConfig` only when `NODE_ENV` is not `development`, so local dev never uploads source maps.

### Handled errors captured explicitly

Errors that the code catches and turns into a response or a toast never reach `onRequestError` or an error boundary, so these places report them to Sentry directly. None of them include the query string, tokens or response bodies. Code under `src/redux` and `src/hooks` reports through `reportHandledError` / `reportHandledMessage` in `src/utils/monitoring.ts` instead of importing `@sentry/nextjs` itself.

`sendDefaultPii` is `true`, so the SDK attaches the incoming request to server events. `sentry.server.config.ts` and `sentry.edge.config.ts` therefore pass `scrubRequestData` as both `beforeSend` and `beforeSendTransaction` (traces carry the same request data), which drops the `Cookie` / `Authorization` headers (the BFF request carries the HttpOnly access token), parsed cookies, the query string and the request body.

- **BFF proxy** (`src/app/bff/[...path]/route.ts`, via the `monitoring.ts` helpers): a failed upstream `fetch` is captured as an exception before the proxy returns `502`, and any upstream `5xx` is captured as a message (`method`, `path` and `status` only). Because both RTK Query calls and XHR uploads go through the proxy, this is the single place that sees backend `5xx` responses.
- **`customBaseQuery`**: a `PARSING_ERROR` (for example an HTML error page from a gateway in front of the app) is captured with the endpoint path. Ordinary `4xx` and `5xx` statuses are not captured here, to avoid duplicating the proxy report.
- **`useVideoUpload`**: a `201` response whose body is not valid JSON is captured, since it would otherwise only show the user a generic error.

### Error boundaries

- `src/app/error.tsx` (client component) catches render errors in a route segment. It calls `Sentry.captureException`, runs chunk-load recovery, and shows an `EmptyState` with **Go back** (`router.back()`) and **Reload** (`reset()`).
- `src/app/global-error.tsx` catches errors in the root layout, reports them to Sentry, and renders the default Next.js error page.
- `src/app/not-found.tsx` shows a "Page not found" `EmptyState` with a button back to `/videos`.

### Stale chunk recovery

A tab opened before a deploy may request a chunk hash the server no longer has. Re-rendering does not refetch the build manifest, so a hard reload is required.

1. `isChunkLoadError(error)` matches `Failed to load chunk`, `ChunkLoadError`, or `error.name === "ChunkLoadError"`.
2. `recoverFromChunkLoadError(error)` reloads the page **once per browser session**. It records `chunk-load-error-reloaded` in `sessionStorage` before reloading, so a broken deploy cannot cause a reload loop. It returns `true` if it reloaded.
3. It is called from `error.tsx` and, for failures that happen outside React's render tree (for example a route prefetch `import()`), from `window` `unhandledrejection` and `error` listeners in `src/instrumentation-client.ts`.

## Edge Cases

- If `sessionStorage` already holds the flag, a second chunk error is reported but no reload happens.
- Only `Error` instances are passed to recovery from the global listeners; other rejection reasons are ignored.
- Sentry stays inert when `NEXT_PUBLIC_SENTRY_DSN` is empty (for example a fresh `.env.local`).

## Tests

`src/instrumentation.test.ts`, `src/instrumentation-client.test.ts`, `src/instrumentation-client.production.test.ts`, `src/app/error.test.tsx`, `src/utils/chunkLoadRecovery.test.ts`, `src/utils/monitoring.test.ts`, and the capture assertions in `src/app/bff/[...path]/route.test.ts`, `src/redux/customBaseQuery.test.ts` and `src/hooks/useVideoUpload.test.tsx`. `global-error.tsx` and `not-found.tsx` have no dedicated test file.
