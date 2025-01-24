"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { usePathname } from "next/navigation";

type TMainLayoutContainer = {
  children: React.ReactNode;
};

const MainLayoutContainer = ({ children }: TMainLayoutContainer) => {
  const pathname = usePathname();
  const showRightBar = pathname.includes("/watch");

  return (
    <Container sx={{ height: "100svh" }}>
      <Stack flexDirection="row" height="100%">
        <Box height="100%" width="220px" border="1px solid #ddd"></Box>

        <Box flexGrow={1} height="100%" padding="2px">
          {children}
        </Box>

        {showRightBar && (
          <Box height="100%" width="230px" border="1px solid #ddd">
            <h3>Suggested for You</h3>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default MainLayoutContainer;
