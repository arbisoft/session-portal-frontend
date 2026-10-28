import * as Sentry from "@sentry/nextjs";

import { SENTRY_DSN } from "@/constants/constants";
import { scrubRequestData } from "@/utils/monitoring";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  beforeSend: scrubRequestData,
  beforeSendTransaction: scrubRequestData,
});
