import { eventsApi } from "../events/apiSlice";
import { loginApi } from "../login/apiSlice";
import loginReducer, { loginActions } from "../login/slice";
import { store } from "../store/configureStore";

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

  it("should login failed", async () => {
    const result = await store.dispatch(loginApi.endpoints.login.initiate({ auth_token: "test-token" }));

    expect(result.error).toEqual({
      status: 401,
      data: {
        detail: "Given token not valid for any token type",
        code: "token_not_valid",
        messages: [
          {
            message: "Token is invalid or expired",
            token_class: "AccessToken",
            token_type: "access",
          },
        ],
      },
    });
  });

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
