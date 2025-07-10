import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import { useColorScheme } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import clsx from "clsx";

import { DEFAULT_THUMBNAIL } from "@/constants/constants";

import { ImageWrapper, VideoCardContainer } from "./styled";
import { VideoCardProps } from "./types";

const VideoCard: FC<VideoCardProps> = ({
  className,
  data,
  onClick,
  width = "315px",
  height = "310px",
  variant = "normal-card",
}) => {
  const { mode } = useColorScheme();
  const headingVariant: Record<typeof variant, TypographyProps["variant"]> = {
    "featured-card": "h1",
    "normal-card": "h3",
    "related-card": "h5",
    "search-card": "h1",
  };

  const displayDescription = variant === "featured-card" || variant === "search-card";

  return (
    <VideoCardContainer
      $width={width}
      $height={height}
      className={clsx(className, { [variant]: true })}
      data-testid="video-card"
      onClick={onClick}
      variant={mode === "light" && variant === "featured-card" ? "outlined" : undefined}
      elevation={0}
    >
      <CardContent>
        <ImageWrapper className="image-wrapper">
          <Skeleton width="100%" height="100%" variant="rounded" animation="wave" />
          <img
            data-testid="video-card-image"
            alt={data.title}
            height={196}
            width={315}
            src={data.thumbnail || DEFAULT_THUMBNAIL}
          />
          <Typography className="video-duration" component="div" data-testid="video-card-duration">
            {data.video_duration}
          </Typography>
        </ImageWrapper>
        <Box className="video-detail">
          <Typography data-testid="video-card-title" variant={headingVariant[variant]} title={data.title}>
            {data.title}
          </Typography>
          <Box>
            <Typography variant="bodyMedium" color="textSecondary" className="organizer-name" data-testid="video-card-organizer">
              {data.organizer}
            </Typography>
            <Typography variant="bodyMedium" color="textSecondary" className="date-time" data-testid="video-card-date-time">
              {data.event_time}
            </Typography>
          </Box>
          {displayDescription && data.description && (
            <Typography variant="bodyLarge" className="video-description" data-testid="video-description">
              {data.description}
            </Typography>
          )}
        </Box>
      </CardContent>
    </VideoCardContainer>
  );
};

export default VideoCard;
