import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { ImageWrapper, VideoCardContainer } from "./styled";
import { VideoCardProps } from "./types";

const VideoCard: FC<VideoCardProps> = ({ className, data, onClick, width = "315px" }) => {
  return (
    <VideoCardContainer $width={width} className={className} data-testid="video-card" onClick={onClick}>
      <CardContent>
        <ImageWrapper>
          <Skeleton width="100%" height={192} variant="rounded" animation="wave" />
          <Image
            data-testid="video-card-image"
            alt={data.title}
            height={192}
            width={315}
            src={data.thumbnail || "/assets/images/temp-youtube-logo.webp"}
          />
          <Typography className="video-duration" component="div" data-testid="video-card-duration">
            {data.video_duration}
          </Typography>
        </ImageWrapper>
        <Box className="video-detail">
          <Typography data-testid="video-card-title" variant="h3" component="div" title={data.title}>
            {data.title}
          </Typography>
          <Typography variant="bodyMedium" className="organizer-name" data-testid="video-card-organizer">
            {data.organizer}
          </Typography>
          <Typography variant="bodyMedium" className="date-time" data-testid="video-card-date-time">
            {data.event_time}
          </Typography>
        </Box>
      </CardContent>
    </VideoCardContainer>
  );
};

export default VideoCard;
