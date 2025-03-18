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
import { TAllEventsPyaload } from "@/models/Events";
import { useGetEventsQuery } from "@/redux/events/apiSlice";
import { parseNonPassedParams } from "@/utils/utils";

import { FilterBox, NoSearchResultsWrapper, SearchCardLoadingState, SearchResultsContainer } from "./styled";
import { defaultParams } from "./types";

const selectMenuItems: string[] = Array(3)
  .fill("")
  .map(() => faker.lorem.words(1));

const loaderCards: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const SearchResultsPage = () => {
  const searchParams = useSearchParams();

  const [searchedQuery, setSearchedQuery] = useState<string>("");
  const [requestParams, setRequestParams] = useState<TAllEventsPyaload>(defaultParams);
  const { data: videoListings, isFetching, isLoading, isUninitialized, error } = useGetEventsQuery(requestParams);

  const isDataLoading = isFetching || isLoading || isUninitialized;

  useEffect(() => {
    const search = searchParams?.get("search") as string;
    setSearchedQuery(search);

    setRequestParams((prev) => {
      const apiParams = { ...prev };
      if (search) {
        apiParams.tag = "";
        apiParams.search = search;
      }
      const updatedParams = parseNonPassedParams(apiParams) as TAllEventsPyaload;
      return updatedParams;
    });
  }, [searchParams]);

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
      return videoListings?.results?.map((videoCard) => <SearchVideoCard key={videoCard.id} {...videoCard} width="100%" />);
    }

    return (
      <NoSearchResultsWrapper>
        <Typography variant="h3" component="div">
          No videos found for &apos;{searchedQuery}&apos;
        </Typography>
      </NoSearchResultsWrapper>
    );
  };

  return (
    <MainLayoutContainer>
      <FilterBox>
        <Stack>
          <Typography variant="h2" component="div" title={searchedQuery}>
            Showing search results for &apos;{searchedQuery}&apos;
          </Typography>
          <Select label={"Sort by"} menuItems={selectMenuItems} handleChange={() => {}} />
        </Stack>
      </FilterBox>

      <Box width="100%">
        <SearchResultsContainer>{renderResults()}</SearchResultsContainer>
      </Box>
    </MainLayoutContainer>
  );
};

export default SearchResultsPage;
