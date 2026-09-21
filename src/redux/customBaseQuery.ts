import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { notificationManager } from "@/components/Notification";
import { API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE, API_PROXY_PREFIX } from "@/constants/constants";

import { logout } from "./login/actions";
import { parseError } from "./parseError";

interface ExtraOptions {
  showErrorToast?: boolean;
}

// Requests go through the BFF proxy, which attaches the access token from the HttpOnly cookie.
// Browser navigations cannot set custom headers, so the proxy rejects requests that lack this marker.
const baseQuery = fetchBaseQuery({
  baseUrl: API_PROXY_PREFIX,
  prepareHeaders: (headers) => {
    headers.set(API_PROXY_GUARD_HEADER, API_PROXY_GUARD_VALUE);
    return headers;
  },
});

// The proxy route re-adds the trailing slash the backend expects; dropping it here avoids a 308 redirect.
const stripTrailingSlash = (url: string) => url.replace(/\/(?=\?|$)/, "");

const customBaseQuery: BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError, ExtraOptions> = async (args, api, extraOptions) => {
  const options = { showErrorToast: true, ...extraOptions };
  const request = { ...args, url: stripTrailingSlash(args.url) };
  const result = await baseQuery(request, api, options);

  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch(logout());
    }

    if (options.showErrorToast) {
      const errors = parseError(result.error.data, result.error.status);
      notificationManager.showNotification({ message: errors[0].message, severity: "error" });
    }
  }

  return result;
};

export default customBaseQuery;
