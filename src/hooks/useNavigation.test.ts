import { renderHook } from "@testing-library/react";
import { useRouter } from "next/navigation";

import useNavigation from "@/hooks/useNavigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("useNavigation", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("should return the correct URL for static pages", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("home")).toBe("/");
    expect(result.current.getPageUrl("login")).toBe("/login");
    expect(result.current.getPageUrl("videos")).toBe("/videos");
    expect(result.current.getPageUrl("uploadVideo")).toBe("/upload-video");
  });

  it("should return correct URL for home page", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("home")).toBe("/");
  });

  it("should return correct URL for login page", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("login")).toBe("/login");
  });

  it("should return correct URL for videos page", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("videos")).toBe("/videos");
  });

  it("should return correct URL for videoDetail with ID", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("videoDetail", { id: "123" })).toBe("/videos/123");
  });

  it("should return correct URL with query parameters", () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.getPageUrl("videos", { search: "test", page: 2 })).toBe("/videos?search=test&page=2");
    expect(result.current.getPageUrl("searchResult", { q: "test" })).toBe("/videos/results?q=test");
  });

  it("should call router.push with correct URL", () => {
    const { result } = renderHook(() => useNavigation());
    result.current.navigateTo("videos");

    expect(mockPush).toHaveBeenCalledWith("/videos", { scroll: true });
  });

  it("should call router.push with correct URL for videoDetail with ID", () => {
    const { result } = renderHook(() => useNavigation());
    result.current.navigateTo("videoDetail", { id: "456" });

    expect(mockPush).toHaveBeenCalledWith("/videos/456", { scroll: true });
  });

  it("should call router.push with query parameters", () => {
    const { result } = renderHook(() => useNavigation());
    result.current.navigateTo("searchResult", { q: "example" });
    expect(mockPush).toHaveBeenCalledWith("/videos/results?q=example", { scroll: true });
  });
});
