import isEqual from "lodash/isEqual";

import { EventDetail, Tag, AllEventResponse, EventsParams, Recommendation, Playlist } from "@/models/Events";
import { baseApi } from "@/redux/baseApi";

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    eventDetail: builder.query<Partial<EventDetail>, number>({
      query: (id) => ({
        url: `/events/videoasset/${id}/`,
        method: "GET",
      }),
    }),
    eventTags: builder.query<Tag[], void>({
      query: () => ({
        url: "/events/tags/",
        method: "GET",
      }),
    }),
    getEvents: builder.query<AllEventResponse, EventsParams>({
      query: (params) => ({
        url: "/events/all/",
        method: "GET",
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return endpointName.concat(`?is_featured=${queryArgs.is_featured}`);
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) currentCache.results = [];

        currentCache.count = newItems.count;
        currentCache.previous = newItems.previous;
        currentCache.next = newItems.next;

        const existingIds = new Set(currentCache.results.map((event) => event.id));
        const uniqueResults = newItems.results.filter((event) => !existingIds.has(event.id));

        currentCache.results.push(...uniqueResults);
      },
      forceRefetch({ currentArg, previousArg }) {
        return !isEqual(currentArg, previousArg);
      },
      transformResponse: (response: AllEventResponse) => {
        return response;
      },
    }),
    eventTypes: builder.query<Tag[], void>({
      query: () => ({
        url: "/events/event_types/",
        method: "GET",
      }),
    }),
    recommendation: builder.query<Recommendation[], number>({
      query: (id) => ({
        url: `/events/recommendations/${id}/`,
        method: "GET",
      }),
    }),
    playlists: builder.query<Playlist[], void>({
      query: () => ({
        url: "/events/playlists/",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useEventDetailQuery,
  useEventTagsQuery,
  useEventTypesQuery,
  useGetEventsQuery,
  useLazyEventDetailQuery,
  useLazyEventTagsQuery,
  useLazyEventTypesQuery,
  useLazyGetEventsQuery,
  useLazyPlaylistsQuery,
  useLazyRecommendationQuery,
  usePlaylistsQuery,
  useRecommendationQuery,
} = eventsApi;
