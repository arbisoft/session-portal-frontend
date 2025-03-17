import { EventDetail, Tag, AllEventResponse, TAllEventsPyaload, Recommendation } from "@/models/Events";
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
    getEvents: builder.query<AllEventResponse, TAllEventsPyaload>({
      query: (params) => ({
        url: "/events/all/",
        method: "GET",
        params,
      }),
    }),
    eventTypes: builder.query<Tag[], void>({
      query: () => ({
        url: "/events/event_types/",
        method: "GET",
      }),
    }),
    recommendation: builder.query<Recommendation[], number>({
      query: (id) => ({
        url: `/events/recommendation/${id}/`,
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
  useLazyRecommendationQuery,
  useRecommendationQuery,
} = eventsApi;
