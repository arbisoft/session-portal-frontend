import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { SearchVideoCardContainer, ImageContainerBox } from "./styled";
import { SearchVideoCardProps } from "./types";

const SearchVideoCard: FC<SearchVideoCardProps> = ({
  className,
  description,
  event_time,
  onClick,
  organizer,
  thumbnail,
  title,
  video_duration,
  width = "100%",
}) => {
  return (
    <SearchVideoCardContainer $width={width} className={className} data-testid="search-video-card" onClick={onClick}>
      <CardContent>
        <ImageContainerBox>
          <Image alt={title} height={192} width={315} src={thumbnail} />
          <Typography data-testid="video-duration" className="video-duration" component="div">
            {video_duration}
          </Typography>
        </ImageContainerBox>

        <Box className="video-detail">
          <Typography variant="h3" component="div" title={title}>
            {title}
          </Typography>
          <Typography className="organizer-name" data-testid="video-card-organizer">
            {organizer}
          </Typography>
          <Typography variant="bodySmall" className="date-time" data-testid="video-card-date-time">
            {event_time}
          </Typography>
          {description && (
            <Typography variant="bodySmall" className="video-description" data-testid="video-description">
              {description}
            </Typography>
          )}
        </Box>
      </CardContent>
    </SearchVideoCardContainer>
  );
};

export default SearchVideoCard;
