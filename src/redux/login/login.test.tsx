import { eventsApi } from "../events/apiSlice";
import { loginApi } from "../login/apiSlice";
import loginReducer, { loginActions } from "../login/slice";
import { getResetPasswordErrorMessage, parseError } from "../parseError";
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

describe("getResetPasswordErrorMessage", () => {
  it("should return null when error is undefined", () => {
    expect(getResetPasswordErrorMessage({})).toBeNull();
  });

  it("should return null when error.data is undefined", () => {
    expect(getResetPasswordErrorMessage({})).toBeNull();
  });

  it("should return joined uid error message", () => {
    const error = { data: { uid: ["Invalid UID", "Another UID error"] } };
    expect(getResetPasswordErrorMessage(error)).toBe("Invalid UID Another UID error");
  });

  it("should return joined token error message", () => {
    const error = { data: { token: ["Invalid Token"] } };
    expect(getResetPasswordErrorMessage(error)).toBe("Invalid Token");
  });

  it("should return default error message when neither uid nor token exists", () => {
    const error = { data: {} };
    expect(getResetPasswordErrorMessage(error)).toBe("Something went wrong. Please try again.");
  });
});

describe("parseError", () => {
  it("should return generic message when statusCode is not a number or is 500", () => {
    expect(parseError("some error", "CUSTOM_ERROR")).toEqual([{ statusCode: "CUSTOM_ERROR", message: "Something went wrong." }]);
    expect(parseError("server error", 500)).toEqual([{ statusCode: 500, message: "Something went wrong." }]);
  });

  it("should return the error message when error is a string", () => {
    expect(parseError("Invalid request", 400)).toEqual([{ statusCode: 400, message: "Invalid request" }]);
  });

  it("should recursively parse errors when error is an array", () => {
    expect(parseError(["Error 1", "Error 2"], 400)).toEqual([
      { statusCode: 400, message: "Error 1" },
      { statusCode: 400, message: "Error 2" },
    ]);
  });

  it("should handle object errors with simple key-value pairs", () => {
    expect(parseError({ email: "Invalid email" }, 422)).toEqual([{ statusCode: 422, message: "Email: Invalid email" }]);
  });

  it("should handle object errors with array values", () => {
    expect(parseError({ errors: ["Error 1", "Error 2"] }, 400)).toEqual([
      { statusCode: 400, message: "Errors: Error 1" },
      { statusCode: 400, message: "Errors: Error 2" },
    ]);
  });

  it("should handle object errors with nested object values", () => {
    expect(parseError({ user: { name: "Required" } }, 400)).toEqual([{ statusCode: 400, message: "User: Name: Required" }]);
  });

  it("should handle object errors with null or undefined values", () => {
    expect(parseError({ key1: null, key2: undefined }, 400)).toEqual([
      { statusCode: 400, message: "Key1: unknown value" },
      { statusCode: 400, message: "Key2: unknown value" },
    ]);
  });

  it("should handle deeply nested error structures", () => {
    const error = {
      user: {
        profile: {
          email: ["Invalid email"],
          age: null,
        },
      },
    };
    expect(parseError(error, 400)).toEqual([
      { statusCode: 400, message: "User: Profile: Email: Invalid email" },
      { statusCode: 400, message: "User: Profile: Age: unknown value" },
    ]);
  });

  it("should return fallback error message for unknown types", () => {
    expect(parseError(12345, 400)).toEqual([{ statusCode: 400, message: "Something went wrong." }]);
    expect(parseError(undefined, 400)).toEqual([{ statusCode: 400, message: "Something went wrong." }]);
  });
});
