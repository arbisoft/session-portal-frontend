import { apiClient } from "./apiClient";

export const verifyGoogleToken = async (googleToken: string) => {
  try {
    const response = await apiClient.post(
      process.env.NEXT_PUBLIC_AUTH_API_PATH || "",
      {
        token: googleToken,
      }
    );
    if (response.status === 200 && response.data.user) {
      return response.data.user;
    } else {
      throw new Error("Invalid token or user not found");
    }
  } catch (error) {
    throw new Error("Authentication failed");
  }
};
