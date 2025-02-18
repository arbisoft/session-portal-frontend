import { EventDetail, Tag, AllEventResponse } from "@/models/Events";
import { baseApi } from "@/redux/baseApi";

import { TAllEventsPyaload } from "./types";

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
    allEvents: builder.query<AllEventResponse, TAllEventsPyaload>({
      query: (params) => ({
        url: "/events/all/",
        method: "GET",
        params,
      }),
    }),
    eventsTypes: builder.query<Tag[], void>({
      query: () => ({
        url: "/events/event_types/",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useEventDetailQuery,
  useAllEventsQuery,
  useEventTagsQuery,
  useLazyEventDetailQuery,
  useLazyAllEventsQuery,
  useLazyEventTagsQuery,
} = eventsApi;
