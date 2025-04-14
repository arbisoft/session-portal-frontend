import React, { FC, useRef, useState } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import clsx from "clsx";
import Image from "next/image";

import { DEFAULT_THUMBNAIL } from "@/constants/constants";

import { ImageWrapper, VideoCardContainer } from "./styled";
import { VideoCardProps } from "./types";

const VideoCard: FC<VideoCardProps> = ({ className, data, onClick, width = "315px", variant = "normal-card" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  const matches = useMediaQuery(theme.breakpoints.down("md"));

  const headingVariant: Record<typeof variant, TypographyProps["variant"]> = {
    "featured-card": "h1",
    "normal-card": "h3",
    "related-card": "h5",
    "search-card": "h1",
  };

  const displayDescription = variant === "featured-card" || variant === "search-card";

  const handleMouseEnter = () => {
    if (data.video_file) {
      setIsHovered(true);
      videoRef.current?.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <VideoCardContainer
      $width={width}
      className={clsx(className, { [variant]: true })}
      data-testid="video-card"
      onClick={onClick}
    >
      <CardContent>
        <ImageWrapper
          className="image-wrapper"
          {...(!matches && {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
          })}
        >
          <Skeleton width="100%" height="100%" variant="rounded" animation="wave" />
          <Image
            data-testid="video-card-image"
            alt={data.title}
            height={192}
            width={315}
            src={data.thumbnail || DEFAULT_THUMBNAIL}
          />
          {data.video_file && (
            <video
              className="video-player"
              ref={videoRef}
              src={data.video_file}
              muted
              loop
              playsInline
              style={{ visibility: !isHovered ? "hidden" : "visible" }}
            />
          )}
          <Typography className="video-duration" component="div" data-testid="video-card-duration">
            {data.video_duration}
          </Typography>
        </ImageWrapper>
        <Box className="video-detail">
          <Typography data-testid="video-card-title" variant={headingVariant[variant]} title={data.title}>
            {data.title}
          </Typography>
          <Typography variant="bodyMedium" className="organizer-name" data-testid="video-card-organizer">
            {data.organizer}
          </Typography>
          <Typography variant="bodyMedium" className="date-time" data-testid="video-card-date-time">
            {data.event_time}
          </Typography>
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
