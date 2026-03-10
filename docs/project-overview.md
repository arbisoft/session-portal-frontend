# Project Overview

## Summary

`session-portal-frontend` is a Next.js frontend for a session and video portal branded as **Sessions Portal** / **Arbisoft Sessions Portal** in the codebase. It focuses on authenticated access to session videos, browsing video listings, search, recommendations, and a video detail experience.

## Purpose Observed in the Codebase

The repository implements a web application that includes:

- Google OAuth-based sign-in
- A protected video browsing experience
- Session listing and search pages
- Individual video detail pages with recommendations
- Featured content on the videos page
- Upload-related UI for video submission
- Notification, theming, and responsive navigation support

## Current Technology Stack

| Area | Technologies found |
| --- | --- |
| Framework | Next.js 15.5.6 |
| UI | React 19.1.0, Material UI 7.3.4, Emotion |
| Language | TypeScript 5.9.3 |
| State | Redux Toolkit, RTK Query, redux-persist |
| Forms | react-hook-form, yup, @hookform/resolvers |
| Media/UI helpers | @vidstack/react, swiper, react-virtuoso |
| Authentication | @react-oauth/google |
| Testing | Jest, React Testing Library, Playwright |
| Component development | Storybook |
| Release automation | release-it, conventional changelog |
| Quality gates | ESLint, CommitLint, Husky, TypeScript strict mode |
| Containerization | Docker, docker-compose |

## Version Presentation Notes

The root `README.md` badges currently show older version numbers than the installed dependencies declared in `package.json`.

- `README.md` is useful for quick navigation and onboarding.
- `package.json` is the more reliable source for current dependency versions.

## Runtime Requirements

From `package.json`:

- Node.js: `>=22.0.0 <23.0.0`
- npm: `>=10.2.4`

## Application Capabilities Seen in Source

| Capability | Evidence |
| --- | --- |
| Auth redirect handling | `src/hooks/useAuth.ts` |
| Video listing with filters and infinite loading | `src/features/VideosListingPage/videosListingPage.tsx` |
| Search results page | `src/features/SearchResultsPage/searchResultsPage.tsx` |
| Video detail with recommendations | `src/features/VideoDetail/videoDetail.tsx` |
| Theme provider and color scheme initialization | `src/components/theme/` |
| Notification system | `src/components/Notification/notification.tsx` |
| Feature flags | `src/constants/featureFlags.ts`, `src/hooks/useFeatureFlags.ts` |
| Upload flow UI | `src/app/upload-video/page.tsx`, `src/features/UploadVideo/uploadVideo.tsx` |

## What Is Not Fully Documented in the Repository

The following areas are only partially inferable from the frontend code and should be clarified later if needed:

- Backend API contract details
- Authentication backend behavior after Google login
- Actual upload submission backend flow
- Production hosting platform and CI/CD workflow details
- Database schema or persistence model behind sessions/videos
