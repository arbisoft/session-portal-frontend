"use client";

import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { VideoCardContainer } from "./styled";
import { VideoCardProps } from "./types";

const VideoCard: FC<VideoCardProps> = ({ className, date, imgUrl, organizerName, title, width = "315px" }) => {
  return (
    <VideoCardContainer $width={width} className={className} data-testid="video-card">
      <CardContent>
        <Image alt={title} height={192} width={315} src={imgUrl ?? "/assets/images/temp-youtube-logo.webp"} />
        <Box className="video-detail">
          <Typography variant="h3" component="div" title={title}>
            {title}
          </Typography>
          <Typography variant="body2" className="organizer-name" data-testid="video-card-organizer">
            {organizerName}
          </Typography>
          <Typography variant="body2" className="date-time" data-testid="video-card-date-time">
            {date}
          </Typography>
        </Box>
      </CardContent>
    </VideoCardContainer>
  );
};

export default VideoCard;
