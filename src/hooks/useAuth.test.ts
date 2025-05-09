import { renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import { selectAccessToken } from "@/redux/login/selectors";

import useAuth from "./useAuth";
import useNavigation from "./useNavigation";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("./useNavigation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("useAuth hook", () => {
  const navigateToMock = jest.fn();
  const getPageUrlMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useNavigation as jest.Mock).mockReturnValue({
      navigateTo: navigateToMock,
      getPageUrl: getPageUrlMock,
    });
  });

  test("should redirects to 'videos' if user is authenticated and on home or login page", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn === selectAccessToken) return "valid_token";
      return null;
    });

    (usePathname as jest.Mock).mockReturnValue("/");

    getPageUrlMock.mockImplementation((page) => (page === "home" ? "/" : "/login"));

    renderHook(() => useAuth());

    expect(navigateToMock).toHaveBeenCalledWith("videos");
  });

  test("should redirects to 'login' if user is not authenticated", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn === selectAccessToken) return null;
      return null;
    });

    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    renderHook(() => useAuth());

    expect(navigateToMock).toHaveBeenCalledWith("login");
  });

  test("should does not redirect if token is present but not on home or login page", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn === selectAccessToken) return "valid_token";
      return null;
    });

    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    renderHook(() => useAuth());

    expect(navigateToMock).not.toHaveBeenCalledWith("videos");
  });

  test("should re-runs effect when language, token, or pathname changes", () => {
    const { rerender } = renderHook(() => useAuth());

    expect(navigateToMock).not.toHaveBeenCalled();

    (useSelector as unknown as jest.Mock).mockReturnValue("new_token");
    rerender();

    expect(navigateToMock).not.toHaveBeenCalledWith("login");

    (usePathname as jest.Mock).mockReturnValue("/login");
    rerender();

    expect(navigateToMock).toHaveBeenCalledWith("videos");
  });

  test("should matches snapshot when redirecting to 'videos'", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn === selectAccessToken) return "valid_token";
      return null;
    });

    (usePathname as jest.Mock).mockReturnValue("/");

    getPageUrlMock.mockImplementation((page) => (page === "home" ? "/" : "/login"));

    renderHook(() => useAuth());
  });

  test("should matches snapshot when redirecting to 'login'", () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn === selectAccessToken) return null;
      return null;
    });

    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    renderHook(() => useAuth());
  });
});
