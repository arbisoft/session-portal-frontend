"use client";

import React, { isValidElement, ReactNode, useState } from "react";

import Box from "@mui/material/Box";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar/sidebar";
import useAuth from "@/hooks/useAuth";

import { MainContainer, SidebarWidth, LeftSidebar, RightSidebar, ContentContainer, StyledDrawer } from "./styled";

type TMainLayoutContainer = {
  children: React.ReactNode;
  isLeftSidebarVisible?: boolean;
  rightSidebar?: ReactNode;
  shouldShowDrawer?: boolean;
};

const MainLayoutContainer = ({
  children,
  rightSidebar,
  isLeftSidebarVisible = true,
  shouldShowDrawer = false,
}: TMainLayoutContainer) => {
  useAuth();
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <Box sx={{ height: "100vh" }}>
      <Navbar onDrawerToggle={toggleDrawer(!open)} shouldShowDrawer={shouldShowDrawer} />
      {isLeftSidebarVisible && (
        <LeftSidebar data-testid="left-sidebar">
          <Sidebar />
        </LeftSidebar>
      )}
      <MainContainer maxWidth="xl" isSidebarAvailable={isLeftSidebarVisible}>
        {shouldShowDrawer && (
          <StyledDrawer open={open} onClose={toggleDrawer(false)} data-testid="drawer">
            <Box sx={{ width: SidebarWidth, p: 1 }} role="presentation" onClick={toggleDrawer(false)}>
              <Sidebar />
            </Box>
          </StyledDrawer>
        )}

        <ContentContainer>
          <Box width="100%" height="100%">
            {children}
          </Box>
        </ContentContainer>
        {isValidElement(rightSidebar) && (
          <RightSidebar sx={{ display: { xs: "none", md: "block" } }} data-testid="right-sidebar">
            {rightSidebar}
          </RightSidebar>
        )}
      </MainContainer>
    </Box>
  );
};

export default MainLayoutContainer;
