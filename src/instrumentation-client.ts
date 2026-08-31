import * as Sentry from "@sentry/nextjs";

import { SENTRY_DSN } from "@/constants/constants";
import { recoverFromChunkLoadError } from "@/utils/chunkLoadRecovery";

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Chunk load failures from a dynamic import() (e.g. route prefetch) reject outside
// React's render tree, so they never reach error.tsx's boundary — only the global
// handlers below see them. Sentry's GlobalHandlers integration still reports them.
function handleChunkLoadRejection(reason: unknown) {
  if (reason instanceof Error) {
    recoverFromChunkLoadError(reason);
  }
}

window.addEventListener("unhandledrejection", (event) => handleChunkLoadRejection(event.reason));
window.addEventListener("error", (event) => handleChunkLoadRejection(event.error));
