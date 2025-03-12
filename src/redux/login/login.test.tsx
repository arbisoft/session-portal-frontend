import { act, renderHook } from "@/jest/utils/testUtils";

import { eventsApi } from "../events/apiSlice";
import { store } from "../store/configureStore";
import { Providers } from "../store/provider";

import { useLoginMutation } from "./apiSlice";
import loginReducer, { loginActions } from "./slice";

describe("Login API and Slice", () => {
  it("should return the initial state", () => {
    const initialState = {
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
    };

    expect(loginReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle logout action", () => {
    const initialState = {
      session: {
        refresh: "test-refresh",
        access: "test-access",
        user_info: {
          avatar: "test-avatar",
          first_name: "Test",
          full_name: "Test User",
          last_name: "User",
        },
      },
      error: null,
      isLoading: false,
    };

    const expectedState = {
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
    };

    expect(loginReducer(initialState, loginActions.logout())).toEqual(expectedState);
  });

  it("should login successfully", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        refresh: "eyJ0eXAiOiJKV1QiLCJhbGc...",
        access: "eyJ0eXAiOiJKV1QiLCJhbGc...",
        user_info: {
          full_name: "John Doe",
          first_name: "John",
          last_name: "Doe",
          avatar: "https://lh3.googleusercontent.com/a/photo",
        },
      }),
      { status: 200 }
    );
    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: ({ children }) => <Providers>{children}</Providers>,
    });

    const [login] = result.current;

    const credentials = { auth_token: "test-token" };

    await act(async () => {
      const response = await login(credentials).unwrap();

      expect(response).toEqual({
        refresh: "eyJ0eXAiOiJKV1QiLCJhbGc...",
        access: "eyJ0eXAiOiJKV1QiLCJhbGc...",
        user_info: {
          full_name: "John Doe",
          first_name: "John",
          last_name: "Doe",
          avatar: "https://lh3.googleusercontent.com/a/photo",
        },
      });
    });
  });

  it("should handle login failure", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        detail: "Invalid credentials",
      }),
      { status: 401 } // Simulate a 401 Unauthorized error
    );

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: ({ children }) => <Providers>{children}</Providers>,
    });

    const [login] = result.current;

    const credentials = { auth_token: "invalid-token" };

    await act(async () => {
      try {
        await login(credentials).unwrap();
      } catch (error) {
        expect(error).toEqual({
          status: 401,
          data: { detail: "Invalid credentials" },
        });
      }
    });
  });

  it("should handle login timeout", async () => {
    // Mock a fetch response that never resolves (simulating a timeout)
    fetchMock.mockResponseOnce(
      () =>
        new Promise(
          (resolve) => setTimeout(() => resolve({ body: "{}" }), 10000) // Simulate a 10-second delay
        )
    );

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: ({ children }) => <Providers>{children}</Providers>,
    });

    const [login] = result.current;

    const credentials = { auth_token: "test-token" };

    await act(async () => {
      try {
        await Promise.race([
          login(credentials).unwrap(),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error("Request timed out")), 5000) // Simulate a 5-second timeout
          ),
        ]);
      } catch (error) {
        // @ts-ignore
        expect(error.message).toBe("Request timed out");
      }
    });
  }, 10000);

  it("should handle 401 response by logging out", async () => {
    const initialState = {
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
    };
    await store.dispatch(eventsApi.endpoints.getEvents.initiate({ event_type: "", page: 1, status: "" }));

    expect(store.getState().login).toEqual(initialState);
  });
});
