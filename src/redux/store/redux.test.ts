import { REDUCER_PATH } from "@/redux/baseApi";
import { loginActions } from "@/redux/login/slice";

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

  it("should reset state on logout", () => {
    store.dispatch({ type: "login/someAction", payload: { session: "testSession" } });
    expect(store.getState().login).toBeDefined();
    store.dispatch(loginActions.logout());
    expect(store.getState().login).toEqual({
      session: {
        refresh: null,
        access: null,
        user_info: {
          avatar: null,
          first_name: null,
          full_name: null,
          last_name: null,
        },
      },
      error: null,
      isLoading: false,
    });
  });
});
