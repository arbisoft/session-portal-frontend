import { createSlice } from "@reduxjs/toolkit";

import { LoginResponse } from "@/models/Auth";

import { logout } from "./actions";
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
    login: (state, action) => {
      state.session = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
    builder.addMatcher(loginApi?.endpoints?.login?.matchFulfilled, (state, action) => {
      state.session = action.payload;
    });
  },
});

export const loginActions = { ...loginSlice.actions, logout };

const loginReducer = loginSlice.reducer;

export default loginReducer;
