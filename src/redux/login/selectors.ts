import { createSelector } from "@reduxjs/toolkit";

import { ReducersState } from "@/redux/store/configureStore";

const getBaseState = (state: ReducersState) => state.login;

export const selectUserInfo = createSelector([getBaseState], (auth) => auth.session.user_info);

export const selectIsLoading = createSelector([getBaseState], (auth) => auth.isLoading);

export const selectIsStaff = createSelector([getBaseState], (auth) => auth.session.user_info?.is_staff ?? false);

// `currentUser` is absent from state rehydrated by redux-persist, hence the nullish fallback.
export const selectCurrentUser = createSelector([getBaseState], (auth) => auth.currentUser ?? null);

export const selectIsAuthenticated = createSelector([selectCurrentUser], (user) => user !== null);

export const selectUserRole = createSelector([selectCurrentUser], (user) => user?.role ?? null);
