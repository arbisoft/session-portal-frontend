"use client";

import React from "react";

import { faker } from "@faker-js/faker";
import { format } from "date-fns";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import VideoCard from "@/components/VideoCard";
import { VideoCardProps } from "@/components/VideoCard/types";

import { VideoListingContainer } from "./styled";

const VideosListingPage = () => {
  const videoCards: VideoCardProps[] = Array(10)
    .fill("")
    .map(() => ({
      date: format(faker.date.past(), "MMM dd, yyyy"),
      imgUrl: "/assets/images/temp-youtube-logo.webp",
      title: faker.lorem.words(10),
      organizerName: faker.lorem.words(10),
    }));

  return (
    <MainLayoutContainer>
      <VideoListingContainer>
        {videoCards.map((videoCard, index) => (
          <VideoCard key={index} {...videoCard} />
        ))}
      </VideoListingContainer>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
