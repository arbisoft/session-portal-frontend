import React, { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import useNavigation from "@/hooks/useNavigation";
import { DEFAULT_THUMBNAIL } from "@/utils/constants";
import { convertSecondsToFormattedTime, formatDateTime, trimTextLength } from "@/utils/utils";

import { SearchVideoCardContainer, ImageContainerBox } from "./styled";
import { SearchVideoCardProps } from "./types";

const SearchVideoCard: FC<SearchVideoCardProps> = ({
  id,
  className,
  event_time,
  thumbnail,
  workstream_id,
  title,
  description,
  video_duration,
  width = "100%",
}) => {
  const inAppThumbnail = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/${thumbnail}`;
  const { navigateTo } = useNavigation();

  return (
    <SearchVideoCardContainer
      $width={width}
      className={className}
      data-testid="search-video-card"
      onClick={() => navigateTo("videoDetail", { id })}
    >
      <CardContent>
        <ImageContainerBox>
          <Image alt={title} height={192} width={315} src={thumbnail ? inAppThumbnail : DEFAULT_THUMBNAIL} />
          <Typography data-testid="video-duration" className="video-duration" component="div">
            {convertSecondsToFormattedTime(video_duration)}
          </Typography>
        </ImageContainerBox>

        <Box className="video-detail">
          <Typography variant="h3" component="div" title={title}>
            {trimTextLength(title, 70)}
          </Typography>
          <Typography className="organizer-name" data-testid="video-card-organizer">
            {workstream_id}
          </Typography>
          <Typography variant="bodySmall" className="date-time" data-testid="video-card-date-time">
            {event_time ? formatDateTime(event_time) : null}
          </Typography>
          {description && (
            <Typography variant="bodySmall" className="video-description" data-testid="video-description">
              {trimTextLength(description, 250)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </SearchVideoCardContainer>
  );
};

export default SearchVideoCard;
