import isEqual from "lodash/isEqual";
import omit from "lodash/omit";

import { EventDetail, Tag, AllEventResponse, EventsParams, Recommendation, Playlist, RecommendationParam } from "@/models/Events";
import { baseApi } from "@/redux/baseApi";

const getEventsCacheKey = (params: Omit<EventsParams, "page">) => {
  const searchParams = new URLSearchParams();

  searchParams.set("event_type", params.event_type);
  searchParams.set("status", params.status);

  if (params.event_time_after) searchParams.set("event_time_after", params.event_time_after);
  if (params.event_time_before) searchParams.set("event_time_before", params.event_time_before);
  if (typeof params.is_featured === "boolean") searchParams.set("is_featured", String(params.is_featured));
  if (params.linked_to_events) searchParams.set("linked_to_events", params.linked_to_events);
  if (params.ordering?.length) searchParams.set("ordering", params.ordering.join(","));
  if (params.page_size) searchParams.set("page_size", String(params.page_size));
  if (params.playlist) searchParams.set("playlist", params.playlist);
  if (params.search) searchParams.set("search", params.search);
  if (params.tag) searchParams.set("tag", params.tag);

  return searchParams.toString();
};

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
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}?${getEventsCacheKey(omit(queryArgs, "page"))}`,
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
