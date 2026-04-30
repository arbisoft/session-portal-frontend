"use client";

import React, { useEffect } from "react";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import { useSearchParams } from "next/navigation";
import { VirtuosoGrid } from "react-virtuoso";

import Button from "@/components/Button";
import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import EmptyState from "@/components/EmptyState";
import { FeaturedSlider } from "@/components/FeaturedSlider/featuredSlider";
import VideoCard from "@/components/VideoCard";
import useNavigation from "@/hooks/useNavigation";
import { useVideoQueryManager } from "@/hooks/useVideoQueryManager";
import { OrderingField } from "@/models/Events";
import { useGetEventsQuery, useLazyGetEventsQuery } from "@/redux/events/apiSlice";
import { generateYearList, parseNonPassedParams, transformVideoToCardData } from "@/utils/utils";

import DateFilterDropdown from "./DateFilterDropdown";
import SkeletonLoader from "./skeletonLoader";
import { FilterBox, VideoListingContainer } from "./styled";
import { defaultParams } from "./types";

const VideosListingPage = () => {
  const searchParams = useSearchParams();
  const { navigateTo } = useNavigation();
  const theme = useTheme();

  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const { setPage, parsedParams, apiParams } = useVideoQueryManager(searchParams);

  const shouldSkipFeaturedVideos = !!(parsedParams.tag || parsedParams.playlist || parsedParams.search || parsedParams.year);

  const [getEvents, { currentData: videoListings, isFetching, isLoading, isUninitialized, isError, originalArgs }] =
    useLazyGetEventsQuery();

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

  const filterValue = parsedParams.year || parsedParams.playlist || parsedParams.tag;

  const featuredVideos = featureVideos?.results ?? [];

  const isDataLoading =
    isLoading ||
    isUninitialized ||
    !videoListings?.results ||
    isFeatureFetching ||
    !isEqual(omit(originalArgs, "page"), omit(apiParams, "page"));

  // eslint-disable-next-line no-console
  console.warn("[VLP]", { isDataLoading, isLoading, isUninitialized, isFetching, isFeatureFetching, originalPlaylist: (originalArgs as any)?.playlist, apiPlaylist: (apiParams as any)?.playlist, resultsCount: videoListings?.results?.length, firstTitle: videoListings?.results?.[0]?.title });

  // Determine what to render based on state
  const renderContent = () => {
    // Error state
    if (isError && !isLoading) {
      return (
        <EmptyState
          heading="Something went wrong"
          text="We couldn't load the videos. Please try again."
          icon={<ErrorOutlineOutlinedIcon sx={{ fontSize: 48 }} />}
          ctas={[
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                getEvents(apiParams);
              }}
              key="retry"
            >
              Retry
            </Button>,
          ]}
        />
      );
    }

    // Loading state
    if (isDataLoading) {
      return <SkeletonLoader count={12} />;
    }

    // No results with filters
    if (videoData.length === 0 && filterValue) {
      return <EmptyState heading={<>No videos found for {filterValue}</>} icon={<SearchOutlinedIcon sx={{ fontSize: 48 }} />} />;
    }

    // No videos at all
    if (videoData.length === 0) {
      return (
        <EmptyState
          heading="No videos available"
          text="Check back later for new content."
          icon={<InboxOutlinedIcon sx={{ fontSize: 48 }} />}
        />
      );
    }

    // Success state with videos
    return (
      <VideoListingContainer>
        <VirtuosoGrid
          data={videoData}
          useWindowScroll
          endReached={() => {
            if (!isFetching && videoListings?.next) {
              setPage((prev) => prev + 1);
            }
          }}
          increaseViewportBy={400}
          components={{
            Footer: () => <>{isFetching && !!videoListings?.next && <SkeletonLoader count={12} />}</>,
          }}
          itemContent={(_, videoCard) => (
            <VideoCard
              data={transformVideoToCardData(videoCard)}
              href={`/videos/${videoCard.slug}`}
              key={videoCard.id}
              width="100%"
              height="auto"
            />
          )}
        />
      </VideoListingContainer>
    );
  };

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

      {!filterValue && !parsedParams.order && (
        <>
          {isFeatureFetching ? (
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
                    variant="featured-card"
                    width="auto"
                  />
                );
              })}
            />
          )}
        </>
      )}

      <Box width="100%" paddingBlock={3}>
        {renderContent()}
      </Box>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
