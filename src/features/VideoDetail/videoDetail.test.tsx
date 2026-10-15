import { sendGTMEvent } from "@next/third-parties/google";

import { act, customRender as render } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import VideoDetail from "./videoDetail";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockIncrementViewCount = jest.fn();
let mockWatchThreshold: (() => void) | undefined;

jest.mock("next/navigation", () => ({
  useParams: () => ({ videoId: "my-video" }),
}));

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({ navigateTo: jest.fn(), getPageUrl: () => "/videos" }),
}));

jest.mock("@/components/containers/MainLayoutContainer", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/VideoPlayer", () => ({
  __esModule: true,
  default: ({ onWatchThreshold }: { onWatchThreshold: () => void }) => {
    mockWatchThreshold = onWatchThreshold;
    return <div data-testid="video-player" />;
  },
}));

jest.mock("@/redux/events/apiSlice", () => ({
  useEventDetailQuery: () => ({
    data: {
      video_file: "https://cdn.example.com/video.mp4",
      view_count: 3,
      event: { title: "A session", presenters: [], event_time: "2025-01-01T00:00:00Z", description: "d", tags: [] },
    },
    isFetching: false,
    isLoading: false,
    isUninitialized: false,
    error: undefined,
  }),
  useRecommendationQuery: () => ({ data: { results: [], next: null }, isFetching: false }),
  useIncrementViewCountMutation: () => [mockIncrementViewCount],
}));

describe("VideoDetail view count analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWatchThreshold = undefined;
  });

  it("should track when a view is counted and show the updated count", async () => {
    mockIncrementViewCount.mockReturnValue({ unwrap: () => Promise.resolve({ view_count: 4 }) });
    const { findByText } = render(<VideoDetail />);

    await act(async () => {
      mockWatchThreshold?.();
    });

    expect(mockIncrementViewCount).toHaveBeenCalledWith("my-video");
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.VIDEO_VIEW_COUNTED,
      event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
      view_count: 4,
    });
    expect(await findByText("4 views")).toBeInTheDocument();
  });

  it("should track a failed view count without throwing", async () => {
    mockIncrementViewCount.mockReturnValue({ unwrap: () => Promise.reject(new Error("nope")) });
    render(<VideoDetail />);

    await act(async () => {
      mockWatchThreshold?.();
    });

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.VIDEO_VIEW_COUNT_FAILED,
      event_category: ANALYTICS_CATEGORY.VIDEO_PLAYER,
    });
  });
});
