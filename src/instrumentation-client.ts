import * as Sentry from "@sentry/nextjs";

import { SENTRY_DSN } from "@/constants/constants";

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
