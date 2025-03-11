"use client";

import { configureStore } from "@reduxjs/toolkit";
import type { Action, Reducer } from "redux";
import { persistStore, REHYDRATE, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, persistCombineReducers } from "redux-persist";
import { PersistPartial } from "redux-persist/es/persistReducer";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import createFilter from "redux-persist-transform-filter";

import { baseApi, REDUCER_PATH } from "@/redux/baseApi";
import loginReducer, { loginActions, LoginState } from "@/redux/login/slice";

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

const combinedReducers = persistCombineReducers<ReducersState, Action>(persistConfig, {
  login: loginReducer,
  [baseApi?.reducerPath]: baseApi?.reducer,
});

const rootReducer = (state: (ReducersState & PersistPartial) | undefined, action: Action) => {
  if (action.type === loginActions.logout.type) {
    return combinedReducers(undefined, action);
  }
  return combinedReducers(state, action);
};

const store = configureStore({
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([baseApi.middleware]),
  reducer: rootReducer,
  // @ts-ignore
  preloadedState: global.preloadedState,
});

const persistor = persistStore(store);

export { store, persistor };
