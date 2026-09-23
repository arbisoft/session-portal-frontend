"use server";

import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_COOKIE_NAME, BASE_URL } from "@/constants/constants";
import { LoginResponse } from "@/models/Auth";
import { getJwtExpiry } from "@/utils/utils";

// Server action for login - sets auth cookie
export async function loginAndSetCookie(formData: FormData): Promise<LoginResponse> {
  const authToken = formData.get("auth_token") as string;

  if (!authToken) {
    throw new Error("Auth token is required");
  }

  try {
    // Call the login API
    const response = await fetch(`${BASE_URL}/api/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auth_token: authToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();

    if (!data.access) {
      throw new Error("Login response did not include an access token");
    }

    // Derive cookie lifetime from the JWT expiry (minimum 1 hour, default 7 days)
    const exp = getJwtExpiry(data.access);
    const maxAge = exp === null ? 60 * 60 * 24 * 7 : Math.max(exp - Math.floor(Date.now() / 1000), 60 * 60);

    // Set HttpOnly cookie with the access token
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE_NAME, data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });
    // Tokens stay in the HttpOnly cookie; only the profile is returned to the client.
    return { ...data, access: null, refresh: null };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    // Non-Error throws (rejected fetch abort reasons, thrown strings, etc.) lose their
    // detail once collapsed to a generic message; capture the original value so Sentry
    // still shows what actually failed.
    Sentry.captureException(error, { extra: { originalError: error } });
    throw new Error("Authentication failed", { cause: error });
  }
}

// Server action for logout - clears auth cookie
export async function logoutAndClearCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE_NAME);

  // Redirect to login page
  redirect("/login");
}
