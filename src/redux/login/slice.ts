import { createSlice } from "@reduxjs/toolkit";

import { LoginResponse } from "@/models/Auth";

import { loginApi } from "./apiSlice";

export type LoginState = {
  session: LoginResponse;
  error: string | null;
  isLoading: boolean;
};

const initialState: LoginState = {
  session: {
    refresh: null,
    access: null,
    user_info: {
      avatar: null,
      first_name: null,
      full_name: null,
      last_name: null,
    },
  },
  error: null,
  isLoading: false,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(loginApi.endpoints.login.matchFulfilled, (state, action) => {
      state.session = action.payload;
    });
  },
});

export const loginActions = loginSlice.actions;

const loginReducer = loginSlice.reducer;

export default loginReducer;
