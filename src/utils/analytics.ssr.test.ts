/**
 * @jest-environment node
 */
import { sendGTMEvent } from "@next/third-parties/google";

import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "./analytics";

jest.mock("@next/third-parties/google", () => ({
  sendGTMEvent: jest.fn(),
}));

describe("trackEvent (server environment)", () => {
  it("should not call sendGTMEvent when window is undefined", () => {
    trackEvent(GA_EVENTS.LOGOUT, ANALYTICS_CATEGORY.AUTH);

    expect(sendGTMEvent).not.toHaveBeenCalled();
  });
});
