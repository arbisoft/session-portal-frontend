import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import useNavigation from "@/hooks/useNavigation";
import { convertSecondsToFormattedTime, formatDateTime, trimTextLength } from "@/utils/utils";

import { FeaturedVideoCardContainer, ImageContainerBox } from "./styled";
import { FeaturedVideoCardProps } from "./types";

const FeaturedVideoCard: FC<FeaturedVideoCardProps> = ({
  id,
  className,
  event_time,
  thumbnail,
  workstream_id,
  title,
  description,
  isVisible = false,
  video_duration,
  width = "100%",
}) => {
  const inAppThumbnail = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/${thumbnail}`;
  const { navigateTo } = useNavigation();

  return isVisible ? (
    <FeaturedVideoCardContainer
      $width={width}
      className={className}
      data-testid="video-card"
      onClick={() => navigateTo("videoDetail", { id })}
    >
      <CardContent>
        <ImageContainerBox>
          <Image
            alt={title}
            height={192}
            width={315}
            src={thumbnail ? inAppThumbnail : "/assets/images/temp-youtube-logo.webp"}
          />
          <Typography variant="body2" component="div">
            {convertSecondsToFormattedTime(video_duration)}
          </Typography>
        </ImageContainerBox>

        <Box className="video-detail">
          <Typography variant="h3" component="div" title={title}>
            {trimTextLength(title, 70)}
          </Typography>
          <Typography variant="body2" className="organizer-name" data-testid="video-card-organizer">
            {workstream_id}
          </Typography>
          <Typography variant="body2" className="date-time" data-testid="video-card-date-time">
            {event_time ? formatDateTime(event_time) : null}
          </Typography>
          {description && (
            <Typography variant="body2" className="video-description" data-testid="video-description">
              {trimTextLength(description, 200)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </FeaturedVideoCardContainer>
  ) : null;
};

export default FeaturedVideoCard;
