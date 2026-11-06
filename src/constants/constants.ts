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
// Some browsers/OSes report an empty MIME type for valid videos (e.g. .mov), so the extension is the fallback.
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".webm"];
export const THUMBNAIL_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const THUMBNAIL_MAX_BYTES = 5 * 1024 ** 2;
export const THUMBNAIL_MAX_LABEL = "5MB";
export const TITLE_MAX_LENGTH = 255;
export const TAG_MAX_LENGTH = 100;
// Must match the backend RESUMABLE_UPLOAD_MAX_FILE_BYTES.
export const MAX_VIDEO_FILE_SIZE_BYTES = 20 * 1024 ** 3;
export const MAX_VIDEO_FILE_SIZE_LABEL = "20GB";
export const UPLOAD_STORAGE_KEY = "upload-video:session:v1";
export const UPLOAD_MAX_CONSECUTIVE_RETRIES = 8;
export const UPLOAD_RETRY_BASE_DELAY_MS = 1000;
export const UPLOAD_RETRY_MAX_DELAY_MS = 30_000;
export const UPLOAD_RETRY_AFTER_CAP_MS = 5 * 60_000;
export const UPLOAD_FINALIZE_POLL_MIN_MS = 2000;
export const UPLOAD_FINALIZE_POLL_MAX_MS = 10_000;
export const UPLOAD_FINALIZE_NUDGE_AFTER_MS = 90_000;
export const REDIRECT_TO_KEY = "redirect_to";
// Fail closed: every route requires authentication unless listed here (see src/proxy.ts).
export const PUBLIC_ROUTES = ["/login"];
export const ACCESS_COOKIE_NAME = "access";
export const API_PROXY_PREFIX = "/bff";
export const ALLOWED_IMAGE_HOSTS = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "").split(",").filter(Boolean);
export const API_PROXY_GUARD_HEADER = "x-requested-with";
export const API_PROXY_GUARD_VALUE = "session-portal";
