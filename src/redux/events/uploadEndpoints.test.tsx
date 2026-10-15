import { renderHook, waitFor, act } from "@/jest/utils/testUtils";

import { Providers } from "../store/provider";

import { useCreateEventMutation, useCreateTagMutation, useSearchUsersQuery } from "./apiSlice";

const wrapper = ({ children }: { children: React.ReactNode }) => <Providers>{children}</Providers>;

describe("events upload endpoints", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should search users through the proxy with the query as a parameter", async () => {
    fetchMock.mockResponseOnce(JSON.stringify([{ id: 1, first_name: "A", last_name: "B", full_name: "A B", email: "a@b.c" }]));

    const { result } = renderHook(() => useSearchUsersQuery("ab"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.url).toContain("/bff/users/search?q=ab");
    expect(request.headers.get("Authorization")).toBeNull();
  });

  it("should create a tag with a POST request", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ id: 9, name: "new" }), { status: 201 });

    const { result } = renderHook(() => useCreateTagMutation(), { wrapper });

    let created: unknown;
    await act(async () => {
      created = await result.current[0]({ name: "new" }).unwrap();
    });

    expect(created).toEqual({ id: 9, name: "new" });
    expect((fetchMock.mock.calls[0][0] as Request).method).toBe("POST");
  });

  it("should send the event as multipart form data", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ id: 1, slug: "my-event" }), { status: 201 });
    const appendSpy = jest.spyOn(FormData.prototype, "append");

    const { result } = renderHook(() => useCreateEventMutation(), { wrapper });

    await act(async () => {
      await result.current[0]({
        title: "T",
        description: "D",
        event_time: "2026-01-01T00:00:00.000Z",
        playlists: [1, 2],
        presenter_ids: [3],
        video_asset_id: 7,
        tags: [4],
        thumbnail: new File(["x"], "thumb.png", { type: "image/png" }),
      }).unwrap();
    });

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(request.url).toContain("/bff/events");
    const appended = appendSpy.mock.calls.map(([key, value]) => [key, value instanceof File ? value.name : value]);
    expect(appended).toEqual(
      expect.arrayContaining([
        ["video_asset_id", "7"],
        ["playlists", "1"],
        ["playlists", "2"],
        ["presenter_ids", "3"],
        ["tags", "4"],
        ["thumbnail", "thumb.png"],
      ])
    );
    appendSpy.mockRestore();
  });
});
