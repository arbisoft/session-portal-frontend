"use client";

import React, { useCallback, useEffect, useState } from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSearchParams } from "next/navigation";
import { Virtuoso } from "react-virtuoso";

import MainLayoutContainer from "@/components/containers/MainLayoutContainer";
import Select from "@/components/Select";
import VideoCard from "@/components/VideoCard";
import { BASE_URL, DEFAULT_THUMBNAIL } from "@/constants/constants";
import useNavigation from "@/hooks/useNavigation";
import { EventsParams, OrderingField } from "@/models/Events";
import { useLazyGetEventsQuery } from "@/redux/events/apiSlice";
import { useTranslation } from "@/services/i18n/client";
import { convertSecondsToFormattedTime, formatDateTime, fullName, parseNonPassedParams } from "@/utils/utils";

import { FilterBox, NoSearchResultsWrapper, SearchCardLoadingState, SearchResultsContainer } from "./styled";
import { defaultParams } from "./types";

const loaderCards: string[] = Array.from({ length: 5 }, () => faker.lorem.word());

const LoaderSkeleton = () => (
  <SearchCardLoadingState>
    <Skeleton width={400} height={242} variant="rounded" />
    <Box width="calc( 100% - 400px )">
      <Skeleton width="100%" height={30} />
      <Skeleton width={250} height={30} />
      <br />
      <Skeleton width={100} height={20} />
      <Skeleton width={100} height={20} />
      <br />
      <Skeleton width="100%" height={20} />
      <Skeleton width="100%" height={20} />
      <Skeleton width="100%" height={20} />
      <Skeleton width="100%" height={20} />
    </Box>
  </SearchCardLoadingState>
);

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const { navigateTo } = useNavigation();
  const theme = useTheme();
  const { t } = useTranslation("videos");

  const matches = useMediaQuery(theme.breakpoints.down("lg"));

  const [page, setPage] = useState(1);
  const search = searchParams?.get("search") ?? "";
  const order = (searchParams?.get("order") as OrderingField) || "event_time";

  const [getEvents, { data: videoListings, isFetching, isLoading, isUninitialized, error }] = useLazyGetEventsQuery();

  const isDataLoading = isFetching || isLoading || isUninitialized;

  const onSortingHandler = useCallback(
    (val: unknown) => {
      setPage(1);
      const params = parseNonPassedParams({ order: val, search }) as Record<string, string>;
      navigateTo("searchResult", params);
    },
    [search]
  );

  useEffect(() => {
    const params: EventsParams = {
      ...defaultParams,
      ordering: [order],
      page_size: 10,
      page,
      search: search || undefined,
    };

    const updatedParams = parseNonPassedParams(params) as EventsParams;
    getEvents(updatedParams);
  }, [search, page, order]);

  const renderSkeletons = () => loaderCards.map((key) => <LoaderSkeleton key={key} />);

  const renderVideoResults = () => (
    <Virtuoso
      useWindowScroll
      style={{ height: "100%" }}
      data={videoListings?.results ?? []}
      increaseViewportBy={200}
      endReached={() => {
        if (!isFetching && videoListings?.next) {
          setPage((prevPage) => prevPage + 1);
        }
      }}
      itemContent={(_, event) => (
        <Box pb={4}>
          <VideoCard
            data={{
              description: event.description,
              event_time: formatDateTime(event.event_time),
              organizer: event.presenters.map(fullName).join(", "),
              thumbnail: event.thumbnail ? BASE_URL.concat(event.thumbnail) : DEFAULT_THUMBNAIL,
              title: event.title,
              video_duration: convertSecondsToFormattedTime(event.video_duration),
              video_file: event.video_file ? BASE_URL.concat(event.video_file) : undefined,
            }}
            width="100%"
            onClick={() => navigateTo("videoDetail", { id: event.id })}
            variant="search-card"
          />
        </Box>
      )}
      components={{
        Footer: () => (isFetching ? <LoaderSkeleton /> : null),
      }}
    />
  );

  const renderNoResults = () => (
    <NoSearchResultsWrapper>
      <Typography variant="h3">
        {t("no_videos_found")}{" "}
        <Box component="span" color={theme.palette.secondary.main}>
          {search}
        </Box>
      </Typography>
    </NoSearchResultsWrapper>
  );

  const renderResults = () => {
    if (error) return renderNoResults();
    if (isDataLoading) return renderSkeletons();
    if (videoListings?.results?.length) return renderVideoResults();
    return renderNoResults();
  };

  return (
    <MainLayoutContainer isLeftSidebarVisible={!matches} shouldShowDrawer={matches}>
      {(videoListings?.results.length ?? 0) > 0 && (
        <FilterBox>
          <Stack>
            <Typography variant="h2">
              {`${t("search_results")} `}
              <Box component="span" color={theme.palette.secondary.main}>
                {search}
              </Box>
            </Typography>
            <Select
              label={t("sort_by")}
              menuItems={[
                { value: "-event_time", label: "Newest First" },
                { value: "event_time", label: "Oldest First" },
              ]}
              onChange={({ target }) => onSortingHandler(target.value)}
              value={order}
            />
          </Stack>
        </FilterBox>
      )}

      <Box width="100%" height="100%">
        <SearchResultsContainer>{renderResults()}</SearchResultsContainer>
      </Box>
    </MainLayoutContainer>
  );
};

export default SearchResultsPage;
