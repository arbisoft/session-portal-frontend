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
import RecommendedVideoCard from "@/components/RecommendedVideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import useNavigation from "@/hooks/useNavigation";
import { useEventDetailQuery, useRecommendationQuery } from "@/redux/events/apiSlice";
import { useTranslation } from "@/services/i18n/client";
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/utils/constants";
import { convertSecondsToFormattedTime } from "@/utils/utils";

import { StyledDetailSection, StyledNotesSection, StyledTitleSection, TagsContainer } from "./styled";

const VideoDetail = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { t } = useTranslation("common");

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
    if (isNaN(parsedId) || error) {
      navigateTo("videos");
    }
  }, [error]);

  const dataEvent = data?.event;
  const name = [dataEvent?.publisher.first_name, dataEvent?.publisher?.last_name].filter(Boolean).join(" ");

  return (
    <MainLayoutContainer
      isLeftSidebarVisible={false}
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
              <RecommendedVideoCard
                date={format(new Date(video.event_time), "MMM dd, yyyy")}
                duration={convertSecondsToFormattedTime(video.video_duration)}
                imgUrl={video.thumbnail ? BASE_URL.concat(video.thumbnail) : DEFAULT_THUMBNAIL}
                key={video.id}
                title={video.title}
                onClick={() => navigateTo("videoDetail", { id: video.id })}
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
              title: data?.title ?? "",
              videoSrc: data?.video_file ?? "",
              posterSrc: data?.thumbnail || DEFAULT_THUMBNAIL,
              posterAlt: data?.title ?? "",
            }}
          />
          <StyledTitleSection>
            <Typography variant="h4">{data?.title}</Typography>
          </StyledTitleSection>
          <StyledDetailSection>
            {name && <Typography variant="h6">{name}</Typography>}
            <Typography>{format(dataEvent?.event_time ?? "", "MMM dd, yyy")}</Typography>
          </StyledDetailSection>
          <StyledNotesSection>
            <Typography variant="h5">Session Notes</Typography>
            <div className="description">
              <ReadMore text={dataEvent?.description ?? ""} showLessText={t("show_less")} showMoreText={t("show_more")} />
            </div>
          </StyledNotesSection>
          {(data.event?.tags?.length ?? 0) > 0 && (
            <TagsContainer>
              {data.event?.tags?.map((tag) => (
                <Chip
                  component={Link}
                  href={getPageUrl("videos", { tag })}
                  label={tag}
                  key={tag}
                  variant="outlined"
                  size="small"
                />
              ))}
            </TagsContainer>
          )}
        </>
      )}
    </MainLayoutContainer>
  );
};

export default VideoDetail;
