# Error Handling Module

## Responsibility

Normalizes heterogeneous API error payloads into a consistent shape, and coordinates the application response to errors (toast notification, 401 logout).

## Where It Lives

| Concern               | File                           |
| --------------------- | ------------------------------ |
| Error normalizer      | `src/redux/parseError.ts`      |
| Response interception | `src/redux/customBaseQuery.ts` |

## How It Works

### `parseError` — Normalizing API Error Payloads

The backend can return errors in many shapes. `parseError` recursively flattens them all into `ErrorType[]`:

```ts
type ErrorType = {
  statusCode: number | string;
  message: string;
  details?: Record<string, string>;
};
```

Resolution rules (in order):

| Input shape                        | Output                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Non-numeric status or 500          | `[{ statusCode, message: "Something went wrong." }]`                         |
| `string`                           | `[{ statusCode, message: string }]`                                          |
| Array                              | Recursively parsed, results flattened                                        |
| Object with `{ field, message }`   | `[{ statusCode, message: "Field: message" }]`                                |
| Object with arbitrary keys         | Each key's value recursively parsed; message prefixed with `capitalize(key)` |
| `null` / `undefined` object values | `[{ statusCode, message: "Key: unknown value" }]`                            |
| Everything else                    | `[{ statusCode, message: "Something went wrong." }]`                         |

Object keys are capitalized with `lodash/capitalize`. Nested objects and arrays of objects are unwound recursively, so deeply nested validation errors surface as flat messages.

### `customBaseQuery` — Response Interception

Every API response passes through `customBaseQuery`. On error:

1. **401 Unauthorized**: dispatches `{ type: "login/logout" }` to Redux. This resets the login slice to `initialState`, clearing tokens and user info. The user will be redirected to `/login` on the next navigation attempt (handled by middleware).

2. **Any error** (when `showErrorToast` is not explicitly set to `false`): calls `parseError(result.error.data, result.error.status)` and passes `errors[0].message` to `notificationManager.showNotification`.

The `showErrorToast` option defaults to `true` and can be set to `false` in `extraOptions` when calling an endpoint, to suppress the automatic toast for that specific call.

### Suppressing the Toast

```ts
useGetEventsQuery(params, { showErrorToast: false } as ExtraOptions);
```

No current endpoint in the codebase suppresses toasts — all errors surface automatically.

## What Is Not Handled Here

- Network errors (e.g. offline) produce a `"FETCH_ERROR"` status code. `parseError` treats non-numeric status codes as 500 and returns "Something went wrong."
- Retry logic is not implemented at the `customBaseQuery` level. Retries are left to the UI (e.g. the "Retry" button in `VideosListingPage` calls `refetch()`).
- Error boundaries are not configured in this project; unhandled render errors will crash to a blank page without a fallback UI.
