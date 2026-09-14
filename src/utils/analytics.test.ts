import { sendGTMEvent } from "@next/third-parties/google";

import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "./analytics";

jest.mock("@next/third-parties/google", () => ({
  sendGTMEvent: jest.fn(),
}));

describe("trackEvent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should forward the event, category, and params to sendGTMEvent", () => {
    trackEvent(GA_EVENTS.SEARCH_SUBMIT, ANALYTICS_CATEGORY.SEARCH, { query: "test" });

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.SEARCH_SUBMIT,
      event_category: ANALYTICS_CATEGORY.SEARCH,
      query: "test",
    });
  });

  it("should forward the event and category without params when none are given", () => {
    trackEvent(GA_EVENTS.LOGOUT, ANALYTICS_CATEGORY.AUTH);

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.LOGOUT,
      event_category: ANALYTICS_CATEGORY.AUTH,
    });
  });

  it("should not call sendGTMEvent when window is undefined", () => {
    const windowSpy = jest.spyOn(global, "window", "get").mockReturnValue(undefined as unknown as Window & typeof globalThis);

    trackEvent(GA_EVENTS.LOGOUT, ANALYTICS_CATEGORY.AUTH);

    expect(sendGTMEvent).not.toHaveBeenCalled();

    windowSpy.mockRestore();
  });
});
