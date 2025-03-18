"use client";

import React, { useEffect, useState } from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import FeaturedVideoCard from "@/components/FeaturedVideoCard";
import Select from "@/components/Select";
import VideoCard from "@/components/VideoCard";
import useNavigation from "@/hooks/useNavigation";
import { Event, TAllEventsPyaload } from "@/models/Events";
import { useGetEventsQuery } from "@/redux/events/apiSlice";
import { BASE_URL } from "@/utils/constants";
import { convertSecondsToFormattedTime, formatDateTime, parseNonPassedParams } from "@/utils/utils";

import { FilterBox, VideoListingContainer } from "./styled";
import { defaultParams } from "./types";

const selectMenuItems: string[] = Array(3)
  .fill("")
  .map(() => faker.lorem.words(1));

const loaderCards: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const VideosListingPage = () => {
  const searchParams = useSearchParams();
  const { navigateTo } = useNavigation();

  const [requestParams, setRequestParams] = useState<TAllEventsPyaload>(defaultParams);
  const { data: videoListings, isFetching, isLoading, isUninitialized, error } = useGetEventsQuery(requestParams);

  const isDataLoading = isFetching || isLoading || isUninitialized;

  const tag = searchParams?.get("tag");
  const search = searchParams?.get("search");
  const playlist = searchParams?.get("playlist");

  useEffect(() => {
    setRequestParams((prev) => {
      const apiParams = { ...prev };
      if (search) {
        apiParams.tag = "";
        apiParams.playlist = "";
        apiParams.search = search;
      }
      apiParams.playlist = playlist ?? "";
      apiParams.tag = tag ?? "";
      const updatedParams = parseNonPassedParams(apiParams) as TAllEventsPyaload;
      return updatedParams;
    });
  }, [searchParams]);

  const featuredVideos = videoListings?.results.filter((video) => video.is_featured) || [];
  const latestFeaturedVideo =
    featuredVideos?.sort((a, b) => parseISO(b.event_time).getTime() - parseISO(a.event_time).getTime())[0] || null;
  const listedVideos = latestFeaturedVideo
    ? videoListings?.results.filter((video: Event) => video.id !== latestFeaturedVideo.id)
    : videoListings?.results;

  return (
    <MainLayoutContainer>
      <FilterBox>
        <Stack>
          <Typography variant="h2" component="div">
            {(tag || playlist) ?? "All"}
          </Typography>
          <Select label={"Sort by"} menuItems={selectMenuItems} handleChange={() => {}} />
        </Stack>
      </FilterBox>

      <FeaturedVideoCard isVisible={!!latestFeaturedVideo} {...latestFeaturedVideo} />

      <Box width="100%">
        <VideoListingContainer>
          {error || isDataLoading
            ? loaderCards.map((_) => (
                <Box key={_}>
                  <Skeleton width="100%" height={192} variant="rounded" animation="wave" />
                  <Skeleton width="50%" height={30} />
                  <Skeleton width="30%" height={30} />
                </Box>
              ))
            : listedVideos?.map((videoCard) => {
                return (
                  <VideoCard
                    data={{
                      event_time: formatDateTime(videoCard.event_time),
                      organizer: videoCard.workstream_id,
                      thumbnail: `${BASE_URL}/${videoCard.thumbnail}`,
                      title: videoCard.title,
                      video_duration: convertSecondsToFormattedTime(videoCard.video_duration),
                    }}
                    key={videoCard.id}
                    onClick={() => navigateTo("videoDetail", { id: videoCard.id })}
                    width="100%"
                  />
                );
              })}
        </VideoListingContainer>
      </Box>
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
