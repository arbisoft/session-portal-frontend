"use client";

import React, { isValidElement, ReactNode, useState } from "react";

import Box from "@mui/material/Box";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar/sidebar";
import useAuth from "@/hooks/useAuth";

import { MainContainer, LeftSidebar, RightSidebar, ContentContainer, StyledDrawer } from "./styled";

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
    <>
      <Navbar onDrawerToggle={toggleDrawer(!open)} shouldShowDrawer={shouldShowDrawer} />
      <MainContainer maxWidth="xl">
        {shouldShowDrawer && (
          <StyledDrawer open={open} onClose={toggleDrawer(false)} data-testid="drawer">
            <Box sx={{ width: 250, p: 1 }} role="presentation" onClick={toggleDrawer(false)}>
              <Sidebar />
            </Box>
          </StyledDrawer>
        )}
        {isLeftSidebarVisible && (
          <LeftSidebar data-testid="left-sidebar">
            <Sidebar />
          </LeftSidebar>
        )}
        <ContentContainer container>
          <Box width="100%">{children}</Box>
        </ContentContainer>
        {isValidElement(rightSidebar) && (
          <RightSidebar sx={{ display: { xs: "none", md: "block" } }} data-testid="right-sidebar">
            {rightSidebar}
          </RightSidebar>
        )}
      </MainContainer>
    </>
  );
};

export default MainLayoutContainer;
