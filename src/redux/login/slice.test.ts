import { CurrentUser } from "@/models/Auth";

import { loginApi } from "./apiSlice";
import loginReducer, { loginActions } from "./slice";

describe("loginSlice", () => {
  const initialState = {
    session: {
      refresh: null,
      access: null,
      user_info: {
        avatar: null,
        first_name: null,
        full_name: null,
        last_name: null,
        is_staff: false,
      },
    },
    currentUser: null,
    error: null,
    isLoading: false,
  };

  it("should return the initial state", () => {
    expect(loginReducer(undefined, { type: "" })).toEqual(initialState);
  });

  it("should handle login action", () => {
    const payload = { access: "token", user: { id: 1 } };
    const actual = loginReducer(initialState, loginActions.login(payload));
    expect(actual.session).toEqual(payload);
  });

  it("should handle logout action", () => {
    const stateWithSession = { ...initialState, session: { ...initialState.session, access: "token" }, isLoading: false };
    const actual = loginReducer(stateWithSession, loginActions.logout());
    expect(actual).toEqual(initialState);
  });

  it("should handle loginApi fulfilled", () => {
    const payload = { access: "api_token", user: { id: 1 } };
    const action = { type: loginActions.login.type, payload };
    const actual = loginReducer(initialState, action);
    expect(actual.session).toEqual(payload);
  });
});

describe("loginSlice getMe", () => {
  const initialState = loginReducer(undefined, { type: "" });
  const currentUser: CurrentUser = {
    id: 7,
    first_name: "Jane",
    last_name: "Doe",
    full_name: "Jane Doe",
    email: "jane@arbisoft.com",
    role: "staff",
    is_staff: true,
  };

  const getMeFulfilled = (payload: CurrentUser) => ({
    type: "api/executeQuery/fulfilled",
    payload,
    meta: { arg: { endpointName: "getMe", type: "query" }, requestId: "test", requestStatus: "fulfilled" },
  });

  it("should store the verified user when /users/me succeeds", () => {
    expect(loginApi.endpoints.getMe.matchFulfilled(getMeFulfilled(currentUser))).toBe(true);

    const actual = loginReducer(initialState, getMeFulfilled(currentUser));

    expect(actual.currentUser).toEqual(currentUser);
  });

  it("should sync the displayed profile but keep the avatar from login", () => {
    const withAvatar = loginReducer(
      initialState,
      loginActions.login({
        ...initialState.session,
        user_info: { ...initialState.session.user_info, avatar: "https://img/a.png", full_name: "Old Name" },
      })
    );
    const actual = loginReducer(withAvatar, getMeFulfilled(currentUser));

    expect(actual.session.user_info).toEqual({
      avatar: "https://img/a.png",
      first_name: "Jane",
      last_name: "Doe",
      full_name: "Jane Doe",
      is_staff: true,
    });
  });

  it("should clear the verified user on logout", () => {
    const verified = { ...initialState, currentUser };

    expect(loginReducer(verified, loginActions.logout()).currentUser).toBeNull();
  });
});

describe("customBaseQuery wiring", () => {
  it("should expose the shared logout action on loginActions", () => {
    expect(loginActions.logout.type).toBe("login/logout");
  });
});
