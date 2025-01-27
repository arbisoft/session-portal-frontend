"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  ContentContainer,
  MainContainer,
  MainStack,
  RightBarContainer,
  SidebarContainer,
} from "@/components/layout/MainLayoutContainer.styled";

type TMainLayoutContainer = {
  children: React.ReactNode;
};

const MainLayoutContainer = ({ children }: TMainLayoutContainer) => {
  const pathname = usePathname();
  const showRightBar = pathname.includes("/");

  return (
    <MainContainer>
      <MainStack>
        <SidebarContainer></SidebarContainer>

        <ContentContainer>{children}</ContentContainer>

        {showRightBar && (
          <RightBarContainer>
            <h3>Suggested for You</h3>
          </RightBarContainer>
        )}
      </MainStack>
    </MainContainer>
  );
};

export default MainLayoutContainer;
