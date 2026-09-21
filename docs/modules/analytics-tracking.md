# Analytics Tracking Module

## Responsibility

Pushes structured Google Analytics events to the Google Tag Manager (GTM) `dataLayer` for core user interactions. Tag configuration lives in GTM; this module only emits events.

## Where It Lives

- `src/utils/analytics.ts` — `trackEvent`, `GA_EVENTS`, `ANALYTICS_CATEGORY`, `AnalyticsEventParams`
- GTM is loaded in `src/app/layout.tsx` via `<GoogleTagManager gtmId={GTM_ID} />` (`NEXT_PUBLIC_GTM_ID`). Hotjar is embedded separately in the same file.
- `.claude/agents/ga-event-tracker.md` — agent that instruments new interactions (see `CLAUDE.md`)

## API

```ts
trackEvent(event: string, category: AnalyticsCategory, params?: AnalyticsEventParams): void
```

- Does nothing on the server (`typeof window === "undefined"`).
- Calls `sendGTMEvent({ event, event_category: category, ...params })`.
- `params` values must be `string | number | boolean | undefined`.

Event names are `lower_snake_case` constants in `GA_EVENTS`. Categories are in `ANALYTICS_CATEGORY`: `auth`, `navigation`, `sidebar`, `videos_listing`, `search`, `video_card`, `video_player`, `recommendations`.

## Event Catalog and Call Sites

| Area | Events (`GA_EVENTS`) | Source |
| --- | --- | --- |
| Auth | `LOGIN_CLICK`, `LOGIN_SUCCESS` (`login`), `LOGIN_FAILED` | `src/features/LoginPage/loginPage.tsx` |
| Navbar | `LOGOUT`, `NAV_LOGO_CLICK`, `NAV_DRAWER_TOGGLE`, `NAV_UPLOAD_VIDEO_CLICK`, `SEARCH_SUBMIT`, `SEARCH_CLEAR` | `src/components/Navbar/navbar.tsx` |
| Theme | `THEME_TOGGLE` | `src/components/ThemeToggle/themeToggle.tsx` |
| Sidebar | `SIDEBAR_PLAYLIST_SELECT`, `TAG_SELECT` | `src/components/Sidebar/sidebar.tsx` |
| Videos listing | `VIDEO_SORT_CHANGE`, `VIDEO_FILTER_YEAR`, `VIDEO_FILTER_CLEAR`, `VIDEOS_LOAD_MORE`, `VIDEOS_RETRY_CLICK` | `DateFilterDropdown.tsx`, `videosListingPage.tsx` |
| Search results | `SEARCH_RESULTS_VIEW`, `SEARCH_LOAD_MORE` | `src/features/SearchResultsPage/searchResultsPage.tsx` |
| Video card / slider | `VIDEO_CARD_CLICK`, `FEATURED_SLIDER_NAVIGATE` | `videoCard.tsx`, `featuredSlider.tsx` |
| Video player | `VIDEO_PLAY`, `VIDEO_PAUSE`, `VIDEO_SEEK`, `VIDEO_VOLUME_CHANGE`, `VIDEO_FULLSCREEN_CHANGE`, `VIDEO_PLAYBACK_RATE_CHANGE`, `VIDEO_COMPLETE`, `VIDEO_PLAY_ERROR` | `src/components/VideoPlayer/videoPlayer.tsx` |
| Video detail | `TAG_SELECT`, `RECOMMENDATIONS_LOAD_MORE` | `src/features/VideoDetail/videoDetail.tsx` |

`src/utils/analytics.ts` is the source of truth for names; params sent with each event are defined at the call sites.

## Adding a New Event

1. Add a `lower_snake_case` entry to `GA_EVENTS` (and a category to `ANALYTICS_CATEGORY` only if none fits).
2. Call `trackEvent(GA_EVENTS.X, ANALYTICS_CATEGORY.Y, { ...params })` in the interaction handler.
3. Mock `@/utils/analytics` in the component test and assert the call. The repo's 80% coverage gate applies.
4. Per `CLAUDE.md`, run the `ga-event-tracker` agent for any new or changed user-facing interaction.

## Edge Cases

- If `NEXT_PUBLIC_GTM_ID` is empty, events still push to `dataLayer` but no GTM container consumes them.
- Events are client-only; nothing is sent from server components.
