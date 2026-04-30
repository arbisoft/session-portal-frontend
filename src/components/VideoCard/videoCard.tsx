import React, { FC, useRef, useState } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import { useColorScheme, useTheme } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import clsx from "clsx";
import Link from "next/link";

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
  href,
}) => {
  const { mode } = useColorScheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));

  const [isHovered, setIsHovered] = useState(false);

  const headingVariant: Record<typeof variant, TypographyProps["variant"]> = {
    "featured-card": "h1",
    "normal-card": "h3",
    "related-card": "h5",
    "search-card": "h1",
  };

  const displayDescription = variant === "featured-card" || variant === "search-card";

  const handleMouseEnter = async () => {
    if (data.video_file && videoRef.current) {
      setIsHovered(true);
      const video = videoRef.current;

      try {
        if (video.paused) {
          await video.play();
        }
      } catch (err) {
        console.warn("Video play interrupted:", err);
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      setIsHovered(false);
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <VideoCardContainer
      as="article"
      $width={width}
      $height={height}
      className={clsx(className, { [variant]: true })}
      data-testid="video-card"
      onClick={onClick}
      variant={mode === "light" && variant === "featured-card" ? "outlined" : undefined}
      elevation={0}
      role="group"
      aria-label={`Video card: ${data.title}`}
      tabIndex={-1}
    >
      <CardContent
        component={Link}
        href={href}
        aria-label={`Open video: ${data.title}`}
        sx={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
        }}
        role="link"
      >
        <ImageWrapper className="image-wrapper">
          {/* Decorative skeleton placeholder */}
          <Skeleton width="100%" height="100%" variant="rounded" animation="wave" aria-hidden="true" />

          {/* Thumbnail image */}
          <img
            data-testid="video-card-image"
            alt={data.title}
            height={196}
            width={315}
            src={data.thumbnail || DEFAULT_THUMBNAIL}
            loading="lazy"
            style={{ borderRadius: "8px" }}
          />
          {data.video_file && (
            <video
              className="video-player"
              ref={videoRef}
              src={data.video_file}
              muted
              loop
              playsInline
              preload="metadata"
              style={{ visibility: !isHovered ? "hidden" : "visible" }}
            />
          )}
          {/* Video duration — visually small but needs screen reader context */}
          {data.video_duration && (
            <Typography
              className="video-duration"
              component="div"
              data-testid="video-card-duration"
              aria-label={`Duration ${data.video_duration}`}
            >
              {data.video_duration}
            </Typography>
          )}
        </ImageWrapper>

        <Box className="video-detail">
          {/* Use semantic heading for title */}
          <Typography data-testid="video-card-title" variant={headingVariant[variant]} title={data.title} tabIndex={-1}>
            {data.title}
          </Typography>

          <Box>
            <Typography
              variant="bodyMedium"
              color="textSecondary"
              className="organizer-name"
              data-testid="video-card-organizer"
              title={data.organizer}
              aria-label={`Organizer: ${data.organizer}`}
            >
              {data.organizer}
            </Typography>

            <Typography
              variant="bodyMedium"
              color="textSecondary"
              className="date-time"
              data-testid="video-card-date-time"
              aria-label={`Event time: ${data.event_time}`}
            >
              {data.event_time}
            </Typography>
          </Box>

          {displayDescription && data.description && (
            <Typography
              variant="bodyLarge"
              className="video-description"
              data-testid="video-description"
              aria-label={`Description: ${data.description}`}
            >
              {data.description}
            </Typography>
          )}
        </Box>
      </CardContent>
    </VideoCardContainer>
  );
};

export default VideoCard;
