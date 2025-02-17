import React from "react";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import VideoCard from "@/components/VideoCard";

const VideosPage = () => {
  return (
    <MainLayoutContainer>
      <VideoCard title="Some title" date="2025-01-01" organizerName="John Doe" />
    </MainLayoutContainer>
  );
};

export default VideosPage;
