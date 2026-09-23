# Changelog

## [1.3.7](https://github.com/arbisoft/session-portal-frontend/compare/1.3.6...v1.3.7) (2026-09-23)

### Features

* **api:** proxy API calls through BFF and keep auth token server-side ([f14022d](https://github.com/arbisoft/session-portal-frontend/commit/f14022d10f7f66e2e558d25e7f30a2e63a175a10))
* **build:** add security headers and restrict image hosts ([41edc9b](https://github.com/arbisoft/session-portal-frontend/commit/41edc9b3eeefd6a7b54b0d3083167cc5b7233a72))

### Bug Fixes

* **test:** restore correct theme snapshot lost during dev rebase merge ([c1c714b](https://github.com/arbisoft/session-portal-frontend/commit/c1c714b93452011ff08354af825cec1a7fc86084))

### Documentation

* **claude:** add architecture-guardian agent and refresh skills ([eb59af2](https://github.com/arbisoft/session-portal-frontend/commit/eb59af2f6980b945cbf64f6096f638e23807278f))
* correct stale module documentation to match current behavior ([29a0d78](https://github.com/arbisoft/session-portal-frontend/commit/29a0d785a77a4f8c6a3320283ae317275da8683d))
* **docs:** add project reference and contribution documentation ([b683c52](https://github.com/arbisoft/session-portal-frontend/commit/b683c52b84bd2a254105e1739287d6bfddadcec2))
* refresh project documentation and changelog ([3078815](https://github.com/arbisoft/session-portal-frontend/commit/30788152e53d8030d9ef918c46a3503024d9c972))

### Code Refactoring

* **auth:** implement secure server-side authentication using middleware and server actions ([6461e3e](https://github.com/arbisoft/session-portal-frontend/commit/6461e3ec3ff04197271c58e5a320a472462caa2a))

### Tests

* raise coverage for layout, monitoring and analytics ([c9c7056](https://github.com/arbisoft/session-portal-frontend/commit/c9c70562cd57bb025648aaaea58ab60f0fc168d2))

### Continuous Integration

* update build workflow ([b046711](https://github.com/arbisoft/session-portal-frontend/commit/b0467116fc5b44d4957a68905563fbb2b7d8b496))

Release PR: [#181](https://github.com/arbisoft/session-portal-frontend/pull/181)

## 1.3.6 (2026-09-14)

- feat(analytics): [ASP-319] instrument GA event tracking across core user interactions ([7530418](https://github.com/arbisoft/session-portal-frontend/commit/7530418))
- ci(sonar): [ASP-297] integrate SonarQube static analysis into CI build ([312b949](https://github.com/arbisoft/session-portal-frontend/commit/312b949))
- Release PR: [#177](https://github.com/arbisoft/session-portal-frontend/pull/177)

## 1.3.5 (2026-09-07)

- fix(login): validate access token and preserve original error cause ([a4699ad](https://github.com/arbisoft/session-portal-frontend/commit/a4699ad))
- fix(monitoring): filter Next.js navigation errors from Sentry reports ([9bc5cad](https://github.com/arbisoft/session-portal-frontend/commit/9bc5cad))
- fix(app): recover from stale chunk load errors after deploy ([3dac263](https://github.com/arbisoft/session-portal-frontend/commit/3dac263))
- chore(claude): restructure code-review skill and add task-generator ([3d610a3](https://github.com/arbisoft/session-portal-frontend/commit/3d610a3))
- Release PR: [#173](https://github.com/arbisoft/session-portal-frontend/pull/173)

## 1.3.4 (2026-07-02)

- fix(docker): include next.config.ts in build context ([f64b7b8](https://github.com/arbisoft/session-portal-frontend/commit/f64b7b8))
- Release PR: [#171](https://github.com/arbisoft/session-portal-frontend/pull/171)

## 1.3.3 (2026-07-02)

- fix(docker): include root-level sentry configs in build context ([0fa148b](https://github.com/arbisoft/session-portal-frontend/commit/0fa148b))
- Release PR: [#170](https://github.com/arbisoft/session-portal-frontend/pull/170)

## 1.3.2 (2026-07-02)

- feat(monitoring): [ASP-274] integrate Sentry for error tracking and session replay ([578d5b5](https://github.com/arbisoft/session-portal-frontend/commit/578d5b5))
- feat(app): [ASP-275] add error boundary and not-found pages ([66fb084](https://github.com/arbisoft/session-portal-frontend/commit/66fb084))
- fix(filters): [ASP-167] add aria heading roles to sort and filter section labels ([204aa3c](https://github.com/arbisoft/session-portal-frontend/commit/204aa3c))
- fix(login): [ASP-161] move try/catch inside startTransition and use notificationManager ([b271844](https://github.com/arbisoft/session-portal-frontend/commit/b271844))
- ci(sentry): wire build-time vars into image build ([99e39ce](https://github.com/arbisoft/session-portal-frontend/commit/99e39ce))
- docs(tooling): [ASP-273] add CLAUDE.md, migrate skills to .claude, and overhaul project docs ([1fcb0b3](https://github.com/arbisoft/session-portal-frontend/commit/1fcb0b3))
- Release PR: [#169](https://github.com/arbisoft/session-portal-frontend/pull/169)

## 1.3.1 (2026-04-22)

- chore(release): add release workflow, update docs, RTK tags, UI perf improvements ([3dc6a7c](https://github.com/arbisoft/session-portal-frontend/commit/3dc6a7c))
- Release PR: [#159](https://github.com/arbisoft/session-portal-frontend/pull/159)

## 1.3.0 (2026-03-24)

- feat(videos): [255,283,284] add routing, loading optimization and responsive layout fixes ([d4b55e7](https://github.com/arbisoft/session-portal-frontend/commit/d4b55e7))
- refactor(auth): implement secure server-side authentication using middleware and server actions ([4873198](https://github.com/arbisoft/session-portal-frontend/commit/4873198))
- docs(docs): add project reference and contribution documentation ([8fec8e2](https://github.com/arbisoft/session-portal-frontend/commit/8fec8e2))
- Release PR: [#157](https://github.com/arbisoft/session-portal-frontend/pull/157)

## 1.2.0 (2025-11-20)

- feat: add automated deployment trigger to build workflow ([cd19fe8](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/cd19fe8))
- feat: keep playlist/tags menu fixed and responsive during browser zoom in/out ([320b860](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/320b860))
- feat(auth): redirect users to video page after successful login instead of homepage ([87479c1](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/87479c1))
- feat(homepage): open videos in new browser tab to improve user experience ([28cc966](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/28cc966))
- feat(video): implement video preview on hover for video card ([73b3fc7](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/73b3fc7))
- feat(sessions): show empty state when no sessions and retry state on request failure ([bc06ab6](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/bc06ab6))
- refactor(video-list): optimize video list rendering and remove redundant local state ([7ed73fc](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/7ed73fc))
- ui: ensure consistent font size for video title and session description ([b78de7b](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/b78de7b))
- fix: conflict with infinite scroll resolved ([c972eb5](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/c972eb5))
- fix(a11y): add accessible name to search icon button and make header link keyboard-accessible ([6aaafb3](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/6aaafb3))
- fix(a11y): allow sidebar collapse via keyboard and update drawer button aria-label on toggle ([62db630](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/62db630))
- fix(a11y): apply proper tab order to filter and sort options to ensure keyboard and screen reader ([e7a25d6](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/e7a25d6))
- fix(a11y): enable keyboard selection for playlist tabs on home and video detail pages ([e7a7b30](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/e7a7b30))
- fix(a11y): include video title, author, date, and description in keyboard tab order ([ab51131](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/ab51131))
- fix(a11y): make recommended video thumbnails keyboard-focusable ([4b2744f](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/4b2744f))
- fix(mobile-ui): align filter and sort UI for longer page titles ([e9daa19](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/e9daa19))
- fix(sessions-portal): correct presenter name formatting to preserve original casing ([20eccb4](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/20eccb4))
- fix(video): resolve Picture-in-Picture functionality issues when navigating between pages ([64d3226](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/64d3226))
- chore: make the sidebar sticky and extend layout to full-screen height ([315d41a](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/315d41a))
- chore(deps): update MUI packages to latest versions ([533d89d](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/533d89d))
- chore(deps): upgrade Next.js to v15 and React to v19 ([dedfee1](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/dedfee1))
- chore(docker): optimize frontend container image size ([8c67c9b](https://github.com/arbisoft-qaisarirfan/session-portal-frontend/commit/8c67c9b))
- Release PR: [#153](https://github.com/arbisoft/session-portal-frontend/pull/153)

## 1.1.8 (2025-08-05)

- fix: frequent logout and session expiry issues ([f510169](https://github.com/arbisoft/session-portal-frontend/commit/f510169))
- fix: ensure featured video appears on all relevant pages ([c869634](https://github.com/arbisoft/session-portal-frontend/commit/c869634))
- test: add e2e tests for VideoDetail component with Playwright ([6b818b3](https://github.com/arbisoft/session-portal-frontend/commit/6b818b3))
- feat: add featured slider component ([2001956](https://github.com/arbisoft/session-portal-frontend/commit/2001956))
- fix: search Icon on search-bar is not working ([5388dac](https://github.com/arbisoft/session-portal-frontend/commit/5388dac))
- fix: set default sorting to newest first ([b2e8ece](https://github.com/arbisoft/session-portal-frontend/commit/b2e8ece))
- fix: recommendation card overlap ([96bc37d](https://github.com/arbisoft/session-portal-frontend/commit/96bc37d))
- feat: update page titles, description formatting & set dark mode as default ([482ff4d](https://github.com/arbisoft/session-portal-frontend/commit/482ff4d))
- Enhancement: Changed github action to run based on release instead of push ([13d4d38](https://github.com/arbisoft/session-portal-frontend/commit/13d4d38))
- Release PR: [#131](https://github.com/arbisoft/session-portal-frontend/pull/131)

## 1.1.7 (2025-07-10)

- feat: lazy loading of videos
- feat: integrate Google Tag Manager (GTM)
- feat: integrate Hotjar
- feat: update page titles, description formatting & dark mode defaults
- test: add Jest unit tests for VideoPlayer component
- fix: visual flicker while scrolling through All Videos page
- fix: video filtering bugs on tag selection
- fix: skeleton loading triggers unexpected API call to page 1
- fix: infinite scroll not working on All Videos after navigating from playlist or tag
- fix: invalid page error and 404 API response when clicking playlist or tag after scrolling videos
- fix: videos not fetching correctly on scroll, only 2025 videos displayed
- Release PR: [#120](https://github.com/arbisoft/session-portal-frontend/pull/120)

## 1.1.6 (2025-06-26)

- fix: update skeleton loader for sidebar
- fix: pagination of videos
- fix: videos loading issue
- fix: remove scrollbar from right suggestion bar
- chore: remove `order_by` from search API
- Release PR: [#111](https://github.com/arbisoft/session-portal-frontend/pull/111)

## 1.1.5 (2025-06-19)

- fix: fixed header positioning on top
- fix: Login with Google stuck on "Loading..."
- fix: pagination issues
- fix: reset filter when moving from one playlist or tag to another
- fix: video description text color
- fix: make right suggestion bar scrollable at a specific height
- feat: use video slug in URL (`/videos/video-slug`) instead of numeric ID
- chore: remove sorting selector from Search Results page
- Release PR: [#104](https://github.com/arbisoft/session-portal-frontend/pull/104)

## 1.1.4 (2025-06-04)

- fix: pagination issue while changing query param
- fix: show featured video card as a normal video card under playlists and other tags
- ui: replace header logo from YouTube to Arbisoft
- ui: add "Sessions Portal" under "arbisoft" on the login screen
- ui: increase font size by 25%
- ui: rename "All" to "All videos"
- Release PR: [#101](https://github.com/arbisoft/session-portal-frontend/pull/101)

## 1.1.3 (2025-05-27)

- feat: implement basic video upload page
- feat: implement advanced video upload page UI
- feat: apply light mode across all pages
- fix: duration card placement in suggested video cards
- fix: pagination on Video Listing and Search Results pages
- fix: mixed-up styles
- Release PR: [#98](https://github.com/arbisoft/session-portal-frontend/pull/98)

## 1.1.2 (2025-05-15)

- fix: resolve broken video thumbnails on video pages
- refactor: convert font sizes from px to rem across app
- test: add Jest unit test for Notification component
- Release PR: [#95](https://github.com/arbisoft/session-portal-frontend/pull/95)

## 1.1.1 (2025-05-08)

- feat: set dark mode as default theme
- feat: update page titles and description formatting
- feat: display large play icon on video player after load
- feat: remove language from URL and handle locale via localStorage
- feat: add favicon
- chore: update test cases for route changes (removed `/en/`) and `scroll=true`
- chore: remove unused code from `middleware.ts`
- chore: update login page tab title
- Release PR: [#92](https://github.com/arbisoft/session-portal-frontend/pull/92)

## 1.1.0 (2025-04-15)

- feat: initial session portal boilerplate, login page, default layout and navbar/sidebar
- feat: custom video player, video listing page (featured cards, dropdown filters) and video detail page with tags API
- feat: reusable alert modal, button component (Storybook), recommended video card and loading shimmer
- feat: dynamic navigation hook with language support and redux-persist state retention
- test: Jest and Playwright setup with tests for featured cards, layout and sidebar
- ci: GitHub Actions linting and tests, pull request template
- chore: remove `styled-components` and TanStack Query, move to Node.js 22 LTS, fix ESLint/TypeScript issues and security vulnerabilities
- Release PR: [#82](https://github.com/arbisoft/session-portal-frontend/pull/82)
