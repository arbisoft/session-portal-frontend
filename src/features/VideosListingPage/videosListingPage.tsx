"use client";

import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSearchParams } from "next/navigation";
import { VirtuosoGrid } from "react-virtuoso";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import VideoCard from "@/components/VideoCard";
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { useVideoQueryManager } from "@/hooks/useVideoQueryManager";
import { OrderingField, Event } from "@/models/Events";
import { useGetEventsQuery, useLazyGetEventsQuery } from "@/redux/events/apiSlice";
import { convertSecondsToFormattedTime, formatDateTime, fullName, generateYearList, parseNonPassedParams } from "@/utils/utils";

import DateFilterDropdown from "./DateFilterDropdown";
import SkeletonLoader from "./skeletonLoader";
import { FilterBox, NoSearchResultsWrapper, VideoListingContainer } from "./styled";
import { defaultParams } from "./types";

const VideosListingPage = () => {
  const [isPageLoaderActive, setIsPageLoaderActive] = useState<boolean>(false);
  const [videoData, setVideoData] = useState<Event[]>([]);

  const searchParams = useSearchParams();
  const { navigateTo } = useNavigation();
  const theme = useTheme();

  const matches = useMediaQuery(theme.breakpoints.down("lg"));

  const { setPage, parsedParams, apiParams } = useVideoQueryManager(searchParams);

  const [getEvents, { data: videoListings, isFetching, isLoading, isUninitialized, error }] = useLazyGetEventsQuery();

  const defaultEventParams = {
    ...defaultParams,
    is_featured: true,
    page_size: 12,
    ordering: ["-event_time"] as OrderingField[],
  };

  const { data: featureVideos, isFetching: isFeatureFetching } = useGetEventsQuery(defaultEventParams, {
    skip: !!(parsedParams.tag || parsedParams.playlist || parsedParams.search || parsedParams.year),
  });

  useEffect(() => {
    if (apiParams.page === 1) {
      setVideoData([]);
      setIsPageLoaderActive(true);
    }

    const timer = setTimeout(() => {
      getEvents(apiParams);
      setIsPageLoaderActive(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [apiParams]);

  useEffect(() => {
    if (videoListings?.results) {
      setVideoData(videoListings.results);
    }
  }, [videoListings]);

  const onQueryParamChange = (key: "order" | "year", val: unknown) => {
    navigateTo(
      "videos",
      parseNonPassedParams({
        ...parsedParams,
        [key]: val,
      }) as Record<string, string>
    );
  };

  const onClearFilterHandler = () => {
    navigateTo(
      "videos",
      parseNonPassedParams({
        tag: parsedParams.tag ?? undefined,
        playlist: parsedParams.playlist ?? undefined,
        search: parsedParams.search ?? undefined,
      }) as Record<string, string>
    );
  };

  const latestFeaturedVideo = featureVideos?.results[0];

  const isDataLoading = isLoading || isUninitialized || !videoListings?.results || isFeatureFetching;

  return (
    <MainLayoutContainer shouldShowDrawer={matches} isLeftSidebarVisible={!matches}>
      <FilterBox>
        <Stack>
          <Typography variant="h2">
            {parsedParams.tag ? `#${parsedParams.tag}` : (parsedParams.playlist ?? "All videos")}
          </Typography>
          <DateFilterDropdown
            availableYears={generateYearList(2020)}
            initialSort={(parsedParams.order?.startsWith("-") ?? "-") ? "newest" : "oldest"}
            initialYear={parsedParams.year || undefined}
            onSortChange={(val) => onQueryParamChange("order", val === "newest" ? "-event_time" : "event_time")}
            onYearChange={(val) => onQueryParamChange("year", val)}
            onClear={onClearFilterHandler}
          />
        </Stack>
      </FilterBox>

      {!parsedParams.tag &&
        !parsedParams.playlist &&
        !parsedParams.order &&
        !parsedParams.year &&
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
              video_file: latestFeaturedVideo.video_file ? BASE_URL.concat(latestFeaturedVideo.video_file) : undefined,
            }}
            onClick={() => navigateTo("videoDetail", { id: latestFeaturedVideo.slug })}
            variant="featured-card"
            width="100%"
            height="auto"
          />
        ))}

      <Box width="100%" paddingBlock={3}>
        {error || isDataLoading || isPageLoaderActive ? (
          <SkeletonLoader />
        ) : (
          <VideoListingContainer>
            <VirtuosoGrid
              data={videoData}
              useWindowScroll
              endReached={() => {
                if (!isFetching && videoListings?.next) {
                  setPage((prev) => prev + 1);
                }
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
                    video_file: videoCard.video_file ? BASE_URL.concat(videoCard.video_file) : undefined,
                  }}
                  key={videoCard.id}
                  onClick={() => navigateTo("videoDetail", { id: videoCard.slug })}
                  width="100%"
                />
              )}
            />
          </VideoListingContainer>
        )}
        {!isDataLoading && !isFetching && videoListings?.results.length === 0 && (
          <NoSearchResultsWrapper>
            <Typography variant="h3">
              No videos found for{" "}
              <Box component="span" color={theme.palette.text.primary}>
                {parsedParams.year || parsedParams.playlist || parsedParams.tag}
              </Box>
            </Typography>
          </NoSearchResultsWrapper>
        )}
      </Box>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
