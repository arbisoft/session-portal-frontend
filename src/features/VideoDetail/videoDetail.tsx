"use client";
import { useEffect } from "react";

import { faker } from "@faker-js/faker";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { skipToken } from "@reduxjs/toolkit/query";
import { format } from "date-fns";
import { useParams } from "next/navigation";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import RecommendedVideoCard, { RecommendedVideoCardProps } from "@/components/RecommendedVideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import useNavigation from "@/hooks/useNavigation";
import { useEventDetailQuery, useEventTagsQuery } from "@/redux/events/apiSlice";
import { convertSecondsToFormattedTime } from "@/utils/utils";

import { StyledDetailSection, StyledNotesSection, StyledTitleSection, TagsContainer } from "./styled";

const VideoDetail = () => {
  const { videoId } = useParams<{ videoId: string }>();

  const { navigateTo } = useNavigation();

  const parsedId = Number(videoId);

  const recommendedVideo: RecommendedVideoCardProps[] = Array(10)
    .fill("")
    .map(() => ({
      date: format(faker.date.past(), "MMM dd, yyyy"),
      duration: convertSecondsToFormattedTime(faker.number.int({ min: 100, max: 1000 })),
      imgUrl: "/assets/images/temp-youtube-logo.webp",
      title: faker.lorem.words(10),
    }));

  const { data, isFetching, isLoading, isUninitialized, error } = useEventDetailQuery(isNaN(parsedId) ? skipToken : parsedId);

  const { data: tags } = useEventTagsQuery();

  const isDataLoading = isFetching || isLoading || isUninitialized;

  useEffect(() => {
    if (isNaN(parsedId) || error) {
      navigateTo("videos");
    }
  }, [error]);

  const dataEvent = data?.event;
  const name = [dataEvent?.publisher.first_name, dataEvent?.publisher?.last_name].filter(Boolean).join(" ");

  return (
    <MainLayoutContainer
      rightSidebar={
        <div>
          <TagsContainer>
            <Chip onClick={() => navigateTo("videos")} label="All" size="small" />
            {tags?.map((tag) => (
              <Chip
                onClick={() => navigateTo("videos", { tag: tag.id })}
                label={tag.name}
                key={tag.id}
                variant="outlined"
                size="small"
              />
            ))}
            <Chip onClick={() => navigateTo("videos")} icon={<ArrowForward />} variant="outlined" size="small" className="icon" />
          </TagsContainer>
          {recommendedVideo.map((vid, index) => (
            <RecommendedVideoCard
              date={vid.date}
              duration={vid.duration}
              imgUrl={vid.imgUrl}
              key={vid.date + index}
              title={vid.title}
            />
          ))}
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
              posterSrc: data?.thumbnail ?? "/assets/images/temp-youtube-logo.webp",
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
              <Typography variant="bodySmall" color="textSecondary">
                {dataEvent?.description}
              </Typography>
            </div>
          </StyledNotesSection>
        </>
      )}
    </MainLayoutContainer>
  );
};

export default VideoDetail;
