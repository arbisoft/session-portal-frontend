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
      },
    },
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
