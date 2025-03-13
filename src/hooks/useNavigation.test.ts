import { renderHook } from "@testing-library/react";
import { useRouter } from "next/navigation";

import useNavigation from "@/hooks/useNavigation";
import useLanguage from "@/services/i18n/use-language";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/services/i18n/use-language", () => jest.fn());

describe("useNavigation", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useLanguage as jest.Mock).mockReturnValue("en");
  });

  test("should return correct URL for home page", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("home")).toBe("/en/");
  });

  test("should return correct URL for login page", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("login")).toBe("/en/login");
  });

  test("should return correct URL for videos page", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("videos")).toBe("/en/videos");
  });

  test("should return correct URL for videoDetail with ID", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("videoDetail", { id: "123" })).toBe("/en/videos/123");
  });

  test("should return correct URL with query parameters", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("videos", { search: "test", page: 2 })).toBe("/en/videos?search=test&page=2");
  });

  test("should call router.push with correct URL", () => {
    const { result } = renderHook(() => useNavigation());
    result.current.navigateTo("videos");

    expect(mockPush).toHaveBeenCalledWith("/en/videos");
  });

  test("should call router.push with correct URL for videoDetail with ID", () => {
    const { result } = renderHook(() => useNavigation());
    result.current.navigateTo("videoDetail", { id: "456" });

    expect(mockPush).toHaveBeenCalledWith("/en/videos/456");
  });

  test("should call router.push with query parameters", () => {
    const { result } = renderHook(() => useNavigation());
    result.current.navigateTo("login", { ref: "email", lang: "es" });

    expect(mockPush).toHaveBeenCalledWith("/en/login?ref=email&lang=es");
  });
});
