import { eventsApi } from "../events/apiSlice";
import { store } from "../store/configureStore";

describe("eventsApi endpoints", () => {
  test("should fetches all events with params", async () => {
    const result = await store.dispatch(eventsApi.endpoints.getEvents.initiate({ event_type: "", page: 1, status: "" }));

    expect(result).toEqual({
      status: "uninitialized",
      isUninitialized: true,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  });

  test("should fetches event types", async () => {
    const result = await store.dispatch(eventsApi.endpoints.eventTypes.initiate());

    expect(result).toEqual({
      status: "uninitialized",
      isUninitialized: true,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  });

  test("should fetches event detail", async () => {
    const result = await store.dispatch(eventsApi.endpoints.eventDetail.initiate(1));

    expect(result).toEqual({
      status: "uninitialized",
      isUninitialized: true,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  });

  test("should fetches event tags", async () => {
    const result = await store.dispatch(eventsApi.endpoints.eventTags.initiate());

    expect(result).toEqual({
      status: "uninitialized",
      isUninitialized: true,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  });
});
