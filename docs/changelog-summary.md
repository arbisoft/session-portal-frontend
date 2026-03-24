# Changelog Summary

## Source

This summary is based on `CHANGELOG.md` currently present in the repository.

The root `README.md` also links to `CHANGELOG.md`, so it is now part of the primary documentation path for the repository.

## Current Documented Release

### `1.2.0` — `2025-11-20`

Key themes visible in the changelog:

- automated deployment trigger added to build workflow
- playlist/tag menu responsiveness improvements
- post-login redirect to video page
- homepage links opening videos in a new tab
- empty and retry states for sessions
- video hover preview
- video list rendering optimization
- accessibility improvements across navigation, filters, cards, and sidebar
- mobile filter/sort alignment fixes
- presenter name formatting fix
- Picture-in-Picture navigation fix
- sticky sidebar and full-height layout work
- dependency upgrades including Next.js 15 and React 19
- Docker image optimization

## Changelog Conventions

Release notes are generated using `release-it` with `@release-it/conventional-changelog`.

Configured changelog sections in `package.json` include:

- Features
- Bug Fixes
- Performance Improvements
- Reverts
- Documentation
- Code Refactoring
- Tests
- Continuous Integration

## Versioning Notes

- Current `package.json` version is `1.2.0`.
- The latest `CHANGELOG.md` release is also `1.2.0`, so package metadata and changelog are aligned.
- Feature flags also reference version thresholds, e.g. `1.2.0` and `1.3.0` in `src/constants/featureFlags.ts`.

## Observation

The changelog currently exposes a useful high-level history of product and engineering priorities, especially around UX, accessibility, performance, and infrastructure.
