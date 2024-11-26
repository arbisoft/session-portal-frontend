import { User } from "@/types/user";
import { apiClient } from "./apiClient";

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get(
    process.env.NEXT_PUBLIC_GET_CURRENT_USER_PATH || ""
  );
  return response.data;
}
