import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import { VideoListingContainer } from "./styled";
import { SkeletonLoaderProps } from "./types";

const SkeletonLoader = ({ count = 5 }: SkeletonLoaderProps) => {
  const loaderCards = Array.from({ length: count });

  return (
    <VideoListingContainer>
      <Box className="skeleton-loader">
        {loaderCards.map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton width="100%" height={192} variant="rounded" animation="wave" />
            <Skeleton width="50%" height={30} />
            <Skeleton width="30%" height={30} />
          </Box>
        ))}
      </Box>
    </VideoListingContainer>
  );
};

export default SkeletonLoader;
