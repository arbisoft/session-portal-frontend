import isEqual from "lodash/isEqual";

import { EventDetail, Tag, AllEventResponse, EventsParams, Recommendation, Playlist, RecommendationParam } from "@/models/Events";
import { baseApi } from "@/redux/baseApi";

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    eventDetail: builder.query<Partial<EventDetail>, string>({
      query: (id) => ({
        url: `/events/videoasset/${id}/`,
        method: "GET",
      }),
    }),
    eventTags: builder.query<Tag[], void>({
      query: () => ({
        url: "/events/tags/?linked_to_events=True",
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
        if (queryArgs.search) {
          return endpointName.concat(`?is_featured=${queryArgs.is_featured}&search=${queryArgs.search}`);
        }
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
    recommendation: builder.query<Recommendation, RecommendationParam>({
      query: ({ id, page = 1, page_size = 10 }) => ({
        url: `/events/recommendations/${id}/`,
        method: "GET",
        params: { page, page_size },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${queryArgs.id}`,
      merge: (currentCache, newItems) => {
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
    }),
    playlists: builder.query<Playlist[], void>({
      query: () => ({
        url: "/events/playlists/?linked_to_events=True",
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
