# Feature Flags Module

## Responsibility

Controls whether in-development or version-gated features are visible to users. Supports URL-based overrides for local testing without changing config files.

## Where It Lives

| Concern          | File                            |
| ---------------- | ------------------------------- |
| Flag definitions | `src/constants/featureFlags.ts` |
| Hook             | `src/hooks/useFeatureFlags.ts`  |

## Current Flags

Defined in `src/constants/featureFlags.ts`:

| Flag               | `enabled` | `minVersion` | Purpose                                  |
| ------------------ | --------- | ------------ | ---------------------------------------- |
| `darkModeSwitcher` | `false`   | `1.2.0`      | Shows the theme toggle on the login page |

The flag is currently disabled regardless of version. The upload video UI is no longer behind a flag; it is gated by the user's `is_staff` flag. A flag is only active when `enabled: true` AND `package.json` version `>= minVersion`.

## How It Works

### Resolution Logic (`getFeatureFlags`)

```
1. Check URL param: ?featureName=true  → force enable
2. Check URL param: ?featureName=false → force disable
3. Check config: enabled && semver.gte(packageVersion, minVersion)
```

URL params take full precedence over config. The semver check uses the `semver` package's `gte` function against `packageFile.version`.

### Hook Usage

```ts
const { isFeatureEnabled } = useFeatureFlags();
const isDarkModeVisible = isFeatureEnabled("darkModeSwitcher");
```

`useFeatureFlags` reads `useSearchParams()` from Next.js and passes the entries into `getFeatureFlags`. This means the flag check is reactive to URL changes but does NOT require a page reload.

### URL Override (Dev Tool)

Append the flag name as a query parameter to any page to override it for that session:

```
/videos?darkModeSwitcher=true
```

The override lasts only for the current page load. Navigating away or refreshing without the param returns to the config value.

`getFeatureFlags` is also exported as a standalone function (not just through the hook) for use in non-React contexts or server-side checks.

## Where Flags Are Consumed

| Flag               | Consumer    | Effect                                                        |
| ------------------ | ----------- | ------------------------------------------------------------- |
| `darkModeSwitcher` | `LoginPage` | Conditionally renders `<ThemeToggle>` in the top-right corner |

## Adding a New Flag

1. Add an entry to `FEATURE_FLAGS` in `src/constants/featureFlags.ts`:
   ```ts
   myFeature: {
     enabled: false,
     minVersion: "1.4.0",
   }
   ```
2. Use `isFeatureEnabled("myFeature")` in the component.
3. Set `enabled: true` and bump `minVersion` when ready to ship.
