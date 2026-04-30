import isEqual from "lodash/isEqual";
import omit from "lodash/omit";

import {
  AllEventResponse,
  Event,
  EventCreateParams,
  EventDetail,
  EventsParams,
  Playlist,
  Recommendation,
  RecommendationParam,
  Tag,
  UserSearchResult,
} from "@/models/Events";
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
    allTags: builder.query<Tag[], void>({
      query: () => ({
        url: "/events/tags/",
        method: "GET",
      }),
    }),
    createTag: builder.mutation<Tag, { name: string }>({
      query: (body) => ({
        url: "/events/tags/",
        method: "POST",
        body,
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
    createEvent: builder.mutation<Event, EventCreateParams>({
      query: (params) => {
        const formData = new FormData();
        formData.append("title", params.title);
        formData.append("description", params.description);
        formData.append("event_time", params.event_time);
        formData.append("video_asset_id", String(params.video_asset_id));
        params.playlists.forEach((id) => formData.append("playlists", String(id)));
        params.presenter_ids.forEach((id) => formData.append("presenter_ids", String(id)));
        params.tags?.forEach((id) => formData.append("tags", String(id)));
        if (params.thumbnail) formData.append("thumbnail", params.thumbnail);
        return { url: "/events/", method: "POST", body: formData };
      },
    }),
    searchUsers: builder.query<UserSearchResult[], string>({
      query: (q) => ({
        url: `/users/search/?q=${encodeURIComponent(q)}`,
        method: "GET",
      }),
    }),
    incrementViewCount: builder.mutation<{ view_count: number }, string>({
      query: (slug) => ({
        url: `/events/videoasset/${slug}/view/`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useAllTagsQuery,
  useCreateEventMutation,
  useCreateTagMutation,
  useEventDetailQuery,
  useEventTagsQuery,
  useEventTypesQuery,
  useGetEventsQuery,
  useIncrementViewCountMutation,
  useLazyEventDetailQuery,
  useLazyEventTagsQuery,
  useLazyEventTypesQuery,
  useLazyGetEventsQuery,
  useLazyPlaylistsQuery,
  useLazyRecommendationQuery,
  useLazySearchUsersQuery,
  usePlaylistsQuery,
  useRecommendationQuery,
  useSearchUsersQuery,
} = eventsApi;
