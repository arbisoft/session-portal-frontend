# Notification System Module

## Responsibility

Shows ephemeral toast notifications anywhere in the app — including from outside React component trees (e.g. from RTK Query's `customBaseQuery`).

## Where It Lives

| Concern                 | File                                           |
| ----------------------- | ---------------------------------------------- |
| Manager, Provider, hook | `src/components/Notification/notification.tsx` |

## How It Works

### Two Access Paths

The system exposes two ways to trigger a notification:

1. **React hook** (`useNotification`): used inside React components.

   ```ts
   const { showNotification } = useNotification();
   showNotification({ message: "Login failed", severity: "error" });
   ```

2. **Singleton manager** (`notificationManager`): used outside React, such as in `customBaseQuery`.
   ```ts
   import { notificationManager } from "@/components/Notification";
   notificationManager.showNotification({ message: errors[0].message, severity: "error" });
   ```

Both paths call the same `NotificationManager` instance.

### `NotificationManager` (Singleton)

A plain TypeScript class that holds notification state and a list of subscriber callbacks:

```
showNotification(payload)  →  updates state  →  notifies listeners
hideNotification()         →  updates state  →  notifies listeners
subscribe(listener)        →  returns unsubscribe function
```

State shape:

```ts
{
  message: string;
  severity: AlertColor;   // "success" | "info" | "warning" | "error"
  open: boolean;
  vertical?: "top" | "bottom";     // default: "top"
  horizontal?: "left" | "center" | "right";  // default: "right"
}
```

### `NotificationProvider`

Wraps the app at the root layout level (`src/app/layout.tsx`). It:

1. Subscribes to `notificationManager` on mount
2. Calls `setState` on every notification change
3. Renders a MUI `Snackbar` (auto-hides after 3000ms) with a filled `Alert`
4. Unsubscribes on unmount

The `NotificationContext` provides the `notificationManager` instance to child components. `useNotification()` reads from this context and throws if used outside the provider.

### Severity Values

MUI `AlertColor`: `"success"` | `"info"` | `"warning"` | `"error"`.

`customBaseQuery` always uses `"error"` severity for API errors. Login failures use `"error"`. No other severities are used in the current codebase.

### Auto-Dismiss

The Snackbar closes after 3 seconds via `autoHideDuration={3000}`. The user can also close it manually via the Alert's close button, which calls `notificationManager.hideNotification()`.

## Where Notifications Are Triggered

| Trigger                               | Message                                        | Severity |
| ------------------------------------- | ---------------------------------------------- | -------- |
| Any API error (via `customBaseQuery`) | Parsed error message from `parseError`         | `error`  |
| Google login popup error              | "Authentication Error: Google login failed."   | `error`  |
| Google login — no credential received | "Google login failed: No credential received." | `error`  |
| Login server action failure           | "Login failed. Please try again."              | `error`  |
