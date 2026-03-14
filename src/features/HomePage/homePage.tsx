"use client";

import { FC } from "react";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const HomePage: FC = () => {
  return (
    <Box data-testid="home-page" width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center">
      <Skeleton variant="rectangular" width={450} height={203} sx={{ borderRadius: "12px" }} />
    </Box>
  );
};

export default HomePage;
