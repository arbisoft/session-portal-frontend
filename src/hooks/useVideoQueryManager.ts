import { useEffect, useMemo, useState } from "react";

import { startOfYear, endOfYear, format } from "date-fns";

import { defaultParams } from "@/features/VideosListingPage/types";
import { EventsParams } from "@/models/Events";
import { parseNonPassedParams } from "@/utils/utils";

export function useVideoQueryManager(searchParams: URLSearchParams) {
  const [page, setPage] = useState(1);

  const parsedParams = useMemo(
    () => ({
      tag: searchParams.get("tag") || null,
      playlist: searchParams.get("playlist") || null,
      search: searchParams.get("search") || null,
      order: searchParams.get("order") || null,
      year: searchParams.get("year") || null,
    }),
    [searchParams]
  );

  useEffect(() => {
    setPage(1);
  }, [parsedParams.tag, parsedParams.playlist, parsedParams.search, parsedParams.order, parsedParams.year]);

  const apiParams = useMemo(() => {
    return parseNonPassedParams({
      ...defaultParams,
      page,
      page_size: 12,
      ordering: parsedParams.order ? [parsedParams.order] : ["-event_time"],
      search: parsedParams.search ?? undefined,
      tag: parsedParams.search ? "" : (parsedParams.tag ?? ""),
      playlist: parsedParams.search ? "" : (parsedParams.playlist ?? ""),
      event_time_after: parsedParams.year ? format(startOfYear(new Date(parsedParams.year)), "yyyy-MM-dd") : undefined,
      event_time_before: parsedParams.year ? format(endOfYear(new Date(parsedParams.year)), "yyyy-MM-dd") : undefined,
    }) as EventsParams;
  }, [page, parsedParams]);

  return {
    page,
    setPage,
    parsedParams,
    apiParams,
  };
}
