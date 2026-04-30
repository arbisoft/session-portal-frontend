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
import { useSelector } from "react-redux";
import { Virtuoso } from "react-virtuoso";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import ReadMore from "@/components/ReadMore";
import VideoCard from "@/components/VideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import { DEFAULT_THUMBNAIL } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { useEventDetailQuery, useIncrementViewCountMutation, useRecommendationQuery } from "@/redux/events/apiSlice";
import { selectAccessToken } from "@/redux/login/selectors";
import { fullName, transformVideoToCardData } from "@/utils/utils";

import SkeletonLoader from "./skeletonLoader";
import { StyledDetailSection, StyledNotesSection, StyledTitleSection, TagsContainer } from "./styled";

const VideoDetail = () => {
  const { videoId } = useParams<{ videoId: string }>();

  const accessToken = useSelector(selectAccessToken);

  const { navigateTo, getPageUrl } = useNavigation();

  const [page, setPage] = useState(1);
  const [displayedViewCount, setDisplayedViewCount] = useState<number | null>(null);

  const [incrementViewCount] = useIncrementViewCountMutation();

  const { data: recommendationsData, isFetching: isRecommendationsFetching } = useRecommendationQuery(
    accessToken && videoId ? { id: videoId, page } : skipToken
  );

  const { data, isFetching, isLoading, isUninitialized, error } = useEventDetailQuery(accessToken ? videoId : skipToken);

  const isDataLoading = isFetching || isLoading || isUninitialized;

  useEffect(() => {
    document.title = `${data?.event?.title ?? ""} - Sessions Portal`;
  }, [data?.event?.title]);

  useEffect(() => {
    if (!videoId || error) {
      navigateTo("videos");
    }
  }, [error]);

  useEffect(() => {
    if (data?.view_count !== null && data?.view_count !== undefined) setDisplayedViewCount(data.view_count);
  }, [data?.view_count]);

  const handleWatchThreshold = useCallback(() => {
    incrementViewCount(videoId)
      .unwrap()
      .then((res) => {
        setDisplayedViewCount(res.view_count);
      });
  }, [videoId, incrementViewCount]);

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
                setPage((prev) => prev + 1);
              }
            }}
            components={{
              Footer: () =>
                isRecommendationsFetching ? (
                  <Box mt={2} sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <Skeleton key={idx} variant="rounded" width="100%" height={90} />
                    ))}
                  </Box>
                ) : null,
            }}
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
              {displayedViewCount !== null && displayedViewCount !== undefined && (
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
