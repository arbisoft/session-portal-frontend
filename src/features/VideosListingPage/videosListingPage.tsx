"use client";

import React, { useEffect, useState } from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "next/navigation";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import Select from "@/components/Select";
import VideoCard from "@/components/VideoCard";
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { EventsParams } from "@/models/Events";
import { useGetEventsQuery, useLazyGetEventsQuery } from "@/redux/events/apiSlice";
import { convertSecondsToFormattedTime, formatDateTime, fullName, generateYearList, parseNonPassedParams } from "@/utils/utils";

import { FilterBox, VideoListingContainer } from "./styled";
import { defaultParams } from "./types";

const loaderCards: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const VideosListingPage = () => {
  const searchParams = useSearchParams();
  const { navigateTo } = useNavigation();

  const [page, setPage] = useState(1);

  const {
    data: featureVideos,
    isFetching: isFeatureFetching,
    isLoading: isFeatureLoading,
    isUninitialized: isFeatureUninitialized,
  } = useGetEventsQuery({ ...defaultParams, is_featured: true, page_size: 1 });

  const [getEvents, { data: videoListings, isFetching, isLoading, isUninitialized, error }] = useLazyGetEventsQuery();

  const isDataLoading = isFetching || isLoading || isUninitialized;
  const isFeatureVideoLoading = isFeatureFetching || isFeatureLoading || isFeatureUninitialized;

  const tag = searchParams?.get("tag");
  const search = searchParams?.get("search");
  const playlist = searchParams?.get("playlist");

  useEffect(() => {
    const params: EventsParams = {
      ...defaultParams,
      is_featured: false,
      page,
      playlist: search ? "" : (playlist ?? ""),
      search: search || undefined,
      tag: search ? "" : (tag ?? ""),
      page_size: 12,
    };
    setPage(1);
    const updatedParams = parseNonPassedParams(params) as EventsParams;
    getEvents(updatedParams);
  }, [tag, search, playlist, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && videoListings?.next) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    const target = document.getElementById("load-more-trigger");
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [isFetching, videoListings?.next]);

  const latestFeaturedVideo = featureVideos?.results[0];

  return (
    <MainLayoutContainer>
      <FilterBox>
        <Stack>
          <Typography variant="h2" component="div">
            {(tag ? `#${tag}` : playlist) ?? "All"}
          </Typography>
          <Select
            label={"Sort by"}
            menuItems={[
              { value: "newest-to-oldest", label: "Newest to Oldest" },
              ...generateYearList(2020).map((year) => ({ value: year, label: year })),
            ]}
            value="newest-to-oldest"
          />
        </Stack>
      </FilterBox>

      {!tag && !playlist && (
        <>
          {isFeatureVideoLoading ? (
            <Skeleton width="100%" height={264} variant="rounded" />
          ) : (
            <>
              {latestFeaturedVideo && (
                <VideoCard
                  data={{
                    description: latestFeaturedVideo.description,
                    event_time: formatDateTime(latestFeaturedVideo.event_time),
                    organizer: latestFeaturedVideo.presenters.map(fullName).join(", "),
                    thumbnail: latestFeaturedVideo.thumbnail ? BASE_URL.concat(latestFeaturedVideo.thumbnail) : DEFAULT_THUMBNAIL,
                    title: latestFeaturedVideo.title,
                    video_duration: convertSecondsToFormattedTime(latestFeaturedVideo.video_duration),
                  }}
                  onClick={() => navigateTo("videoDetail", { id: latestFeaturedVideo.id })}
                  variant="featured-card"
                  width="100%"
                />
              )}
            </>
          )}
        </>
      )}

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
            : videoListings.results?.map((videoCard) => {
                return (
                  <VideoCard
                    data={{
                      event_time: formatDateTime(videoCard.event_time),
                      organizer: videoCard.presenters.map(fullName).join(", "),
                      thumbnail: videoCard.thumbnail ? BASE_URL.concat(videoCard.thumbnail) : DEFAULT_THUMBNAIL,
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
      <div id="load-more-trigger" style={{ height: "10px" }} />
    </MainLayoutContainer>
  );
};

export default VideosListingPage;
