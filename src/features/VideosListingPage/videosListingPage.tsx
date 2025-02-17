"use client";

import React, { useEffect, useState } from "react";

import { faker } from "@faker-js/faker";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import FeaturedVideoCard from "@/components/FeaturedVideoCard";
import { FeaturedVideoCardProps } from "@/components/FeaturedVideoCard/types";
import Select from "@/components/Select";
import VideoCard from "@/components/VideoCard";
import { VideoCardProps } from "@/components/VideoCard/types";

import { FilterBox, TagsContainer, VideoListingContainer } from "./styled";

const filterTitles: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const selectMenuItems: string[] = Array(3)
  .fill("")
  .map(() => faker.lorem.words(1));

const VideosListingPage = () => {
  const [selectedTitle, setSelectedTitle] = useState("");

  const featuredVideoCard: FeaturedVideoCardProps = {
    isVisible: true,
    date: format(faker.date.past(), "MMM dd, yyyy"),
    description: faker.lorem.words(20),
    imgUrl: "/assets/images/temp-youtube-logo.webp",
    title: faker.lorem.words(10),
    organizerName: faker.lorem.words(10),
  };

  const videoCards: VideoCardProps[] = Array(10)
    .fill("")
    .map(() => ({
      date: format(faker.date.past(), "MMM dd, yyyy"),
      imgUrl: "/assets/images/temp-youtube-logo.webp",
      title: faker.lorem.words(10),
      organizerName: faker.lorem.words(10),
    }));

  // TODO: remove this when we have data from the api
  useEffect(() => {
    setSelectedTitle(filterTitles[0]);
  }, []);

  return (
    <MainLayoutContainer>
      <FilterBox>
        <Stack>
          <Typography variant="h2" component="div" title={selectedTitle}>
            {selectedTitle}
          </Typography>
          <Select label={"Sort by"} menuItems={selectMenuItems} handleChange={() => {}} />
        </Stack>
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

      <FeaturedVideoCard {...featuredVideoCard} />

      <VideoListingContainer>
        {videoCards.map((videoCard, index) => (
          <VideoCard key={index} {...videoCard} />
        ))}
      </VideoListingContainer>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
