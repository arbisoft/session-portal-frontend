import { StrictMode } from "react";

import { act, render, waitFor } from "@testing-library/react";

import { selectCurrentUser } from "@/redux/login/selectors";
import { loginActions } from "@/redux/login/slice";
import { store } from "@/redux/store/configureStore";
import { Providers } from "@/redux/store/provider";

import AuthSession from "./authSession";

let mockPathname = "/videos";
const mockReplace = jest.fn();
const mockRouter = { replace: mockReplace };

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => mockRouter,
}));

const me = {
  id: 1,
  first_name: "Jane",
  last_name: "Doe",
  full_name: "Jane Doe",
  email: "jane@arbisoft.com",
  role: "user",
  is_staff: false,
};

const meCalls = () =>
  fetchMock.mock.calls.filter(([request]) => String((request as Request).url ?? request).includes("/users/me"));

const renderSession = () =>
  render(
    <Providers>
      <AuthSession />
    </Providers>
  );

describe("AuthSession", () => {
  beforeEach(() => {
    mockPathname = "/videos";
    mockReplace.mockReset();
    act(() => {
      store.dispatch(loginActions.logout());
    });
  });

  it("should verify the session and store the user on a protected route", async () => {
    fetchMock.mockResponse(JSON.stringify(me));

    renderSession();

    await waitFor(() => expect(selectCurrentUser(store.getState() as never)).toEqual(me));
    expect(meCalls()).toHaveLength(1);
    const request = meCalls()[0][0] as Request;
    expect(new URL(request.url, "http://localhost").pathname).toBe("/bff/users/me");
    expect(request.headers.get("x-requested-with")).toBe("session-portal");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should not verify on a public route", () => {
    mockPathname = "/login";

    renderSession();

    expect(meCalls()).toHaveLength(0);
  });

  it("should verify again when navigating to another protected route", async () => {
    fetchMock.mockResponse(JSON.stringify(me));

    const { rerender } = renderSession();
    await waitFor(() => expect(meCalls()).toHaveLength(1));

    mockPathname = "/videos/results";
    rerender(
      <Providers>
        <AuthSession />
      </Providers>
    );

    await waitFor(() => expect(meCalls()).toHaveLength(2));
  });

  it("should discard an in-flight verification when the component unmounts", async () => {
    fetchMock.mockResponse(() => new Promise((resolve) => setTimeout(() => resolve(JSON.stringify(me)), 50)));

    const { unmount } = renderSession();
    unmount();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(selectCurrentUser(store.getState() as never)).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should verify the session under React StrictMode, where effects run twice", async () => {
    fetchMock.mockResponse(JSON.stringify(me));

    render(
      <StrictMode>
        <Providers>
          <AuthSession />
        </Providers>
      </StrictMode>
    );

    await waitFor(() => expect(selectCurrentUser(store.getState() as never)).toEqual(me));
    expect(meCalls()).toHaveLength(1);
  });

  it("should still verify when navigating again before the previous verification finishes", async () => {
    fetchMock.mockResponse(() => new Promise((resolve) => setTimeout(() => resolve(JSON.stringify(me)), 50)));

    const { rerender } = renderSession();
    mockPathname = "/videos/results";
    rerender(
      <Providers>
        <AuthSession />
      </Providers>
    );

    await waitFor(() => expect(selectCurrentUser(store.getState() as never)).toEqual(me));
  });

  it("should verify once when navigating from a public to a protected route", async () => {
    fetchMock.mockResponse(JSON.stringify(me));
    mockPathname = "/login";

    const { rerender } = renderSession();
    mockPathname = "/videos";
    rerender(
      <Providers>
        <AuthSession />
      </Providers>
    );

    await waitFor(() => expect(selectCurrentUser(store.getState() as never)).toEqual(me));
    expect(meCalls()).toHaveLength(1);
  });

  it("should not reuse a previous 401 after the user logs in again", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ detail: "Given token not valid" }), { status: 401 });
    const first = renderSession();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
    first.unmount();

    mockReplace.mockReset();
    fetchMock.mockResponse(JSON.stringify(me));
    renderSession();

    await waitFor(() => expect(selectCurrentUser(store.getState() as never)).toEqual(me));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should not redirect to an unsafe path", async () => {
    mockPathname = "//evil.com";
    fetchMock.mockResponse(JSON.stringify({ detail: "Given token not valid" }), { status: 401 });

    renderSession();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"));
  });

  it("should not reuse a previous 401 after the user logs in again", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ detail: "Given token not valid" }), { status: 401 });
    const first = renderSession();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
    first.unmount();

    mockReplace.mockReset();
    fetchMock.mockResponse(JSON.stringify(me));
    renderSession();

    await waitFor(() => expect(selectCurrentUser(store.getState() as never)).toEqual(me));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should not redirect to an unsafe path", async () => {
    mockPathname = "//evil.com";
    fetchMock.mockResponse(JSON.stringify({ detail: "Given token not valid" }), { status: 401 });

    renderSession();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"));
  });

  it("should redirect to login with the current path when the token is rejected", async () => {
    fetchMock.mockResponse(JSON.stringify({ detail: "Given token not valid" }), { status: 401 });

    renderSession();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login?redirect_to=%2Fvideos"));
    expect(selectCurrentUser(store.getState() as never)).toBeNull();
  });

  it("should keep the session when the backend is temporarily unavailable", async () => {
    fetchMock.mockResponse(JSON.stringify({ detail: "boom" }), { status: 500 });

    renderSession();

    await waitFor(() => expect(meCalls()).toHaveLength(1));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should keep the session when the request fails at the network level", async () => {
    fetchMock.mockReject(new Error("Failed to fetch"));

    renderSession();

    await waitFor(() => expect(meCalls()).toHaveLength(1));
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
