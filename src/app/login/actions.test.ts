// Mock next/headers before importing actions
const mockCookies = {
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookies)),
}));

// Mock next/navigation before importing actions
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

import { loginAndSetCookie, logoutAndClearCookie } from "./actions";

// Get the mocked redirect function
const { redirect: mockRedirect } = jest.mocked(require("next/navigation"));

// Mock fetch globally
global.fetch = jest.fn();

const access = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
  .concat(".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE2ODQ4MzkyMjJ9")
  .concat(".signature");

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("loginAndSetCookie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.set.mockClear();
    mockCookies.delete.mockClear();
    mockRedirect.mockClear();
  });

  it("should throw error when auth_token is missing", async () => {
    const formData = new FormData();
    // No auth_token added

    await expect(loginAndSetCookie(formData)).rejects.toThrow("Auth token is required");
  });

  it("should successfully login and set cookie with valid auth token", async () => {
    const formData = new FormData();
    formData.append("auth_token", "valid_token");

    const mockResponse = {
      access,
      refresh: "refresh_token",
      user_info: {
        avatar: "avatar_url",
        first_name: "John",
        full_name: "John Doe",
        last_name: "Doe",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const result = await loginAndSetCookie(formData);

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:1234/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auth_token: "valid_token" }),
    });

    expect(mockCookies.set).toHaveBeenCalledWith("access", mockResponse.access, {
      httpOnly: true,
      secure: false, // NODE_ENV is not production in test
      sameSite: "strict",
      path: "/",
      maxAge: expect.any(Number),
    });

    expect(result).toEqual(mockResponse);
  });

  it("should handle API error responses", async () => {
    const formData = new FormData();
    formData.append("auth_token", "invalid_token");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Invalid token" }),
    } as unknown as Response);

    await expect(loginAndSetCookie(formData)).rejects.toThrow("Authentication failed");
  });

  it("should handle network errors", async () => {
    const formData = new FormData();
    formData.append("auth_token", "token");

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(loginAndSetCookie(formData)).rejects.toThrow("Authentication failed");
  });

  it("should decode JWT and calculate maxAge correctly", async () => {
    const formData = new FormData();
    formData.append("auth_token", "token");

    // JWT with exp = 1684839222 (some future time)
    const accessToken = access;

    const mockResponse = {
      access: accessToken,
      refresh: "refresh_token",
      user_info: {
        avatar: "avatar_url",
        first_name: "John",
        full_name: "John Doe",
        last_name: "Doe",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    // Mock Date.now to return a fixed time
    const mockNow = 1516239022000; // 2018-01-18T00:00:00.000Z
    jest.spyOn(Date, "now").mockReturnValue(mockNow);

    await loginAndSetCookie(formData);

    // exp (1684839222) - currentTime (1516239022) = 168600200 seconds
    expect(mockCookies.set).toHaveBeenCalledWith("access", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 168600200,
    });

    jest.restoreAllMocks();
  });

  it("should use default maxAge when JWT decoding fails", async () => {
    const formData = new FormData();
    formData.append("auth_token", "token");

    const mockResponse = {
      access: "invalid.jwt.token",
      refresh: "refresh_token",
      user_info: {
        avatar: "avatar_url",
        first_name: "John",
        full_name: "John Doe",
        last_name: "Doe",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    await loginAndSetCookie(formData);

    expect(mockCookies.set).toHaveBeenCalledWith("access", mockResponse.access, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days default
    });
  });

  it("should set secure cookie in production", async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, NODE_ENV: "production" };

    const formData = new FormData();
    formData.append("auth_token", "token");

    const mockResponse = {
      access: "access_token",
      refresh: "refresh_token",
      user_info: {
        avatar: "avatar_url",
        first_name: "John",
        full_name: "John Doe",
        last_name: "Doe",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    await loginAndSetCookie(formData);

    expect(mockCookies.set).toHaveBeenCalledWith("access", mockResponse.access, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 604800,
    });
    process.env = originalEnv;
  });
});

describe("logoutAndClearCookie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.set.mockClear();
    mockCookies.delete.mockClear();
    mockRedirect.mockClear();
  });

  it("should clear access cookie and redirect to login", async () => {
    await logoutAndClearCookie();

    expect(mockCookies.delete).toHaveBeenCalledWith("access");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});
