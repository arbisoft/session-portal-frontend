import { renderHook } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";

import useVideoFilters from "./useVideoFilters";

const mockNavigateTo = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("./useNavigation", () => ({
  ...jest.requireActual("./useNavigation"),
  __esModule: true,
  default: () => ({ navigateTo: mockNavigateTo }),
}));

const setLocation = (pathname: string, query = "") => {
  (usePathname as jest.Mock).mockReturnValue(pathname);
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(query));
};

describe("useVideoFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setLocation("/videos");
  });

  it("should default to newest first with no year", () => {
    const { result } = renderHook(() => useVideoFilters());

    expect(result.current.sort).toBe("newest");
    expect(result.current.year).toBeUndefined();
  });

  it("should read an ascending order as oldest first and a descending one as newest first", () => {
    setLocation("/videos", "order=event_time");
    expect(renderHook(() => useVideoFilters()).result.current.sort).toBe("oldest");

    setLocation("/videos", "order=-event_time");
    expect(renderHook(() => useVideoFilters()).result.current.sort).toBe("newest");
  });

  it("should read the year from the URL", () => {
    setLocation("/videos", "year=2024");

    expect(renderHook(() => useVideoFilters()).result.current.year).toBe("2024");
  });

  it("should offer years from 2020 up to the current year, newest first", () => {
    const { availableYears } = renderHook(() => useVideoFilters()).result.current;

    expect(availableYears[0]).toEqual({ value: String(new Date().getFullYear()), label: "This Year" });
    expect(availableYears.at(-1)).toEqual({ value: "2020", label: "2020" });
  });

  it("should keep the current view and year when changing the sort on the listing", () => {
    setLocation("/videos", "tag=ai&year=2024");
    const { result } = renderHook(() => useVideoFilters());

    result.current.setSort("newest");

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { tag: "ai", year: "2024", order: "-event_time" });
  });

  it("should keep the current view and sort when changing the year on the listing", () => {
    setLocation("/videos", "playlist=Talks&order=event_time");
    const { result } = renderHook(() => useVideoFilters());

    result.current.setYear("2023");

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { playlist: "Talks", order: "event_time", year: "2023" });
  });

  it("should drop sort and year but keep the view when clearing", () => {
    setLocation("/videos", "search=react&order=event_time&year=2024");
    const { result } = renderHook(() => useVideoFilters());

    result.current.clearFilters();

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { search: "react" });
  });

  it("should navigate to the plain listing when clearing with nothing to keep", () => {
    const { result } = renderHook(() => useVideoFilters());

    result.current.clearFilters();

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", {});
  });

  it("should not carry the current page's query into the listing from other pages", () => {
    setLocation("/videos/results", "search=react");
    const { result } = renderHook(() => useVideoFilters());

    result.current.setYear("2024");

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { year: "2024" });
  });

  it("should show the defaults on other pages even if their query has sort or year params", () => {
    setLocation("/videos/results", "search=react&order=event_time&year=2024");
    const { result } = renderHook(() => useVideoFilters());

    expect(result.current.sort).toBe("newest");
    expect(result.current.year).toBeUndefined();
  });

  it("should treat an empty year param as no year", () => {
    setLocation("/videos", "year=");

    expect(renderHook(() => useVideoFilters()).result.current.year).toBeUndefined();
  });

  it("should cope with missing search params and pathname", () => {
    (usePathname as jest.Mock).mockReturnValue(null);
    (useSearchParams as jest.Mock).mockReturnValue(null);
    const { result } = renderHook(() => useVideoFilters());

    result.current.setYear("2024");

    expect(result.current.sort).toBe("newest");
    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { year: "2024" });
  });

  it("should never navigate on its own", () => {
    renderHook(() => useVideoFilters());

    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
