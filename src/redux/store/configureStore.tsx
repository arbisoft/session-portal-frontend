"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import type { Reducer } from "redux";
import { persistStore, REHYDRATE, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import createFilter from "redux-persist-transform-filter";

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

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

const loginFilter = createFilter("login", ["session"], ["session"]);

const persistConfig = {
  key: "session-portal",
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
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([baseApi.middleware]),
  reducer: persistedReducer,
  // @ts-ignore
  preloadedState: global.preloadedState,
});

const persistor = persistStore(store);

export { store, persistor };
