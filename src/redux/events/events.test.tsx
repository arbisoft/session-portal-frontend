import { renderHook, waitFor } from "@/jest/utils/testUtils";

import { eventsApi, useGetEventsQuery, useRecommendationQuery, usePlaylistsQuery } from "../events/apiSlice";
import { store } from "../store/configureStore";
import { Providers } from "../store/provider";

describe("eventsApi endpoints", () => {
  it("should fetch all events successfully", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        count: 123,
        next: "http://api.example.org/accounts/?page=4",
        previous: "http://api.example.org/accounts/?page=2",
        results: [
          {
            id: 0,
            title: "string",
            description: "string",
            publisher: {
              id: 0,
              first_name: "string",
              last_name: "string",
            },
            event_time: "2025-03-12T11:05:22.534Z",
            event_type: "SESSION",
            status: "DRAFT",
            workstream_id: "string",
            is_featured: true,
            tags: "string",
            thumbnail: "string",
            video_duration: "string",
          },
        ],
      })
    );

    const { result } = renderHook(
      () => useGetEventsQuery({ event_type: "SESSION", page: 1, status: "PUBLISHED", is_featured: true }),
      {
        wrapper: ({ children }) => <Providers>{children}</Providers>,
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        count: 123,
        next: "http://api.example.org/accounts/?page=4",
        previous: "http://api.example.org/accounts/?page=2",
        results: [
          {
            id: 0,
            title: "string",
            description: "string",
            publisher: {
              id: 0,
              first_name: "string",
              last_name: "string",
            },
            event_time: "2025-03-12T11:05:22.534Z",
            event_type: "SESSION",
            status: "DRAFT",
            workstream_id: "string",
            is_featured: true,
            tags: "string",
            thumbnail: "string",
            video_duration: "string",
          },
        ],
      });
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should merge paginated results and deduplicate events", async () => {
    const initialResponse = {
      count: 123,
      next: "http://api.example.org/accounts/?page=2",
      previous: null,
      results: [
        {
          id: 1,
          title: "Event 1",
          description: "Description 1",
          publisher: { id: 1, first_name: "John", last_name: "Doe" },
          event_time: "2025-03-12T11:05:22.534Z",
          event_type: "SESSION",
          status: "DRAFT",
          workstream_id: "string",
          is_featured: true,
          tags: "string",
          thumbnail: "string",
          video_duration: "string",
        },
      ],
    };

    fetchMock.mockResponseOnce(JSON.stringify(initialResponse));

    const { result, rerender } = renderHook(
      ({ page }) => useGetEventsQuery({ event_type: "SESSION", page, status: "PUBLISHED", is_featured: true }),
      {
        wrapper: ({ children }) => <Providers>{children}</Providers>,
        initialProps: { page: 1 },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ page: 2 });
  });

  it("should force refetch when query args change", async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        count: 123,
        next: null,
        previous: null,
        results: [],
      })
    );

    const { result, rerender } = renderHook(
      ({ is_featured }) =>
        useGetEventsQuery({ event_type: "SESSION", page: 1, status: "PUBLISHED", is_featured, search: "test" }),
      {
        wrapper: ({ children }) => <Providers>{children}</Providers>,
        initialProps: { is_featured: true },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ is_featured: false });

    await waitFor(() => expect(result.current.isFetching).toBe(true));
  });

  it("should fetch event types successfully", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          label: "SESSION",
          key: "session",
        },
      ])
    );

    const result = await store.dispatch(eventsApi.endpoints.eventTypes.initiate());

    expect(result.data).toEqual([
      {
        label: "SESSION",
        key: "session",
      },
    ]);
    expect(result.isSuccess).toBe(true);
  });

  it("should fetch event detail successfully", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        title: "string",
        video_file: "string",
        duration: 2147483647,
        thumbnail: "string",
        status: "PROCESSING",
        file_size: 9223372036854776000,
        event: {
          id: 0,
          title: "string",
          description: "string",
          publisher: {
            id: 0,
            first_name: "string",
            last_name: "string",
          },
          event_time: "2025-03-12T11:07:29.656Z",
          event_type: "SESSION",
          status: "DRAFT",
          workstream_id: "string",
          is_featured: true,
          tags: "string",
          thumbnail: "string",
          video_duration: "string",
        },
      }),
      { status: 200 }
    );

    const result = await store.dispatch(eventsApi.endpoints.eventDetail.initiate(1));

    expect(result.data).toEqual({
      title: "string",
      video_file: "string",
      duration: 2147483647,
      thumbnail: "string",
      status: "PROCESSING",
      file_size: 9223372036854776000,
      event: {
        id: 0,
        title: "string",
        description: "string",
        publisher: {
          id: 0,
          first_name: "string",
          last_name: "string",
        },
        event_time: "2025-03-12T11:07:29.656Z",
        event_type: "SESSION",
        status: "DRAFT",
        workstream_id: "string",
        is_featured: true,
        tags: "string",
        thumbnail: "string",
        video_duration: "string",
      },
    });
    expect(result.isSuccess).toBe(true);
  });

  it("should fetch event tags successfully", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          id: 0,
          name: "string",
        },
      ]),
      { status: 200 }
    );
    const result = await store.dispatch(eventsApi.endpoints.eventTags.initiate());
    expect(result.data).toEqual([
      {
        id: 0,
        name: "string",
      },
    ]);
    expect(result.isSuccess).toBe(true);
  });

  it("should fetch recommendation videos successfully", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          id: 2,
          title: "asdf",
          description: "asdf",
          publisher: {
            id: 2,
            first_name: "",
            last_name: "",
          },
          event_time: "2025-02-09T12:48:02Z",
          event_type: "SESSION",
          status: "PUBLISHED",
          workstream_id: null,
          is_featured: false,
          tags: ["Competency"],
          thumbnail: "/media/thumbnails/screenshot-7c8c5c09-218d-46c2-9f7c-ed4e91c2d7fb.png",
          video_duration: 3351,
          presenters: [
            {
              id: 1,
              first_name: "Qaisar ",
              last_name: "Irfan",
              email: "qaisar.irfan@arbisoft.com",
            },
          ],
          playlists: ["Competency"],
        },
      ])
    );

    const { result } = renderHook(() => useRecommendationQuery(1), {
      wrapper: ({ children }) => <Providers>{children}</Providers>,
    });
    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          id: 2,
          title: "asdf",
          description: "asdf",
          publisher: {
            id: 2,
            first_name: "",
            last_name: "",
          },
          event_time: "2025-02-09T12:48:02Z",
          event_type: "SESSION",
          status: "PUBLISHED",
          workstream_id: null,
          is_featured: false,
          tags: ["Competency"],
          thumbnail: "/media/thumbnails/screenshot-7c8c5c09-218d-46c2-9f7c-ed4e91c2d7fb.png",
          video_duration: 3351,
          presenters: [
            {
              id: 1,
              first_name: "Qaisar ",
              last_name: "Irfan",
              email: "qaisar.irfan@arbisoft.com",
            },
          ],
          playlists: ["Competency"],
        },
      ]);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should fetch playlist successfully", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          id: 1,
          name: "AMA",
        },
        {
          id: 2,
          name: "Competency",
        },
      ])
    );

    const { result } = renderHook(() => usePlaylistsQuery(), {
      wrapper: ({ children }) => <Providers>{children}</Providers>,
    });
    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          id: 1,
          name: "AMA",
        },
        {
          id: 2,
          name: "Competency",
        },
      ]);
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
