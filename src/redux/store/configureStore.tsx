"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import type { Reducer } from "redux";
import { createMigrate, persistStore, REHYDRATE, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import createFilter from "redux-persist-transform-filter";

import { NODE_ENV } from "@/constants/constants";
import { baseApi, REDUCER_PATH } from "@/redux/baseApi";
import loginReducer, { LoginState } from "@/redux/login/slice";

export const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(_key);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve(_key);
    },
  };
};

export interface ReducersState {
  [REDUCER_PATH]: (typeof baseApi)["reducer"] extends Reducer<infer T> ? T : never;
  login: LoginState;
}

/* c8 ignore next -- SSR guard; exercised in configureStore.node.test.ts but v8 merges its branch coverage unreliably */
const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

const loginFilter = createFilter("login", ["session"], ["session"]);

// v1: tokens now live only in the HttpOnly cookie; scrub any legacy tokens persisted by v0.
export const migrations = {
  1: (state: unknown) => {
    const persisted = state as { login?: { session?: Record<string, unknown> } };
    if (persisted?.login?.session) {
      persisted.login.session = { ...persisted.login.session, access: null, refresh: null };
    }
    return persisted as never;
  },
};

const persistConfig = {
  key: "session-portal",
  version: 1,
  migrate: createMigrate(migrations),
  storage,
  transforms: [loginFilter],
  whitelist: ["login"],
};

const rootReducer = combineReducers({
  login: loginReducer,
  [baseApi?.reducerPath]: baseApi?.reducer,
});
const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(persistConfig, rootReducer);
const store = configureStore({
  devTools: NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([baseApi.middleware]),
  reducer: persistedReducer,
});

const persistor = persistStore(store);

export { store, persistor };
