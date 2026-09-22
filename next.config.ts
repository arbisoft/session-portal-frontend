import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";

import { ALLOWED_IMAGE_HOSTS, BASE_URL, SENTRY_ORG, SENTRY_PROJECT } from "@/constants/constants";

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

// Only the media backend (plus optional NEXT_PUBLIC_IMAGE_HOSTS) may be proxied by the image optimizer.
const imageHostnames = [getHostname(BASE_URL), ...ALLOWED_IMAGE_HOSTS].filter((host): host is string => Boolean(host));

const nextConfig: NextConfig = {
  // Lint runs in CI and the pre-commit hook (`npm run lint`), so it is skipped during `next build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHostnames.map((hostname) => ({ hostname })),
  },
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  compiler: {
    emotion: true,
  },
  output: "standalone",
};

export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withSentryConfig(nextConfig, {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      org: SENTRY_ORG,
      project: SENTRY_PROJECT,

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      // tunnelRoute: "/monitoring",

      webpack: {
        // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,

        // Tree-shaking options for reducing bundle size
        treeshake: {
          // Automatically tree-shake Sentry logger statements to reduce bundle size
          removeDebugLogging: true,
        },
      },
    });
