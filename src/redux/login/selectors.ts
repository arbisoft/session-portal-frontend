import { createSelector } from "@reduxjs/toolkit";

import { ReducersState } from "@/redux/store/configureStore";

const getBaseState = (state: ReducersState) => state.login;

export const selectUserInfo = createSelector([getBaseState], (auth) => auth.session.user_info);

export const selectIsLoading = createSelector([getBaseState], (auth) => auth.isLoading);
