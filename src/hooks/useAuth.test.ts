import { renderHook } from "@testing-library/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

import useNavigation from "@/hooks/useNavigation";
import { getQueryValue } from "@/utils/utils";

import useAuth from "./useAuth";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/hooks/useNavigation", () => jest.fn());
jest.mock("@/utils/utils", () => ({
  getQueryValue: jest.fn(),
}));

const mockNavigateTo = jest.fn();
const mockGetPageUrl = jest.fn();

describe("useAuth hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigateTo: mockNavigateTo,
      getPageUrl: mockGetPageUrl,
    });
    mockGetPageUrl.mockImplementation((page) => {
      if (page === "home") return "/";
      if (page === "login") return "/login";
      return `/${page}`;
    });
  });

  const mockNextNavigation = ({
    pathname = "/",
    params = {},
    searchParams = new URLSearchParams(),
  }: {
    pathname?: string;
    params?: Record<string, string>;
    searchParams?: URLSearchParams;
  }) => {
    (usePathname as jest.Mock).mockReturnValue(pathname);
    (useParams as jest.Mock).mockReturnValue(params);
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);
  };

  it("navigates to videoDetail when logged in and redirect_to is present", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("token123");
    mockNextNavigation({
      pathname: "/something",
      searchParams: new URLSearchParams({ redirect_to: "video-123" }),
    });

    renderHook(() => useAuth());

    expect(mockNavigateTo).toHaveBeenCalledWith("videoDetail", { id: "video-123" });
  });

  it("navigates to videos when logged in and on home page", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("token123");
    mockNextNavigation({ pathname: "/" });

    renderHook(() => useAuth());

    expect(mockNavigateTo).toHaveBeenCalledWith("videos");
  });

  it("navigates to videos when logged in and on login page", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("token123");
    mockNextNavigation({ pathname: "/login" });

    renderHook(() => useAuth());

    expect(mockNavigateTo).toHaveBeenCalledWith("videos");
  });

  it("navigates to login with videoSlug when not logged in", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(null);
    (getQueryValue as jest.Mock).mockReturnValue("slug-123");
    mockNextNavigation({ pathname: "/videos/slug-123", params: { videoId: "slug-123" } });

    renderHook(() => useAuth());

    expect(getQueryValue).toHaveBeenCalledWith("slug-123");
    expect(mockNavigateTo).toHaveBeenCalledWith("login", { redirect_to: "slug-123" });
  });

  it("navigates to login with redirect_to when not logged in", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(null);
    (getQueryValue as jest.Mock).mockReturnValue(undefined);
    mockNextNavigation({
      pathname: "/",
      searchParams: new URLSearchParams({ redirect_to: "abc999" }),
    });

    renderHook(() => useAuth());

    expect(mockNavigateTo).toHaveBeenCalledWith("login", { redirect_to: "abc999" });
  });

  it("navigates to login without redirect when not logged in and no redirect params", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(null);
    (getQueryValue as jest.Mock).mockReturnValue(undefined);
    mockNextNavigation({ pathname: "/videos" });

    renderHook(() => useAuth());

    expect(mockNavigateTo).toHaveBeenCalledWith("login");
  });

  it("handles undefined params and searchParams gracefully (no crashes)", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("token123");
    (getQueryValue as jest.Mock).mockReturnValue(undefined);
    (usePathname as jest.Mock).mockReturnValue("/unknown");
    (useParams as jest.Mock).mockReturnValue(undefined);
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

    renderHook(() => useAuth());

    // token present but no redirect_to and not home/login
    // → no navigation expected
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
