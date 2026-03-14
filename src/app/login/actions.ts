"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BASE_URL } from "@/constants/constants";
import { LoginResponse } from "@/models/Auth";

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

    // Decode JWT to get expiry
    let maxAge = 60 * 60 * 24 * 7; // default 7 days
    try {
      const payload = data.access.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      const currentTime = Math.floor(Date.now() / 1000);
      maxAge = decodedPayload.exp - currentTime;
      // Ensure minimum 1 hour
      maxAge = Math.max(maxAge, 60 * 60);
    } catch {
      // If decoding fails, use default
    }

    // Set HttpOnly cookie with the access token
    const cookieStore = await cookies();
    cookieStore.set("access", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });
    // Return the full response data for client-side localStorage storage
    return data;
  } catch {
    throw new Error("Authentication failed");
  }
}

// Server action for logout - clears auth cookie
export async function logoutAndClearCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("access");

  // Redirect to login page
  redirect("/login");
}
