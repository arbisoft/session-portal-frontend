import { FC } from "react";

import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import Image from "next/image";

import { RecommendedVideoCardContainer } from "./styled";
import { RecommendedVideoCardProps } from "./types";

const RecommendedVideoCard: FC<RecommendedVideoCardProps> = ({
  className,
  date,
  duration,
  imgUrl,
  ratingValue,
  title,
  width = "100%",
}) => {
  return (
    <RecommendedVideoCardContainer $width={width} className={className} data-testid="recommended-video-card">
      <CardContent>
        <Image alt={title} height={72} src={imgUrl ?? "/assets/images/temp-youtube-logo.webp"} width={113} />
        <Box className="video-detail">
          <Typography variant="h5" component="div" title={title}>
            {title}
          </Typography>
          <Typography variant="bodySmall" className="date-time" data-testid="date-time">
            {date} <span>/ {duration}</span>
          </Typography>
          <Rating readOnly size="small" value={ratingValue} emptyIcon={<StarIcon fontSize="inherit" />} />
        </Box>
      </CardContent>
    </RecommendedVideoCardContainer>
  );
};

export default RecommendedVideoCard;
