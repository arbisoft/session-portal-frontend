/* c8 ignore next */
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
export const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
export const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID ?? "6412285";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
// Member access (not destructuring) so Next inlines it in client bundles.
// eslint-disable-next-line prefer-destructuring
export const NODE_ENV = process.env.NODE_ENV;
export const CI = process.env.CI ?? "";
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
export const SENTRY_ORG = process.env.SENTRY_ORG || "";
export const SENTRY_PROJECT = process.env.SENTRY_PROJECT || "";

export const DEFAULT_THUMBNAIL = "/assets/images/temp-youtube-logo.webp";
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_LANGUAGE_DIR = "ltr";
export const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
export const REDIRECT_TO_KEY = "redirect_to";
export const ACCESS_COOKIE_NAME = "access";
export const API_PROXY_PREFIX = "/bff";
export const ALLOWED_IMAGE_HOSTS = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "").split(",").filter(Boolean);
export const API_PROXY_GUARD_HEADER = "x-requested-with";
export const API_PROXY_GUARD_VALUE = "session-portal";
