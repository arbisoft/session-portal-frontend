"use client";

import React, { useEffect, useState } from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import FeaturedVideoCard from "@/components/FeaturedVideoCard";
import Select from "@/components/Select";
import VideoCard from "@/components/VideoCard";
import { Tag } from "@/models/Events";
import { useAllEventsQuery, useEventTagsQuery } from "@/redux/events/apiSlice";
import { TAllEventsPyaload } from "@/redux/events/types";
import useLanguage from "@/services/i18n/use-language";

import { FilterBox, TagsContainer, VideoListingContainer } from "./styled";
import { defaultParams, defaultTag } from "./types";

const selectMenuItems: string[] = Array(3)
  .fill("")
  .map(() => faker.lorem.words(1));

const loaderCards: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const VideosListingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useLanguage();
  const [selectedTag, setSelectedTag] = useState<Tag>();
  const [requestParams, setRequestParams] = useState<TAllEventsPyaload>(defaultParams);
  const { data: videoListings, isFetching, isLoading, isUninitialized, error } = useAllEventsQuery(requestParams);

  const { data: tags } = useEventTagsQuery();

  const isDataLoading = isFetching || isLoading || isUninitialized;

  useEffect(() => {
    const tagId = searchParams.get("tag") as string;
    const tag = tags?.find((t) => String(t.id) === tagId) || defaultTag;
    setSelectedTag(tag);
    setRequestParams((prev) => {
      return tagId ? { ...prev, tag: tag.name } : { ...prev };
    });
  }, [searchParams]);

  const featuredVideos = videoListings?.results.filter((video) => video.is_featured) || [];
  const latestFeaturedVideo =
    featuredVideos?.sort((a, b) => parseISO(b.event_time).getTime() - parseISO(a.event_time).getTime())[0] || null;

  return (
    <MainLayoutContainer>
      <FilterBox>
        <Stack>
          <Typography variant="h2" component="div" title={selectedTag?.name}>
            {selectedTag?.name}
          </Typography>
          <Select label={"Sort by"} menuItems={selectMenuItems} handleChange={() => {}} />
        </Stack>
        <TagsContainer>
          <Chip
            onClick={() => router.push(`/${language}/videos`)}
            variant={selectedTag?.id === 0 ? "filled" : "outlined"}
            label="All"
            size="small"
          />
          {tags?.map((tag) => (
            <Chip
              key={tag.id}
              onClick={() => router.push(`/${language}/videos?tag=${tag.id}`)}
              label={tag.name}
              variant={selectedTag?.id === tag.id ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </TagsContainer>
      </FilterBox>

      <FeaturedVideoCard isVisible={!!latestFeaturedVideo} {...latestFeaturedVideo} />

      <Box>
        <VideoListingContainer>
          {error || isDataLoading
            ? loaderCards.map((_) => (
                <Box key={_}>
                  <Skeleton width={315} height={245} variant="rounded" animation="wave" />
                  <Skeleton width="50%" height={30} />
                  <Skeleton width="30%" height={30} />
                </Box>
              ))
            : videoListings?.results.map((videoCard) => <VideoCard key={videoCard.id} {...videoCard} />)}
        </VideoListingContainer>
      </Box>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
