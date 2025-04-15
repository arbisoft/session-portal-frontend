"use client";

import { FC } from "react";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import useAuth from "@/hooks/useAuth";

const HomePage: FC = () => {
  useAuth();

  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center">
      <Skeleton variant="rectangular" width={450} height={203} sx={{ borderRadius: "12px" }} />
    </Box>
  );
};

export default HomePage;
