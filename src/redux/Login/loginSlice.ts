import { login } from "@/endpoints";
import { LoginResponse, LoginParams } from "@/models/Auth";

import { baseApi } from "../baseApi";

export const proposalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    proposals: builder.mutation<LoginResponse, LoginParams>({
      query: ({ auth_token }) => ({
        url: login.login,
        method: "POST",
        body: { auth_token },
      }),
    }),
  }),
});

export const { useProposalsMutation } = proposalsApi;
