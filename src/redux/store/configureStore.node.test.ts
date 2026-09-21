/**
 * @jest-environment node
 */
import { persistor, store } from "./configureStore";

describe("Redux Store without a window", () => {
  it("should fall back to the noop storage on the server", () => {
    expect(typeof window).toBe("undefined");
    expect(store.getState()).toHaveProperty("login");
    expect(persistor).toBeDefined();
  });
});
