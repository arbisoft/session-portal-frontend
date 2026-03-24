import { NextRequest } from "next/server";

import { middleware } from "./middleware";

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: "next" })),
    redirect: jest.fn((url) => ({ type: "redirect", url })),
  },
}));

describe("Middleware", () => {
  const mockNextResponse = require("next/server").NextResponse;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect root path to /videos", () => {
    const req = {
      nextUrl: { pathname: "/", search: "" },
      url: "http://localhost:3000/",
      cookies: { get: jest.fn(() => undefined) },
    } as unknown as NextRequest;

    middleware(req);

    expect(mockNextResponse.redirect).toHaveBeenCalledWith(new URL("/videos", req.url));
  });

  it("should redirect to login for protected route without valid token", () => {
    const req = {
      nextUrl: { pathname: "/videos", search: "" },
      url: "http://localhost:3000/videos",
      cookies: { get: jest.fn(() => undefined) },
    } as unknown as NextRequest;

    middleware(req);

    const expectedUrl = new URL("/login", req.url);
    expectedUrl.searchParams.set("redirect_to", "/videos");
    expect(mockNextResponse.redirect).toHaveBeenCalledWith(expectedUrl);
  });

  it("should redirect to login for protected route with malformed token", () => {
    const req = {
      nextUrl: { pathname: "/videos", search: "" },
      url: "http://localhost:3000/videos",
      cookies: { get: jest.fn(() => ({ value: "invalid.token" })) },
    } as unknown as NextRequest;

    middleware(req);

    const expectedUrl = new URL("/login", req.url);
    expectedUrl.searchParams.set("redirect_to", "/videos");
    expect(mockNextResponse.redirect).toHaveBeenCalledWith(expectedUrl);
  });

  it("should redirect to login for protected route with expired token", () => {
    // Expired token: exp in past
    const expiredToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDAwMDAwMDB9.invalid";
    const req = {
      nextUrl: { pathname: "/videos", search: "" },
      url: "http://localhost:3000/videos",
      cookies: { get: jest.fn(() => ({ value: expiredToken })) },
    } as unknown as NextRequest;

    middleware(req);

    const expectedUrl = new URL("/login", req.url);
    expectedUrl.searchParams.set("redirect_to", "/videos");
    expect(mockNextResponse.redirect).toHaveBeenCalledWith(expectedUrl);
  });

  it("should allow access to protected route with valid token", () => {
    // Valid token: exp in future
    const validToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjIwMDAwMDAwMDB9.invalid";
    const req = {
      nextUrl: { pathname: "/videos", search: "" },
      url: "http://localhost:3000/videos",
      cookies: { get: jest.fn(() => ({ value: validToken })) },
    } as unknown as NextRequest;

    middleware(req);

    expect(mockNextResponse.next).toHaveBeenCalled();
  });

  it("should redirect login page to /videos when user has valid token", () => {
    const validToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjIwMDAwMDAwMDB9.invalid";
    const req = {
      nextUrl: { pathname: "/login", search: "" },
      url: "http://localhost:3000/login",
      cookies: { get: jest.fn(() => ({ value: validToken })) },
    } as unknown as NextRequest;

    middleware(req);

    expect(mockNextResponse.redirect).toHaveBeenCalledWith(new URL("/videos", req.url));
  });

  it("should redirect upload-video path to /videos", () => {
    const req = {
      nextUrl: { pathname: "/upload-video", search: "" },
      url: "http://localhost:3000/upload-video",
      cookies: { get: jest.fn(() => undefined) },
    } as unknown as NextRequest;

    middleware(req);

    expect(mockNextResponse.redirect).toHaveBeenCalledWith(new URL("/videos", req.url));
  });

  it("should redirect login page to redirect_to when already authenticated", () => {
    const validToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjIwMDAwMDAwMDB9.invalid";
    const req = {
      nextUrl: { pathname: "/login", search: "?redirect_to=%2Fvideos%2F123" },
      url: "http://localhost:3000/login?redirect_to=%2Fvideos%2F123",
      cookies: { get: jest.fn(() => ({ value: validToken })) },
    } as unknown as NextRequest;

    middleware(req);

    expect(mockNextResponse.redirect).toHaveBeenCalledWith(new URL("/videos/123", req.url));
  });

  it("should ignore external redirect_to on login and fallback to /videos", () => {
    const validToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjIwMDAwMDAwMDB9.invalid";
    const req = {
      nextUrl: { pathname: "/login", search: "?redirect_to=%2F%2Fevil.com" },
      url: "http://localhost:3000/login?redirect_to=%2F%2Fevil.com",
      cookies: { get: jest.fn(() => ({ value: validToken })) },
    } as unknown as NextRequest;

    middleware(req);

    expect(mockNextResponse.redirect).toHaveBeenCalledWith(new URL("/videos", req.url));
  });

  it("should allow access to unprotected routes without token", () => {
    const req = {
      nextUrl: { pathname: "/some-other", search: "" },
      url: "http://localhost:3000/some-other",
      cookies: { get: jest.fn(() => undefined) },
    } as unknown as NextRequest;

    middleware(req);

    expect(mockNextResponse.next).toHaveBeenCalled();
  });

  it("should redirect protected sub-routes to login with search params", () => {
    const req = {
      nextUrl: { pathname: "/videos/123", search: "?filter=recent" },
      url: "http://localhost:3000/videos/123?filter=recent",
      cookies: { get: jest.fn(() => undefined) },
    } as unknown as NextRequest;

    middleware(req);

    const expectedUrl = new URL("/login", req.url);
    expectedUrl.searchParams.set("redirect_to", "/videos/123?filter=recent");
    expect(mockNextResponse.redirect).toHaveBeenCalledWith(expectedUrl);
  });
});
