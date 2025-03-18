import { FC } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { ImageContainer, RecommendedVideoCardContainer } from "./styled";
import { RecommendedVideoCardProps } from "./types";

const RecommendedVideoCard: FC<RecommendedVideoCardProps> = ({
  className,
  date,
  duration,
  imgUrl,
  title,
  width = "100%",
  onClick,
}) => {
  return (
    <RecommendedVideoCardContainer $width={width} className={className} data-testid="recommended-video-card" onClick={onClick}>
      <CardContent>
        <ImageContainer className="image-container">
          <Image alt={title} height={72} src={imgUrl} width={113} />
          <Typography variant="bodySmall" className="duration" data-testid="duration">
            {duration}
          </Typography>
        </ImageContainer>
        <Box className="video-detail">
          <Typography variant="h5" component="div" title={title}>
            {title}
          </Typography>
          <Typography variant="bodySmall" className="date-time" data-testid="date-time">
            {date}
          </Typography>
        </Box>
      </CardContent>
    </RecommendedVideoCardContainer>
  );
};

export default RecommendedVideoCard;
