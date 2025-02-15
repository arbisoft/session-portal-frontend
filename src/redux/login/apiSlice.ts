import { login } from "@/endpoints";
import { LoginResponse, LoginParams } from "@/models/Auth";
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
  }),
});

export const { useLoginMutation } = loginApi;
