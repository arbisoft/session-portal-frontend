"use client";
import { useEffect } from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { skipToken } from "@reduxjs/toolkit/query";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import ReadMore from "@/components/ReadMore";
import VideoCard from "@/components/VideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { useEventDetailQuery, useRecommendationQuery } from "@/redux/events/apiSlice";
import { convertSecondsToFormattedTime, fullName } from "@/utils/utils";

import { StyledDetailSection, StyledNotesSection, StyledTitleSection, TagsContainer } from "./styled";

const VideoDetail = () => {
  const { videoId } = useParams<{ videoId: string }>();

  const { navigateTo, getPageUrl } = useNavigation();

  const parsedId = Number(videoId);

  const { data, isFetching, isLoading, isUninitialized, error } = useEventDetailQuery(isNaN(parsedId) ? skipToken : parsedId);

  const {
    data: recommendations = [],
    isFetching: isRecommendationsFetching,
    isLoading: isRecommendationsLoading,
    isUninitialized: isRecommendationsUninitialized,
  } = useRecommendationQuery(isNaN(parsedId) ? skipToken : parsedId);

  const isDataLoading = isFetching || isLoading || isUninitialized;
  const areRecommendationsLoading = isRecommendationsFetching || isRecommendationsLoading || isRecommendationsUninitialized;

  useEffect(() => {
    document.title = `${data?.event?.title ?? ""}  - Sessions Portal`;
  }, [data?.event?.title]);

  useEffect(() => {
    if (isNaN(parsedId) || error) {
      navigateTo("videos");
    }
  }, [error]);

  const dataEvent = data?.event;

  return (
    <MainLayoutContainer
      isLeftSidebarVisible={false}
      shouldShowDrawer
      rightSidebar={
        <div>
          {areRecommendationsLoading ? (
            <Box display="flex" gap={2} flexDirection="column">
              {Array(10)
                .fill("")
                .map((_, key) => (
                  <Skeleton variant="rounded" width="100%" height={90} key={`skeleton-${key}`} />
                ))}
            </Box>
          ) : (
            recommendations.map((video) => (
              <VideoCard
                data={{
                  event_time: format(new Date(video.event_time), "MMM dd, yyyy"),
                  organizer: video.presenters.map(fullName).join(", "),
                  thumbnail: video.thumbnail ? BASE_URL.concat(video.thumbnail) : DEFAULT_THUMBNAIL,
                  title: video.title,
                  video_duration: convertSecondsToFormattedTime(video.video_duration),
                  video_file: video.video_file ? BASE_URL.concat(video.video_file) : undefined,
                }}
                key={`recommendation-${video.id}`}
                onClick={() => navigateTo("videoDetail", { id: video.id })}
                variant="related-card"
              />
            ))
          )}
        </div>
      }
    >
      {error || isDataLoading ? (
        <>
          <Skeleton width="100%" height={400} variant="rounded" animation="wave" />
          <Box display="flex" justifyContent="space-between" width="100%">
            <Skeleton width="50%" height={70} />
            <Skeleton width="30%" height={70} />
          </Box>
          <Skeleton width="30%" height={50} />
          <Skeleton width="100%" height={200} />
        </>
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
          <StyledTitleSection>
            <Typography variant="h4">{data?.event?.title}</Typography>
          </StyledTitleSection>
          <StyledDetailSection>
            <Typography variant="h6">{dataEvent?.presenters.map(fullName).join(", ")}</Typography>
            <Typography>{format(dataEvent?.event_time ?? "", "MMM dd, yyy")}</Typography>
          </StyledDetailSection>
          <StyledNotesSection>
            <Typography variant="h5">Session Details</Typography>
            <div className="description">
              <ReadMore text={dataEvent?.description ?? ""} showLessText="Show Less" showMoreText="Show More" />
              {(data.event?.tags?.length ?? 0) > 0 && (
                <TagsContainer>
                  {data.event?.tags?.map((tag) => (
                    <Chip
                      component={Link}
                      href={getPageUrl("videos", { tag })}
                      label={`#${tag}`}
                      key={tag}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </TagsContainer>
              )}
            </div>
          </StyledNotesSection>
        </>
      )}
    </MainLayoutContainer>
  );
};

export default VideoDetail;
