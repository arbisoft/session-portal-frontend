import { login, users } from "@/endpoints";
import { CurrentUser, LoginResponse, LoginParams } from "@/models/Auth";
import { baseApi } from "@/redux/baseApi";

export const loginApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginParams>({
      query: ({ auth_token }) => ({
        url: login.login,
        method: "POST",
        body: { auth_token },
      }),
    }),
    // Validates the session against the backend. Failures are handled by the auth session verifier, so no toast.
    getMe: builder.query<CurrentUser, void>({
      query: () => ({ url: users.me }),
      extraOptions: { showErrorToast: false },
    }),
  }),
});

export const { useLoginMutation, useLazyGetMeQuery } = loginApi;
