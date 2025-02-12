import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { selectAccessToken } from "./login/selectors";
import { parseError } from "./parseError";
import { persistor, store } from "./store/configureStore";

const HOST_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1";

interface ExtraOptions {
  showErrorToast?: boolean;
}

const baseQuery = fetchBaseQuery({
  baseUrl: HOST_URL,
  prepareHeaders: (headers) => {
    const token = selectAccessToken(store.getState());

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
      api.dispatch({ type: "auth/logout" });
      await persistor.purge();
      persistor.persist();
    }

    if (options.showErrorToast) {
      // TODO: use notification here for network error from this PR #23
      console.error(parseError(result.error.data, result.error.status));
    }
  }

  return result;
};

export default customBaseQuery;
