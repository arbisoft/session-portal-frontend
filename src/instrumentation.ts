import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// redirect()/notFound() throw digest-tagged errors as expected Next.js control flow, not real errors.
// @sentry/nextjs's captureRequestError does not filter these out itself, so we do it here.
function isNextNavigationError(error: unknown): boolean {
  const digest = (error as { digest?: unknown })?.digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT;") || digest === "NEXT_NOT_FOUND");
}

export const onRequestError: typeof Sentry.captureRequestError = (error, request, context) => {
  if (isNextNavigationError(error)) {
    return;
  }

  return Sentry.captureRequestError(error, request, context);
};
