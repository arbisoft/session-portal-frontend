import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";

import { ALLOWED_IMAGE_HOSTS, BASE_URL, NODE_ENV, SENTRY_ORG, SENTRY_PROJECT } from "@/constants/constants";

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

// Only the media backend (plus optional NEXT_PUBLIC_IMAGE_HOSTS) may be proxied by the image optimizer.
const imageHostnames = [getHostname(BASE_URL), ...ALLOWED_IMAGE_HOSTS].filter((host): host is string => Boolean(host));

const isDev = NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' is required by Next bootstrap scripts, GTM and Hotjar until a nonce-based CSP is adopted.
  [
    "script-src 'self' 'unsafe-inline'",
    isDev ? "'unsafe-eval'" : "",
    "https://www.googletagmanager.com https://*.hotjar.com https://accounts.google.com https://cdn.amplitude.com",
  ]
    .filter(Boolean)
    .join(" "),
  // Sentry Replay and Hotjar spawn Web Workers from blob: URLs; without this they fall back to script-src.
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://*.hotjar.com",
  [
    "connect-src 'self' https://*.sentry.io https://*.google-analytics.com https://*.googletagmanager.com",
    "https://*.hotjar.com https://*.hotjar.io wss://*.hotjar.com https://accounts.google.com https://*.amplitude.com",
  ].join(" "),
  "frame-src https://accounts.google.com https://*.hotjar.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // Report-only first: review violations before switching to the enforcing `Content-Security-Policy` header.
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Lint runs in CI and the pre-commit hook (`npm run lint`), so it is skipped during `next build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHostnames.map((hostname) => ({ hostname })),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
