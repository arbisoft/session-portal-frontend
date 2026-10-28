"use client";

import { useCallback, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { skipToken } from "@reduxjs/toolkit/query";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Virtuoso } from "react-virtuoso";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import ReadMore from "@/components/ReadMore";
import VideoCard from "@/components/VideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import { DEFAULT_THUMBNAIL } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { useEventDetailQuery, useIncrementViewCountMutation, useRecommendationQuery } from "@/redux/events/apiSlice";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";
import { fullName, transformVideoToCardData } from "@/utils/utils";

import SkeletonLoader from "./skeletonLoader";
import { StyledDetailSection, StyledNotesSection, StyledTitleSection, TagsContainer } from "./styled";

type RecommendationsContext = { isFetching: boolean };

const RecommendationsFooter = ({ context }: { context?: RecommendationsContext }) =>
  context?.isFetching ? (
    <Box mt={2} sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Skeleton key={idx} variant="rounded" width="100%" height={90} />
      ))}
    </Box>
  ) : null;

const VideoDetail = () => {
  const { videoId } = useParams<{ videoId: string }>();

  const { navigateTo, getPageUrl } = useNavigation();

  const [page, setPage] = useState(1);
  const [countedViews, setCountedViews] = useState<{ videoId: string; viewCount: number } | null>(null);

  const [incrementViewCount] = useIncrementViewCountMutation();

  const { data: recommendationsData, isFetching: isRecommendationsFetching } = useRecommendationQuery(
    videoId ? { id: videoId, page } : skipToken
  );

  const { data, isFetching, isLoading, isUninitialized, error } = useEventDetailQuery(videoId ?? skipToken);

  const isDataLoading = isFetching || isLoading || isUninitialized;

  useEffect(() => {
    document.title = `${data?.event?.title ?? ""} - Sessions Portal`;
  }, [data?.event?.title]);

  useEffect(() => {
    if (!videoId || error) {
      navigateTo("videos");
    }
  }, [error]);

  const handleWatchThreshold = useCallback(() => {
    incrementViewCount(videoId)
      .unwrap()
      .then((res) => {
        setCountedViews({ videoId, viewCount: res.view_count });
        trackEvent(GA_EVENTS.VIDEO_VIEW_COUNTED, ANALYTICS_CATEGORY.VIDEO_PLAYER, { view_count: res.view_count });
      })
      // Errors are already surfaced by customBaseQuery; a failed view count must not become an unhandled rejection.
      .catch(() => trackEvent(GA_EVENTS.VIDEO_VIEW_COUNT_FAILED, ANALYTICS_CATEGORY.VIDEO_PLAYER));
  }, [videoId, incrementViewCount]);

  const countedViewCount = countedViews?.videoId === videoId ? countedViews?.viewCount : undefined;
  const displayedViewCount = countedViewCount ?? data?.view_count;
  const dataEvent = data?.event;
  const allRecommendations = recommendationsData?.results ?? [];

  return (
    <MainLayoutContainer
      isLeftSidebarVisible={false}
      shouldShowDrawer
      rightSidebar={
        <Box pr={1} data-testid="recommendation-card">
          <Virtuoso
            data={allRecommendations}
            useWindowScroll
            itemContent={(_, video) => (
              <VideoCard
                data={transformVideoToCardData(video)}
                height="100px"
                href={`/videos/${video.slug}`}
                key={`recommendation-${video.id}`}
                variant="related-card"
              />
            )}
            endReached={() => {
              if (!isRecommendationsFetching && recommendationsData?.next) {
                trackEvent(GA_EVENTS.RECOMMENDATIONS_LOAD_MORE, ANALYTICS_CATEGORY.RECOMMENDATIONS, { next_page: page + 1 });
                setPage((prev) => prev + 1);
              }
            }}
            context={{ isFetching: isRecommendationsFetching }}
            components={{ Footer: RecommendationsFooter }}
          />
        </Box>
      }
    >
      {error || isDataLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {data?.video_file && (
            <VideoPlayer
              key={data.video_file}
              {...{
                captionsFile: data?.captions_file,
                crossOrigin: true,
                playsInline: true,
                width: "100%",
                title: "",
                videoSrc: data?.video_file ?? "",
                posterSrc: data?.thumbnail || DEFAULT_THUMBNAIL,
                posterAlt: data?.event?.title ?? "",
                onWatchThreshold: handleWatchThreshold,
              }}
            />
          )}
          <article aria-label={`Session details for ${data?.event?.title}`}>
            <StyledTitleSection>
              <Typography variant="h4" component="h1" tabIndex={0}>
                {data?.event?.title}
              </Typography>
            </StyledTitleSection>
            <StyledDetailSection>
              <Typography color="textSecondary" variant="h6" component="p" tabIndex={0}>
                {dataEvent?.presenters.map(fullName).join(", ")}
              </Typography>
              <Typography color="textSecondary" component="time" dateTime={dataEvent?.event_time} tabIndex={0}>
                {format(dataEvent?.event_time ?? "", "MMM dd, yyyy")}
              </Typography>
              {displayedViewCount !== undefined && displayedViewCount !== null && (
                <Typography color="textSecondary" variant="bodySmall" component="p" tabIndex={0}>
                  {displayedViewCount.toLocaleString()} {displayedViewCount === 1 ? "view" : "views"}
                </Typography>
              )}
            </StyledDetailSection>
            <StyledNotesSection>
              <Typography variant="h5" component="h2" tabIndex={0}>
                Session Details
              </Typography>
              <div className="description">
                <ReadMore text={dataEvent?.description ?? ""} showLessText="Show Less" showMoreText="Show More" />
                {(dataEvent?.tags?.length ?? 0) > 0 && (
                  <TagsContainer>
                    {dataEvent?.tags?.map((tag) => (
                      <Chip
                        component={Link}
                        href={getPageUrl("videos", { tag })}
                        label={`#${tag}`}
                        key={tag}
                        variant="outlined"
                        size="small"
                        data-testid={`sidebar-tags-${tag}`}
                        clickable
                        role="button"
                        onClick={() =>
                          trackEvent(GA_EVENTS.TAG_SELECT, ANALYTICS_CATEGORY.SIDEBAR, { tag, source: "video_detail" })
                        }
                      />
                    ))}
                  </TagsContainer>
                )}
              </div>
            </StyledNotesSection>
          </article>
        </>
      )}
    </MainLayoutContainer>
  );
};

export default VideoDetail;
