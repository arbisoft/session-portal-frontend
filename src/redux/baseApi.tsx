import { createApi } from "@reduxjs/toolkit/query/react";

import customBaseQuery from "./customBaseQuery";

export const REDUCER_PATH = "api";

export const tagTypes = [] as const; // TODO: will add tags here

export const baseApi = createApi({
  reducerPath: REDUCER_PATH,
  baseQuery: customBaseQuery,
  tagTypes,
  endpoints: () => ({}),
});
