"use client";

import React, { isValidElement, ReactNode } from "react";

import { MainContainer, LeftSidebar, RightSidebar, ContentContainer } from "./styled";

type TMainLayoutContainer = {
  children: React.ReactNode;
  rightSidebar?: ReactNode;
};

const MainLayoutContainer = ({ children, rightSidebar }: TMainLayoutContainer) => {
  return (
    <MainContainer maxWidth="xl">
      <LeftSidebar />
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
  );
};

export default MainLayoutContainer;
