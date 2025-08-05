import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { notificationManager } from "@/components/Notification";
import { BASE_URL } from "@/constants/constants";

import { selectAccessToken } from "./login/selectors";
import { parseError } from "./parseError";
import { ReducersState } from "./store/configureStore";

const HOST_URL = BASE_URL + "/api/v1";

interface ExtraOptions {
  showErrorToast?: boolean;
}

const baseQuery = fetchBaseQuery({
  baseUrl: HOST_URL,
  prepareHeaders: (headers, api) => {
    const token = selectAccessToken(api.getState() as ReducersState);

    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const customBaseQuery: BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError, ExtraOptions> = async (args, api, extraOptions) => {
  const options = { showErrorToast: true, ...extraOptions };
  const result = await baseQuery(args, api, options);

  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch({ type: "login/logout" });
    }

    if (options.showErrorToast) {
      const errors = parseError(result.error.data, result.error.status);
      notificationManager.showNotification({ message: errors[0].message, severity: "error" });
    }
  }

  return result;
};

export default customBaseQuery;
