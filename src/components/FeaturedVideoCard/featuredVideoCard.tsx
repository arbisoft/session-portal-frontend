import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { FeaturedVideoCardContainer, ImageContainerBox } from "./styled";
import { FeaturedVideoCardProps } from "./types";

const FeaturedVideoCard: FC<FeaturedVideoCardProps> = ({
  className,
  event_time,
  thumbnail,
  title,
  description,
  video_duration,
  width = "100%",
  onClick,
  organizer,
}) => {
  return (
    <FeaturedVideoCardContainer $width={width} className={className} data-testid="video-card" onClick={onClick}>
      <CardContent>
        <ImageContainerBox>
          <Image alt={title} height={192} width={315} src={thumbnail} />
          <Typography data-testid="video-duration" className="video-duration" component="div">
            {video_duration}
          </Typography>
        </ImageContainerBox>

        <Box className="video-detail">
          <Typography variant="h1" component="div" title={title}>
            {title}
          </Typography>
          <Typography className="organizer-name" data-testid="video-card-organizer">
            {organizer}
          </Typography>
          <Typography variant="bodySmall" className="date-time" data-testid="video-card-date-time">
            {event_time}
          </Typography>
          {description && (
            <Typography variant="bodyLarge" className="video-description" data-testid="video-description">
              {description}
            </Typography>
          )}
        </Box>
      </CardContent>
    </FeaturedVideoCardContainer>
  );
};

export default FeaturedVideoCard;
