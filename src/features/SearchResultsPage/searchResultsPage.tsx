"use client";

import React, { useEffect, useState } from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "next/navigation";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import SearchVideoCard from "@/components/SearchVideoCard/searchVideoCard";
import Select from "@/components/Select";
import useNavigation from "@/hooks/useNavigation";
import { EventsParams } from "@/models/Events";
import { useLazyGetEventsQuery } from "@/redux/events/apiSlice";
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/utils/constants";
import { convertSecondsToFormattedTime, formatDateTime, fullName, parseNonPassedParams } from "@/utils/utils";

import { FilterBox, NoSearchResultsWrapper, SearchCardLoadingState, SearchResultsContainer } from "./styled";
import { defaultParams } from "./types";

const loaderCards: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const { navigateTo } = useNavigation();

  const [page, setPage] = useState(1);

  const [getEvents, { data: videoListings, isFetching, isLoading, isUninitialized, error }] = useLazyGetEventsQuery();

  const isDataLoading = isFetching || isLoading || isUninitialized;

  const search = searchParams?.get("search");

  useEffect(() => {
    const params: EventsParams = {
      ...defaultParams,
      page,
      search: search || undefined,
      page_size: 10,
    };
    setPage(1);
    const updatedParams = parseNonPassedParams(params) as EventsParams;
    getEvents(updatedParams);
  }, [search, page]);

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

  const renderResults = () => {
    if (error || isDataLoading) {
      return loaderCards.map((_) => (
        <SearchCardLoadingState key={_}>
          <Skeleton width={350} height={208} variant="rounded" animation="wave" />
          <Box>
            <Skeleton width={250} height={30} />
            <br />
            <Skeleton width={100} height={20} />
            <Skeleton width={100} height={20} />
            <br />
            <Skeleton width={250} height={20} />
            <Skeleton width={250} height={20} />
            <Skeleton width={250} height={20} />
          </Box>
        </SearchCardLoadingState>
      ));
    }

    if (videoListings?.results?.length) {
      return videoListings?.results?.map((videoCard) => (
        <SearchVideoCard
          key={videoCard.id}
          width="100%"
          description={videoCard.description}
          event_time={formatDateTime(videoCard.event_time)}
          onClick={() => navigateTo("videoDetail", { id: videoCard.id })}
          organizer={videoCard.presenters.map(fullName).join(", ")}
          thumbnail={videoCard.thumbnail ? BASE_URL.concat(videoCard.thumbnail) : DEFAULT_THUMBNAIL}
          title={videoCard.title}
          video_duration={convertSecondsToFormattedTime(videoCard.video_duration)}
        />
      ));
    }

    return (
      <NoSearchResultsWrapper>
        <Typography variant="h3" component="div">
          No videos found for &apos;{search}&apos;
        </Typography>
      </NoSearchResultsWrapper>
    );
  };

  return (
    <MainLayoutContainer>
      <FilterBox>
        <Stack>
          <Typography variant="h2" component="div">
            Showing search results for &apos;{search}&apos;
          </Typography>
          <Select
            label={"Sort by"}
            menuItems={[
              { value: "", label: "Most Relevant" },
              { value: "", label: "Newest First" },
              { value: "", label: "Most Viewed" },
            ]}
            handleChange={() => {}}
          />
        </Stack>
      </FilterBox>

      <Box width="100%">
        <SearchResultsContainer>{renderResults()}</SearchResultsContainer>
      </Box>
      <div id="load-more-trigger" style={{ height: "10px" }} />
    </MainLayoutContainer>
  );
};

export default SearchResultsPage;
