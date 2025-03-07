import { REDUCER_PATH } from "@/redux/baseApi";

import { createNoopStorage, persistor, store } from "./configureStore";

describe("Redux Store", () => {
  it("should initialize store correctly", () => {
    expect(store).toBeDefined();
    expect(store.getState()).toHaveProperty("login");
    expect(store.getState()).toHaveProperty(REDUCER_PATH);
  });

  it("should persist store correctly", () => {
    expect(persistor).toBeDefined();
  });

  it("should createNoopStorage when window is undefined", async () => {
    expect(createNoopStorage).toBeDefined();
    expect(await createNoopStorage().getItem("test")).toBe("test");
    expect(await createNoopStorage().setItem("test", "value")).toBe("value");
    expect(await createNoopStorage().removeItem("test")).toBeTruthy();
  });
});
