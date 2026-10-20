/**
 * @jest-environment node
 */
describe("Redux Store without a window", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("should fall back to the noop storage on the server", async () => {
    // redux-persist arms a 5s rehydrate-timeout timer on import that is never cleared; under fake
    // timers it is never created, so the jest worker can exit instead of being force-killed.
    jest.useFakeTimers();
    const { persistor, store } = await import("./configureStore");

    expect(typeof window).toBe("undefined");
    expect(store.getState()).toHaveProperty("login");
    expect(persistor).toBeDefined();
  });
});
