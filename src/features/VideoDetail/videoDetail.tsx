"use client";

import { useEffect, useState } from "react";

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
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { useEventDetailQuery, useRecommendationQuery } from "@/redux/events/apiSlice";
import { selectAccessToken } from "@/redux/login/selectors";
import { convertSecondsToFormattedTime, fullName } from "@/utils/utils";

import SkeletonLoader from "./skeletonLoader";
import { StyledDetailSection, StyledNotesSection, StyledTitleSection, TagsContainer } from "./styled";

const VideoDetail = () => {
  const { videoId } = useParams<{ videoId: string }>();

  const accessToken = useSelector(selectAccessToken);

  const { navigateTo, getPageUrl } = useNavigation();

  const [page, setPage] = useState(1);

  const { data: recommendationsData, isFetching: isRecommendationsFetching } = useRecommendationQuery(
    accessToken && videoId ? { id: videoId, page } : skipToken
  );

  const { data, isFetching, isLoading, isUninitialized, error } = useEventDetailQuery((accessToken && videoId) || skipToken);

  const isDataLoading = isFetching || isLoading || isUninitialized;

  useEffect(() => {
    document.title = `${data?.event?.title ?? ""}  - Sessions Portal`;
  }, [data?.event?.title]);

  useEffect(() => {
    if (!videoId || error) {
      navigateTo("videos");
    }
  }, [error]);

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
                height="100px"
                key={`recommendation-${video.id}`}
                data={{
                  event_time: format(new Date(video.event_time), "MMM dd, yyyy"),
                  organizer: video.presenters.map(fullName).join(", "),
                  thumbnail: video.thumbnail ? BASE_URL.concat(video.thumbnail) : DEFAULT_THUMBNAIL,
                  title: video.title,
                  video_duration: convertSecondsToFormattedTime(video.video_duration),
                  video_file: video.video_file ? BASE_URL.concat(video.video_file) : undefined,
                }}
                onClick={() => navigateTo("videoDetail", { id: video.slug })}
                variant="related-card"
                href={`/videos/${video.slug}`}
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
          <VideoPlayer
            {...{
              crossOrigin: true,
              playsInline: true,
              width: "100%",
              title: "",
              videoSrc: data?.video_file ?? "",
              posterSrc: data?.thumbnail || DEFAULT_THUMBNAIL,
              posterAlt: data?.event?.title ?? "",
            }}
          />
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
            </StyledDetailSection>
            <StyledNotesSection>
              <Typography variant="h5" component="h2" tabIndex={0}>
                Session Details
              </Typography>{" "}
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
