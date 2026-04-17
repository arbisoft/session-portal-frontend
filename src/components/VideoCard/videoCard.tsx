import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import { useColorScheme } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

import { DEFAULT_THUMBNAIL } from "@/constants/constants";
import { BLUR_DATA_URI } from "@/constants/images";

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

  const headingVariant: Record<typeof variant, TypographyProps["variant"]> = {
    "featured-card": "h1",
    "normal-card": "h3",
    "related-card": "h5",
    "search-card": "h1",
  };

  const displayDescription = variant === "featured-card" || variant === "search-card";

  const responsiveImageSizes: Record<typeof variant, string> = {
    "featured-card": "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 315px",
    "normal-card": "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 315px",
    "related-card": "(max-width: 600px) 100vw, (max-width: 1200px) 33vw, 315px",
    "search-card": "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 315px",
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
          {/* Thumbnail image */}
          <Image
            data-testid="video-card-image"
            alt={data.title}
            height={196}
            width={315}
            src={data.thumbnail || DEFAULT_THUMBNAIL}
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URI}
            sizes={responsiveImageSizes[variant]}
            style={{ borderRadius: "8px" }}
          />
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

export default React.memo(VideoCard);
