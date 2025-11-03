import { renderHook } from "@testing-library/react";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

import { getQueryValue } from "@/utils/utils";

import useAuth from "./useAuth";
import useNavigation from "./useNavigation";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/utils/utils", () => ({
  getQueryValue: jest.fn(),
}));

jest.mock("./useNavigation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("useAuth hook", () => {
  const navigateToMock = jest.fn();
  const getPageUrlMock = jest.fn();

  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();

    (useNavigation as jest.Mock).mockReturnValue({
      navigateTo: navigateToMock,
      getPageUrl: getPageUrlMock,
    });

    (useParams as jest.Mock).mockReturnValue({});
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (getQueryValue as jest.Mock).mockImplementation((v) => v);
  });

  test("should redirects to videoDetail if user is authenticated and redirect_to is present", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("valid_token");
    mockSearchParams.get = jest.fn().mockReturnValue("123");

    renderHook(() => useAuth());

    expect(navigateToMock).toHaveBeenCalledWith("videoDetail", { id: "123" });
  });

  test("should redirects to videos if user is authenticated and on home or login page", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("valid_token");
    (usePathname as jest.Mock).mockReturnValue("/");
    mockSearchParams.get = jest.fn().mockReturnValue(null);

    getPageUrlMock.mockImplementation((page) => (page === "home" ? "/" : "/login"));

    renderHook(() => useAuth());

    expect(navigateToMock).toHaveBeenCalledWith("videos");
  });

  test("should redirects to login with redirect param if user not authenticated and videoId is present", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(null);
    (useParams as jest.Mock).mockReturnValue({ videoId: "abc" });
    (getQueryValue as jest.Mock).mockReturnValue("abc");

    renderHook(() => useAuth());

    expect(navigateToMock).toHaveBeenCalledWith("login", { redirect_to: "abc" });
  });

  test("should redirects to login with redirect param if user not authenticated and redirect_to is present", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(null);
    mockSearchParams.get = jest.fn().mockReturnValue("xyz");

    renderHook(() => useAuth());

    expect(navigateToMock).toHaveBeenCalledWith("login", { redirect_to: "xyz" });
  });

  test("should redirects to login without params if user not authenticated and no redirect info", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(null);
    mockSearchParams.get = jest.fn().mockReturnValue(null);
    (useParams as jest.Mock).mockReturnValue({});
    (getQueryValue as jest.Mock).mockReturnValue(null);

    renderHook(() => useAuth());

    expect(navigateToMock).toHaveBeenCalledWith("login");
  });

  test("should does not redirect if user authenticated and not on home or login", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("valid_token");
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    mockSearchParams.get = jest.fn().mockReturnValue(null);
    getPageUrlMock.mockImplementation((page) => (page === "home" ? "/" : "/login"));

    renderHook(() => useAuth());

    expect(navigateToMock).not.toHaveBeenCalled();
  });

  test("should re-runs effect when dependencies change", () => {
    const { rerender } = renderHook(() => useAuth());

    expect(navigateToMock).toHaveBeenCalled();

    // Simulate token change
    (useSelector as unknown as jest.Mock).mockReturnValue("new_token");
    rerender();

    expect(navigateToMock).toHaveBeenCalled();

    // Simulate redirect_to param
    mockSearchParams.get = jest.fn().mockReturnValue("555");
    rerender();

    expect(navigateToMock).toHaveBeenCalledWith("videoDetail", { id: "555" });
  });
});
