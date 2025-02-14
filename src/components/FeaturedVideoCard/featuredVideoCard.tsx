import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { FeaturedVideoCardContainer } from "./styled";
import { FeaturedVideoCardProps } from "./types";

const FeaturedVideoCard: FC<FeaturedVideoCardProps> = ({
  className,
  date,
  imgUrl,
  organizerName,
  title,
  description,
  isVisible = false,
  width = "100%",
}) => {
  return isVisible ? (
    <FeaturedVideoCardContainer $width={width} className={className} data-testid="featured-video-card">
      <CardContent>
        <Image alt={title} height={192} width={315} src={imgUrl ?? "/assets/images/temp-youtube-logo.webp"} />
        <Box className="video-detail">
          <Typography variant="h3" component="div" title={title}>
            {title}
          </Typography>
          <Typography variant="body2" className="organizer-name" data-testid="video-card-organizer">
            {organizerName}
          </Typography>
          <Typography variant="body2" className="date-time" data-testid="featured-card-date-time">
            {date}
          </Typography>
          <Typography variant="body2" className="video-description" data-testid="video-description">
            {description}
          </Typography>
        </Box>
      </CardContent>
    </FeaturedVideoCardContainer>
  ) : null;
};

export default FeaturedVideoCard;
