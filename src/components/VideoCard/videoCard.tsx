"use client";

import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { convertSecondsToFormattedTime, formatDateTime } from "@/utils/utils";

import { ImageWrapper, VideoCardContainer } from "./styled";
import { VideoCardProps } from "./types";

const VideoCard: FC<VideoCardProps> = ({
  className,
  event_time,
  thumbnail,
  workstream_id,
  title,
  video_duration,
  width = "315px",
}) => {
  const inAppThumbnail = `${process.env.NEXT_PUBLIC_BASE_URL}/${thumbnail}`;

  return (
    <VideoCardContainer $width={width} className={className} data-testid="video-card">
      <CardContent>
        <ImageWrapper>
          <Skeleton width={315} height={192} variant="rounded" animation="wave" />
          <Image
            alt={title}
            height={192}
            width={315}
            src={thumbnail ? inAppThumbnail : "/assets/images/temp-youtube-logo.webp"}
          />
          <Typography variant="body2" component="div">
            {convertSecondsToFormattedTime(video_duration)}
          </Typography>
        </ImageWrapper>
        <Box className="video-detail">
          <Typography variant="h3" component="div" title={title}>
            {title}
          </Typography>
          <Typography variant="body2" className="organizer-name" data-testid="video-card-organizer">
            {workstream_id}
          </Typography>
          <Typography variant="body2" className="date-time" data-testid="video-card-date-time">
            {formatDateTime(event_time)}
          </Typography>
        </Box>
      </CardContent>
    </VideoCardContainer>
  );
};

export default VideoCard;
