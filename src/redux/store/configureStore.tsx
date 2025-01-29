"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { baseApi } from "../baseApi";

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
});

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([baseApi.middleware]),
  reducer: rootReducer,
});

export { store };
