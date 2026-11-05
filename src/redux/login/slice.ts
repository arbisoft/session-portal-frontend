import { createSlice } from "@reduxjs/toolkit";

import { CurrentUser, LoginResponse } from "@/models/Auth";

import { logout } from "./actions";
import { loginApi } from "./apiSlice";

export type LoginState = {
  session: LoginResponse;
  // The server-verified user from `/users/me`. Not persisted: it is only set once the backend accepted the token.
  currentUser: CurrentUser | null;
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
      is_staff: false,
    },
  },
  currentUser: null,
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
    builder.addMatcher(loginApi?.endpoints?.getMe?.matchFulfilled, (state, action) => {
      const { first_name, last_name, full_name, is_staff } = action.payload;
      state.currentUser = action.payload;
      // Keep the profile shown across the app (navbar, staff-only menus) in line with the verified user.
      state.session.user_info = { ...state.session.user_info, first_name, last_name, full_name, is_staff };
    });
  },
});

export const loginActions = { ...loginSlice.actions, logout };

const loginReducer = loginSlice.reducer;

export default loginReducer;
