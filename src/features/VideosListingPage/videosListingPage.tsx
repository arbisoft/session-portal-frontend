"use client";

import React, { useEffect } from "react";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSearchParams } from "next/navigation";
import { VirtuosoGrid } from "react-virtuoso";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import { FeaturedSlider } from "@/components/FeaturedSlider/featuredSlider";
import VideoCard from "@/components/VideoCard";
import useNavigation from "@/hooks/useNavigation";
import { useVideoQueryManager } from "@/hooks/useVideoQueryManager";
import { OrderingField } from "@/models/Events";
import { useGetEventsQuery, useLazyGetEventsQuery } from "@/redux/events/apiSlice";
import { generateYearList, parseNonPassedParams, transformVideoToCardData } from "@/utils/utils";

import DateFilterDropdown from "./DateFilterDropdown";
import SkeletonLoader from "./skeletonLoader";
import { FilterBox, NoSearchResultsWrapper, VideoListingContainer } from "./styled";
import { defaultParams } from "./types";

const VideosListingPage = () => {
  const searchParams = useSearchParams();
  const { navigateTo } = useNavigation();
  const theme = useTheme();

  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const { setPage, parsedParams, apiParams } = useVideoQueryManager(searchParams);

  const shouldSkipFeaturedVideos = !!(parsedParams.tag || parsedParams.playlist || parsedParams.search || parsedParams.year);

  const [getEvents, { data: videoListings, isFetching, isLoading, isUninitialized, isError }] = useLazyGetEventsQuery();

  const defaultEventParams = {
    ...defaultParams,
    is_featured: true,
    page_size: 12,
    ordering: ["-event_time"] as OrderingField[],
  };

  const videoData = videoListings?.results ?? [];

  const { data: featureVideos, isFetching: isFeatureFetching } = useGetEventsQuery(defaultEventParams, {
    skip: shouldSkipFeaturedVideos,
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      await getEvents(apiParams).unwrap();
    }, 300);
    return () => clearTimeout(timer);
  }, [apiParams]);

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

  const getPageTitle = (): string => {
    if (parsedParams.tag) return `#${parsedParams.tag}`;
    if (parsedParams.playlist) return parsedParams.playlist;
    return "All videos";
  };

  const featuredVideos = featureVideos?.results;

  const isDataLoading = isLoading || isUninitialized || !videoListings?.results || isFeatureFetching;

  return (
    <MainLayoutContainer shouldShowDrawer={!isLargeScreen} isLeftSidebarVisible={isLargeScreen} maxWidth={false}>
      <FilterBox>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: { sm: "center" }, justifyContent: { sm: "space-between" } }}
        >
          <Typography variant="h2" sx={{ paddingBottom: { xs: 2 } }}>
            {getPageTitle()}
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
        featuredVideos &&
        (isFeatureFetching ? (
          <Skeleton width="100%" height={264} variant="rounded" />
        ) : (
          <FeaturedSlider
            slides={featuredVideos.map((featuredVideo, idx) => {
              return (
                <VideoCard
                  data={transformVideoToCardData(featuredVideo)}
                  height="auto"
                  href={`/videos/${featuredVideo.slug}`}
                  key={idx}
                  onClick={() => navigateTo("videoDetail", { id: featuredVideo.slug })}
                  variant="featured-card"
                  width="auto"
                />
              );
            })}
          />
        ))}

      <Box width="100%" paddingBlock={3}>
        {isError || isDataLoading ? (
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
                  data={transformVideoToCardData(videoCard)}
                  href={`/videos/${videoCard.slug}`}
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
