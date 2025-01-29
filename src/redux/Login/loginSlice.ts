import { login } from "@/endpoints";

import { baseApi } from "../baseApi";
import { LoginResponse, LoginParams } from "@/models/Auth";

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
