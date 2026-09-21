import { sendGTMEvent } from "@next/third-parties/google";

export const ANALYTICS_CATEGORY = {
  AUTH: "auth",
  NAVIGATION: "navigation",
  SIDEBAR: "sidebar",
  VIDEOS_LISTING: "videos_listing",
  SEARCH: "search",
  VIDEO_CARD: "video_card",
  VIDEO_PLAYER: "video_player",
  RECOMMENDATIONS: "recommendations",
} as const;

type AnalyticsCategory = (typeof ANALYTICS_CATEGORY)[keyof typeof ANALYTICS_CATEGORY];

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

export const GA_EVENTS = {
  LOGIN_CLICK: "login_click",
  LOGIN_SUCCESS: "login",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
  NAV_LOGO_CLICK: "nav_logo_click",
  NAV_DRAWER_TOGGLE: "nav_drawer_toggle",
  NAV_UPLOAD_VIDEO_CLICK: "nav_upload_video_click",
  THEME_TOGGLE: "theme_toggle",
  SIDEBAR_PLAYLIST_SELECT: "sidebar_playlist_select",
  TAG_SELECT: "tag_select",
  VIDEO_SORT_CHANGE: "video_sort_change",
  VIDEO_FILTER_YEAR: "video_filter_year",
  VIDEO_FILTER_CLEAR: "video_filter_clear",
  VIDEOS_RETRY_CLICK: "videos_retry_click",
  VIDEOS_LOAD_MORE: "videos_load_more",
  SEARCH_SUBMIT: "search_submit",
  SEARCH_CLEAR: "search_clear",
  SEARCH_RESULTS_VIEW: "search_results_view",
  SEARCH_LOAD_MORE: "search_load_more",
  VIDEO_CARD_CLICK: "video_card_click",
  VIDEO_PLAY: "video_play",
  VIDEO_PAUSE: "video_pause",
  VIDEO_SEEK: "video_seek",
  VIDEO_VOLUME_CHANGE: "video_volume_change",
  VIDEO_FULLSCREEN_CHANGE: "video_fullscreen_change",
  VIDEO_PLAYBACK_RATE_CHANGE: "video_playback_rate_change",
  VIDEO_COMPLETE: "video_complete",
  VIDEO_PLAY_ERROR: "video_play_error",
  RECOMMENDATIONS_LOAD_MORE: "recommendations_load_more",
  FEATURED_SLIDER_NAVIGATE: "featured_slider_navigate",
} as const;

export const trackEvent = (event: string, category: AnalyticsCategory, params?: AnalyticsEventParams): void => {
  /* c8 ignore next -- SSR guard; exercised in analytics.test.ts but v8 merges its branch coverage unreliably */
  if (typeof window === "undefined") return;
  sendGTMEvent({ event, event_category: category, ...params });
};
