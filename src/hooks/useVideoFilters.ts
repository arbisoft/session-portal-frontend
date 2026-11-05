import { useMemo } from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { SortOption } from "@/models/Events";
import { generateYearList, parseNonPassedParams } from "@/utils/utils";

import useNavigation, { ALLOWED_PAGES } from "./useNavigation";

const FIRST_FILTER_YEAR = 2020;
const VIEW_PARAMS = ["tag", "playlist", "search"] as const;
const FILTER_PARAMS = ["order", "year"] as const;

/**
 * Sort/year filters for the videos listing. State lives in the URL (`order`, `year`), so any page can read it
 * and any page can change it: choosing a filter navigates to the listing (Home). While already on the listing
 * the current view (tag, playlist, search) is kept; from any other page the listing starts unfiltered by view.
 */
const useVideoFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { navigateTo } = useNavigation();

  const isOnListing = pathname === ALLOWED_PAGES.videos;
  const availableYears = useMemo(() => generateYearList(FIRST_FILTER_YEAR), []);

  // Sort and year only describe the listing; on other pages the menu shows the defaults.
  const order = (isOnListing && searchParams?.get("order")) || null;
  const year = (isOnListing && searchParams?.get("year")) || undefined;
  const isOldestFirst = order !== null && !order.startsWith("-");
  const sort: SortOption = isOldestFirst ? "oldest" : "newest";

  const pick = (keys: readonly string[]) =>
    isOnListing ? Object.fromEntries(keys.map((key) => [key, searchParams?.get(key) ?? undefined])) : {};

  const navigateWith = (changes: Record<string, string | undefined>) =>
    navigateTo(
      "videos",
      parseNonPassedParams({ ...pick([...VIEW_PARAMS, ...FILTER_PARAMS]), ...changes }) as Record<string, string>
    );

  const setSort = (value: SortOption) => navigateWith({ order: value === "newest" ? "-event_time" : "event_time" });

  const setYear = (value: string) => navigateWith({ year: value });

  const clearFilters = () => navigateTo("videos", parseNonPassedParams(pick(VIEW_PARAMS)) as Record<string, string>);

  return { availableYears, clearFilters, setSort, setYear, sort, year };
};

export default useVideoFilters;
