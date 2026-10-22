import { abortableSleep, browserNetwork } from "./environment";

describe("abortableSleep", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("should resolve after the delay", async () => {
    const done = jest.fn();
    abortableSleep(1000, new AbortController().signal).then(done);

    await jest.advanceTimersByTimeAsync(999);
    expect(done).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
  });

  it("should resolve immediately when aborted", async () => {
    const controller = new AbortController();
    const done = jest.fn();
    abortableSleep(60_000, controller.signal).then(done);

    controller.abort();
    await jest.advanceTimersByTimeAsync(0);

    expect(done).toHaveBeenCalled();
  });

  it("should not wait at all when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const done = jest.fn();

    abortableSleep(60_000, controller.signal).then(done);
    await jest.advanceTimersByTimeAsync(0);

    expect(done).toHaveBeenCalled();
  });
});

describe("browserNetwork", () => {
  const setOnline = (value: boolean) => jest.spyOn(window.navigator, "onLine", "get").mockReturnValue(value);
  afterEach(() => jest.restoreAllMocks());

  it("should reflect navigator.onLine", () => {
    setOnline(false);
    expect(browserNetwork.isOnline()).toBe(false);
    setOnline(true);
    expect(browserNetwork.isOnline()).toBe(true);
  });

  it("should resolve at once when already online", async () => {
    setOnline(true);

    await expect(browserNetwork.waitForOnline(new AbortController().signal)).resolves.toBeUndefined();
  });

  it("should wait for the online event while offline", async () => {
    setOnline(false);
    const done = jest.fn();
    browserNetwork.waitForOnline(new AbortController().signal).then(done);

    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("online"));
    await Promise.resolve();

    expect(done).toHaveBeenCalled();
  });

  it("should stop waiting when aborted", async () => {
    setOnline(false);
    const controller = new AbortController();
    const done = jest.fn();
    browserNetwork.waitForOnline(controller.signal).then(done);

    controller.abort();
    await Promise.resolve();

    expect(done).toHaveBeenCalled();
  });
});
