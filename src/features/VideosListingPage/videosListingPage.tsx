"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { format, startOfYear, endOfYear } from "date-fns";
import { useSearchParams } from "next/navigation";
import { VirtuosoGrid } from "react-virtuoso";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import Select from "@/components/Select";
import VideoCard from "@/components/VideoCard";
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { EventsParams, OrderingField } from "@/models/Events";
import { useGetEventsQuery, useLazyGetEventsQuery } from "@/redux/events/apiSlice";
import { useTranslation } from "@/services/i18n/client";
import { convertSecondsToFormattedTime, formatDateTime, fullName, generateYearList, parseNonPassedParams } from "@/utils/utils";

import { FilterBox, NoSearchResultsWrapper, VideoListingContainer } from "./styled";
import { defaultParams } from "./types";

const loaderCards = Array.from({ length: 5 });

const SkeletonLoader = () => (
  <VideoListingContainer>
    {loaderCards.map((_, index) => (
      <Box key={index} className="skeleton-loader">
        <Skeleton width="100%" height={192} variant="rounded" animation="wave" />
        <Skeleton width="50%" height={30} />
        <Skeleton width="30%" height={30} />
      </Box>
    ))}
  </VideoListingContainer>
);

const VideosListingPage = () => {
  const searchParams = useSearchParams();
  const { navigateTo } = useNavigation();
  const { t } = useTranslation("videos");
  const theme = useTheme();

  const matches = useMediaQuery(theme.breakpoints.down("lg"));

  const [page, setPage] = useState(1);
  const [getEvents, { data: videoListings, isFetching, isLoading, isUninitialized, error }] = useLazyGetEventsQuery();
  const { data: featureVideos, isFetching: isFeatureFetching } = useGetEventsQuery({
    ...defaultParams,
    is_featured: true,
    page_size: 1,
  });

  const queryParams = useMemo(
    () => ({
      tag: searchParams?.get("tag"),
      search: searchParams?.get("search"),
      playlist: searchParams?.get("playlist"),
      order: searchParams?.get("order") as OrderingField,
      year: searchParams?.get("year"),
    }),
    [searchParams]
  );

  const sortingOption = queryParams.order || queryParams.year;

  const fetchEvents = useCallback(() => {
    const params: EventsParams = parseNonPassedParams({
      ...defaultParams,
      event_time_after: queryParams.year ? format(startOfYear(new Date(queryParams.year)), "yyyy-MM-dd") : undefined,
      event_time_before: queryParams.year ? format(endOfYear(new Date(queryParams.year)), "yyyy-MM-dd") : undefined,
      is_featured: false,
      ordering: [queryParams.order || "-event_time"],
      page_size: 12,
      page,
      playlist: queryParams.search ? "" : (queryParams.playlist ?? ""),
      search: queryParams.search || undefined,
      tag: queryParams.search ? "" : (queryParams.tag ?? ""),
    }) as EventsParams;
    getEvents(params);
  }, [queryParams, page]);

  useEffect(() => {
    setPage(1);
    fetchEvents();
  }, [queryParams, fetchEvents]);

  const onSortingHandler = useCallback(
    (val: unknown) => {
      setPage(1);
      const params = parseNonPassedParams({
        ...(val === "-event_time" ? { order: "-event_time" } : { year: val }),
        playlist: queryParams.playlist,
        tag: queryParams.tag,
      }) as Record<string, string>;
      navigateTo("videos", params);
    },
    [queryParams]
  );

  const latestFeaturedVideo = featureVideos?.results[0];
  const isDataLoading = isLoading || isUninitialized || !videoListings;

  return (
    <MainLayoutContainer shouldShowDrawer={matches} isLeftSidebarVisible={!matches}>
      <FilterBox>
        <Stack>
          <Typography variant="h2">{queryParams.tag ? `#${queryParams.tag}` : (queryParams.playlist ?? t("all"))}</Typography>
          <Select
            label={t("sort_by")}
            menuItems={[{ value: "-event_time", label: t("newest_to_oldest") }, ...generateYearList(2020)]}
            onChange={({ target }) => onSortingHandler(target.value)}
            value={sortingOption || "-event_time"}
          />
        </Stack>
      </FilterBox>

      {!queryParams.tag &&
        !queryParams.playlist &&
        !sortingOption &&
        latestFeaturedVideo &&
        (isFeatureFetching ? (
          <Skeleton width="100%" height={264} variant="rounded" />
        ) : (
          <VideoCard
            data={{
              description: latestFeaturedVideo.description,
              event_time: formatDateTime(latestFeaturedVideo.event_time),
              organizer: latestFeaturedVideo.presenters.map(fullName).join(", "),
              thumbnail: latestFeaturedVideo.thumbnail ? BASE_URL.concat(latestFeaturedVideo.thumbnail) : DEFAULT_THUMBNAIL,
              title: latestFeaturedVideo.title,
              video_duration: convertSecondsToFormattedTime(latestFeaturedVideo.video_duration),
            }}
            onClick={() => navigateTo("videoDetail", { id: latestFeaturedVideo.id })}
            variant="featured-card"
            width="100%"
          />
        ))}

      <Box width="100%" paddingBlock={4}>
        {error || isDataLoading ? (
          <SkeletonLoader />
        ) : (
          <VideoListingContainer>
            <VirtuosoGrid
              data={videoListings?.results ?? []}
              useWindowScroll
              endReached={() => {
                !isFetching && videoListings?.next && setPage((prev) => prev + 1);
              }}
              increaseViewportBy={0}
              components={{
                Footer: () => isFetching && <SkeletonLoader />,
              }}
              itemContent={(_, videoCard) => (
                <VideoCard
                  data={{
                    event_time: formatDateTime(videoCard.event_time),
                    organizer: videoCard.presenters.map(fullName).join(", "),
                    thumbnail: videoCard.thumbnail ? BASE_URL.concat(videoCard.thumbnail) : DEFAULT_THUMBNAIL,
                    title: videoCard.title,
                    video_duration: convertSecondsToFormattedTime(videoCard.video_duration),
                  }}
                  key={videoCard.id}
                  onClick={() => navigateTo("videoDetail", { id: videoCard.id })}
                  width="100%"
                />
              )}
            />
          </VideoListingContainer>
        )}
        {videoListings?.results.length === 0 && (
          <NoSearchResultsWrapper>
            <Typography variant="h3">
              {t("no_videos_found")}{" "}
              <Box component="span" color={theme.palette.secondary.main}>
                {sortingOption || queryParams.playlist || queryParams.tag}
              </Box>
            </Typography>
          </NoSearchResultsWrapper>
        )}
      </Box>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
