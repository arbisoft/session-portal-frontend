"use client";

import React, { useState } from "react";

import { faker } from "@faker-js/faker";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import VideoCard from "@/components/VideoCard";
import { VideoCardProps } from "@/components/VideoCard/types";

import { FilterBox, TagsContainer, VideoListingContainer } from "./styled";

const filterTitles: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const VideosListingPage = () => {
  const [selectedTitle, setSelectedTitle] = useState("");
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
      <FilterBox>
        <Typography variant="h2" component="div" title={selectedTitle}>
          {selectedTitle}
        </Typography>
        <TagsContainer>
          {filterTitles.map((title) => (
            <Chip
              key={title}
              label={title}
              size="small"
              variant={selectedTitle === title ? "filled" : "outlined"}
              onClick={() => setSelectedTitle(title)}
            />
          ))}
        </TagsContainer>
      </FilterBox>
      <VideoListingContainer>
        {videoCards.map((videoCard, index) => (
          <VideoCard key={index} {...videoCard} />
        ))}
      </VideoListingContainer>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
