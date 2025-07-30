import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const SkeletonLoader = () => (
  <div data-testid="video-player-skeleton">
    <Skeleton width="100%" height={400} variant="rounded" animation="wave" />
    <Box display="flex" justifyContent="space-between" width="100%">
      <Skeleton width="50%" height={70} />
      <Skeleton width="30%" height={70} />
    </Box>
    <Skeleton width="30%" height={50} />
    <Skeleton width="100%" height={200} />
  </div>
);

export default SkeletonLoader;
