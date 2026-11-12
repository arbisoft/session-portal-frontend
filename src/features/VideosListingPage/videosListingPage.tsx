"use client";

import React from "react";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSearchParams } from "next/navigation";
import { VirtuosoGrid } from "react-virtuoso";

import Button from "@/components/Button";
import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import EmptyState from "@/components/EmptyState";
import { FeaturedSlider } from "@/components/FeaturedSlider/featuredSlider";
import VideoCard from "@/components/VideoCard";
import { useVideoQueryManager } from "@/hooks/useVideoQueryManager";
import { OrderingField } from "@/models/Events";
import { useGetEventsQuery } from "@/redux/events/apiSlice";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { transformVideoToCardData } from "@/utils/utils";

import SkeletonLoader from "./skeletonLoader";
import { FilterBox, VideoListingContainer } from "./styled";
import { defaultParams } from "./types";

const VideosListingPage = () => {
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const { setPage, parsedParams, apiParams, page } = useVideoQueryManager(searchParams);

  const shouldSkipFeaturedVideos = !!(parsedParams.tag || parsedParams.playlist || parsedParams.search || parsedParams.year);

  const {
    data: videoListings,
    isFetching,
    isLoading,
    isUninitialized,
    isError,
    refetch,
  } = useGetEventsQuery(apiParams, {
    refetchOnMountOrArgChange: true,
  });

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

  const getPageTitle = (): string => {
    if (parsedParams.tag) return `#${parsedParams.tag}`;
    if (parsedParams.playlist) return parsedParams.playlist;
    return "All videos";
  };

  const filterValue = parsedParams.year || parsedParams.playlist || parsedParams.tag;

  const featuredVideos = featureVideos?.results ?? [];

  const isDataLoading =
    isLoading || isUninitialized || !videoListings?.results || (isFetching && page === 1) || isFeatureFetching;

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
                trackEvent(GA_EVENTS.VIDEOS_RETRY_CLICK, ANALYTICS_CATEGORY.VIDEOS_LISTING);
                refetch();
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
              trackEvent(GA_EVENTS.VIDEOS_LOAD_MORE, ANALYTICS_CATEGORY.VIDEOS_LISTING, { next_page: page + 1 });
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

      <Box sx={{ width: "100%", paddingBlock: 3 }}>{renderContent()}</Box>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
