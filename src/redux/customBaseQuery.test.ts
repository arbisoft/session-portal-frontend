import customBaseQuery from "./customBaseQuery";

const mockShowNotification = jest.fn();
jest.mock("@/components/Notification", () => ({
  notificationManager: { showNotification: (...args: unknown[]) => mockShowNotification(...args) },
}));

const api = (dispatch = jest.fn()) => ({ dispatch, getState: jest.fn(), signal: new AbortController().signal }) as never;

describe("customBaseQuery", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    mockShowNotification.mockClear();
  });

  it("should call the proxy without a client-side Authorization header and drop trailing slashes", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }));

    await customBaseQuery({ url: "/events/tags/?linked_to_events=True" }, api(), {});

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.url).toMatch(/\/bff\/events\/tags\?linked_to_events=True$/);
    expect(request.headers.get("authorization")).toBeNull();
    expect(request.headers.get("x-requested-with")).toBe("session-portal");
  });

  it("should dispatch logout and toast on 401", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ detail: "nope" }), { status: 401 });
    const dispatch = jest.fn();

    await customBaseQuery({ url: "/events/all/" }, api(dispatch), {});

    expect(dispatch).toHaveBeenCalledWith({ type: "login/logout" });
    expect(mockShowNotification).toHaveBeenCalled();
  });

  it("should not toast when showErrorToast is false", async () => {
    fetchMock.mockResponseOnce("{}", { status: 500 });

    await customBaseQuery({ url: "/events/all/" }, api(), { showErrorToast: false });

    expect(mockShowNotification).not.toHaveBeenCalled();
  });
});
