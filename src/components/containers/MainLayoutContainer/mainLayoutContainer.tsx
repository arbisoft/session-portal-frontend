"use client";

import React, { isValidElement, ReactNode } from "react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar/sidebar";

import { MainContainer, LeftSidebar, RightSidebar, ContentContainer } from "./styled";

type TMainLayoutContainer = {
  children: React.ReactNode;
  rightSidebar?: ReactNode;
};

const MainLayoutContainer = ({ children, rightSidebar }: TMainLayoutContainer) => {
  return (
    <>
      <Navbar />
      <MainContainer maxWidth="xl">
        <LeftSidebar>
          <Sidebar />
        </LeftSidebar>
        <ContentContainer container>{children}</ContentContainer>
        {isValidElement(rightSidebar) && (
          <RightSidebar
            // Hide on small screens
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {rightSidebar}
          </RightSidebar>
        )}
      </MainContainer>
    </>
  );
};

export default MainLayoutContainer;
