import { renderHook, waitFor } from "@/jest/utils/testUtils";

import { eventsApi, useGetEventsQuery } from "../events/apiSlice";
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

    const { result } = renderHook(() => useGetEventsQuery({ event_type: "", page: 1, status: "" }), {
      wrapper: ({ children }) => <Providers>{children}</Providers>,
    });
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
});
