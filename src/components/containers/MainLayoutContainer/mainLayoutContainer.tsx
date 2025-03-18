"use client";

import React, { isValidElement, ReactNode } from "react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar/sidebar";
import useAuth from "@/hooks/useAuth";

import { MainContainer, LeftSidebar, RightSidebar, ContentContainer } from "./styled";

type TMainLayoutContainer = {
  children: React.ReactNode;
  isLeftSidebarVisible?: boolean;
  rightSidebar?: ReactNode;
};

const MainLayoutContainer = ({ children, rightSidebar, isLeftSidebarVisible = true }: TMainLayoutContainer) => {
  useAuth();

  return (
    <>
      <Navbar />
      <MainContainer maxWidth="xl">
        {isLeftSidebarVisible && (
          <LeftSidebar data-testid="left-sidebar">
            <Sidebar />
          </LeftSidebar>
        )}
        <ContentContainer container>{children}</ContentContainer>
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
