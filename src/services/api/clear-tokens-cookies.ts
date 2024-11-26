import { AxiosResponse } from "axios";
import { apiClient } from "./apiClient";

export async function clearTokenCookies(): Promise<AxiosResponse> {
  const response = await apiClient.post(
    process.env.NEXT_PUBLIC_LOGOUT_PATH || ""
  );
  return response;
}
