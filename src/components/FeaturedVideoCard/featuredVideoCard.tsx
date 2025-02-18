import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { formatDateTime, trimTextLength } from "@/utils/utils";

import { FeaturedVideoCardContainer } from "./styled";
import { FeaturedVideoCardProps } from "./types";

const FeaturedVideoCard: FC<FeaturedVideoCardProps> = ({
  className,
  event_time,
  thumbnail,
  workstream_id,
  title,
  description,
  isVisible = false,
  width = "100%",
}) => {
  const inAppThumbnail = `http://localhost:8000/${thumbnail}`;

  return isVisible ? (
    <FeaturedVideoCardContainer $width={width} className={className} data-testid="video-card">
      <CardContent>
        <Image alt={title} height={192} width={315} src={thumbnail ? inAppThumbnail : "/assets/images/temp-youtube-logo.webp"} />
        <Box className="video-detail">
          <Typography variant="h3" component="div" title={title}>
            {trimTextLength(title, 70)}
          </Typography>
          <Typography variant="body2" className="organizer-name" data-testid="video-card-organizer">
            {workstream_id}
          </Typography>
          <Typography variant="body2" className="date-time" data-testid="video-card-date-time">
            {formatDateTime(event_time)}
          </Typography>
          <Typography variant="body2" className="video-description" data-testid="video-description">
            {trimTextLength(description, 200)}
          </Typography>
        </Box>
      </CardContent>
    </FeaturedVideoCardContainer>
  ) : null;
};

export default FeaturedVideoCard;
