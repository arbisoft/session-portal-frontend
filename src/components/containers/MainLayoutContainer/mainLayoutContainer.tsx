"use client";

import React, { isValidElement, ReactNode, useState } from "react";

import Box from "@mui/material/Box";
import { ContainerOwnProps } from "@mui/material/Container";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar/sidebar";
import useAuth from "@/hooks/useAuth";

import { MainContainer, SidebarWidth, LeftSidebar, RightSidebar, ContentContainer, StyledDrawer } from "./styled";

type TMainLayoutContainer = {
  children: React.ReactNode;
  isLeftSidebarVisible?: boolean;
  rightSidebar?: ReactNode;
  shouldShowDrawer?: boolean;
  maxWidth?: ContainerOwnProps["maxWidth"];
};

const MainLayoutContainer = ({
  children,
  rightSidebar,
  isLeftSidebarVisible = true,
  shouldShowDrawer = false,
  maxWidth = "xl",
}: TMainLayoutContainer) => {
  useAuth();
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);

  return (
    <Box sx={{ height: "100vh" }}>
      <Navbar onDrawerToggle={toggleDrawer(!open)} shouldShowDrawer={shouldShowDrawer} isDrawerOpen={open} />
      {isLeftSidebarVisible && (
        <LeftSidebar data-testid="left-sidebar">
          <Sidebar />
        </LeftSidebar>
      )}
      <MainContainer maxWidth={maxWidth} isSidebarAvailable={isLeftSidebarVisible}>
        {shouldShowDrawer && (
          <StyledDrawer
            id="sidebar-drawer"
            open={open}
            onClose={toggleDrawer(false)}
            data-testid="drawer"
            role="complementary"
            aria-label="Sidebar navigation"
          >
            <Box
              sx={{ width: SidebarWidth, p: 1 }}
              role="presentation"
              onClick={toggleDrawer(false)}
              onKeyDown={(event) => {
                // Allow closing drawer via keyboard (Escape)
                if (event.key === "Escape") setOpen(false);
              }}
            >
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
