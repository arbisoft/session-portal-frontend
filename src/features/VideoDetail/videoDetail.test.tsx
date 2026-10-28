import { sendGTMEvent } from "@next/third-parties/google";

import { DEFAULT_THUMBNAIL } from "@/constants/constants";
import { act, customRender as render, fireEvent, screen } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import VideoDetail from "./videoDetail";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockIncrementViewCount = jest.fn();
const mockNavigateTo = jest.fn();
let mockWatchThreshold: (() => void) | undefined;
let mockEndReached: (() => void) | undefined;
let mockVideoId: string | undefined = "my-video";

const buildDetailState = (overrides: Record<string, unknown> = {}) => ({
  data: {
    video_file: "https://cdn.example.com/video.mp4",
    view_count: 3,
    event: { title: "A session", presenters: [], event_time: "2025-01-01T00:00:00Z", description: "d", tags: [] },
  },
  isFetching: false,
  isLoading: false,
  isUninitialized: false,
  error: undefined,
  ...overrides,
});

const buildRecommendation = (id: number) => ({
  id,
  slug: `related-${id}`,
  title: `Related ${id}`,
  presenters: [],
  event_time: "2025-01-01T00:00:00Z",
  video_duration: 60,
  description: "",
});

let mockDetailState = buildDetailState();
let mockRecommendationState: Record<string, unknown> = { data: { results: [], next: null }, isFetching: false };

jest.mock("next/navigation", () => ({
  useParams: () => ({ videoId: mockVideoId }),
}));

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({
    navigateTo: mockNavigateTo,
    getPageUrl: (_page: string, params?: { tag?: string }) => `/videos?tag=${params?.tag}`,
  }),
}));

jest.mock("@/components/containers/MainLayoutContainer", () => ({
  __esModule: true,
  default: ({ children, rightSidebar }: { children: React.ReactNode; rightSidebar: React.ReactNode }) => (
    <div>
      {children}
      {rightSidebar}
    </div>
  ),
}));

jest.mock("@/components/VideoPlayer", () => ({
  __esModule: true,
  default: ({ onWatchThreshold, posterSrc }: { onWatchThreshold: () => void; posterSrc: string }) => {
    mockWatchThreshold = onWatchThreshold;
    return <div data-testid="video-player" data-poster={posterSrc} />;
  },
}));

jest.mock("@/components/VideoCard", () => ({
  __esModule: true,
  default: ({ href, data }: { href: string; data: { title: string } }) => (
    <a data-testid="related-card" href={href}>
      {data.title}
    </a>
  ),
}));

// jsdom has no layout, so the real Virtuoso renders no rows; this stand-in renders every item and the footer.
jest.mock("react-virtuoso", () => ({
  Virtuoso: ({
    data,
    itemContent,
    endReached,
    components,
    context,
  }: {
    data: unknown[];
    itemContent: (index: number, item: unknown) => React.ReactNode;
    endReached: () => void;
    components: { Footer: React.ComponentType<{ context: unknown }> };
    context: unknown;
  }) => {
    mockEndReached = endReached;
    const { Footer } = components;
    return (
      <div>
        {data.map((item, index) => (
          <div key={index}>{itemContent(index, item)}</div>
        ))}
        <Footer context={context} />
      </div>
    );
  },
}));

jest.mock("@/redux/events/apiSlice", () => ({
  useEventDetailQuery: () => mockDetailState,
  useRecommendationQuery: () => mockRecommendationState,
  useIncrementViewCountMutation: () => [mockIncrementViewCount],
}));

describe("VideoDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWatchThreshold = undefined;
    mockEndReached = undefined;
    mockVideoId = "my-video";
    mockDetailState = buildDetailState();
    mockRecommendationState = { data: { results: [], next: null }, isFetching: false };
  });

  describe("view count analytics", () => {
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

  describe("page content", () => {
    it("should set the document title from the event title", () => {
      render(<VideoDetail />);

      expect(document.title).toBe("A session - Sessions Portal");
    });

    it("should use a singular label for a single view", () => {
      mockDetailState = buildDetailState({ data: { ...buildDetailState().data, view_count: 1 } });

      render(<VideoDetail />);

      expect(screen.getByText("1 view")).toBeInTheDocument();
    });

    it("should not render a view count when the API does not return one", () => {
      mockDetailState = buildDetailState({ data: { ...buildDetailState().data, view_count: undefined } });

      render(<VideoDetail />);

      expect(screen.queryByText(/views?$/)).not.toBeInTheDocument();
    });

    it("should skip the video player when the event has no video file", () => {
      mockDetailState = buildDetailState({ data: { ...buildDetailState().data, video_file: undefined } });

      render(<VideoDetail />);

      expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "A session" })).toBeInTheDocument();
    });

    it("should use the event thumbnail as the poster when there is one", () => {
      mockDetailState = buildDetailState({
        data: { ...buildDetailState().data, thumbnail: "https://cdn.example.com/thumb.png" },
      });

      render(<VideoDetail />);

      expect(screen.getByTestId("video-player")).toHaveAttribute("data-poster", "https://cdn.example.com/thumb.png");
    });

    it("should fall back to the default poster when the event has no thumbnail", () => {
      render(<VideoDetail />);

      expect(screen.getByTestId("video-player")).toHaveAttribute("data-poster", DEFAULT_THUMBNAIL);
    });

    it("should render a session that has no description or tags", () => {
      const { event } = buildDetailState().data;
      const bareEvent = { title: event.title, presenters: event.presenters, event_time: event.event_time };
      mockDetailState = buildDetailState({ data: { ...buildDetailState().data, event: bareEvent } });

      render(<VideoDetail />);

      expect(screen.getByRole("heading", { name: "A session" })).toBeInTheDocument();
      expect(screen.queryByTestId(/^sidebar-tags-/)).not.toBeInTheDocument();
    });

    it("should list the presenters of the session", () => {
      const { event } = buildDetailState().data;
      mockDetailState = buildDetailState({
        data: {
          ...buildDetailState().data,
          event: { ...event, presenters: [{ id: 1, first_name: "Ada", last_name: "Lovelace" }] },
        },
      });

      render(<VideoDetail />);

      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    });

    it("should render the loading skeleton while the event is loading", () => {
      mockDetailState = buildDetailState({ data: undefined, isFetching: true, isLoading: true });

      render(<VideoDetail />);

      expect(screen.getByTestId("video-player-skeleton")).toBeInTheDocument();
      expect(screen.queryByTestId("video-player")).not.toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("should send the user back to the videos list when the event fails to load", () => {
      mockDetailState = buildDetailState({ data: undefined, error: { status: 404 } });

      render(<VideoDetail />);

      expect(mockNavigateTo).toHaveBeenCalledWith("videos");
      expect(screen.getByTestId("video-player-skeleton")).toBeInTheDocument();
    });

    it("should send the user back to the videos list when there is no video id", () => {
      mockVideoId = undefined;
      mockDetailState = buildDetailState({ data: undefined, isUninitialized: true });

      render(<VideoDetail />);

      expect(mockNavigateTo).toHaveBeenCalledWith("videos");
    });

    it("should not redirect when the event loads successfully", () => {
      render(<VideoDetail />);

      expect(mockNavigateTo).not.toHaveBeenCalled();
    });
  });

  describe("tags", () => {
    beforeEach(() => {
      mockDetailState = buildDetailState({
        data: { ...buildDetailState().data, event: { ...buildDetailState().data.event, tags: ["react", "testing"] } },
      });
    });

    it("should render each tag as a link to the filtered videos list", () => {
      render(<VideoDetail />);

      expect(screen.getByTestId("sidebar-tags-react")).toHaveAttribute("href", "/videos?tag=react");
      expect(screen.getByTestId("sidebar-tags-testing")).toHaveTextContent("#testing");
    });

    it("should track a tag selection from the video detail page", () => {
      render(<VideoDetail />);

      fireEvent.click(screen.getByTestId("sidebar-tags-react"));

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.TAG_SELECT,
        event_category: ANALYTICS_CATEGORY.SIDEBAR,
        tag: "react",
        source: "video_detail",
      });
    });
  });

  describe("recommendations", () => {
    it("should render a card linking to each recommended video", () => {
      mockRecommendationState = {
        data: { results: [buildRecommendation(1), buildRecommendation(2)], next: null },
        isFetching: false,
      };

      render(<VideoDetail />);

      const cards = screen.getAllByTestId("related-card");
      expect(cards).toHaveLength(2);
      expect(cards[0]).toHaveAttribute("href", "/videos/related-1");
    });

    it("should render an empty list before the recommendations have loaded", () => {
      mockRecommendationState = { data: undefined, isFetching: false };

      render(<VideoDetail />);

      expect(screen.queryByTestId("related-card")).not.toBeInTheDocument();
    });

    it("should render placeholder skeletons while more recommendations are loading", () => {
      mockRecommendationState = { data: { results: [], next: null }, isFetching: true };

      const { container } = render(<VideoDetail />);

      expect(container.querySelectorAll(".MuiSkeleton-rounded")).toHaveLength(3);
    });

    it("should load and track the next page when the end of the list is reached", () => {
      mockRecommendationState = { data: { results: [buildRecommendation(1)], next: "page-2" }, isFetching: false };
      render(<VideoDetail />);

      act(() => mockEndReached?.());

      expect(sendGTMEvent).toHaveBeenCalledWith({
        event: GA_EVENTS.RECOMMENDATIONS_LOAD_MORE,
        event_category: ANALYTICS_CATEGORY.RECOMMENDATIONS,
        next_page: 2,
      });
    });

    it("should not request another page when there is no next page", () => {
      mockRecommendationState = { data: { results: [buildRecommendation(1)], next: null }, isFetching: false };
      render(<VideoDetail />);

      act(() => mockEndReached?.());

      expect(sendGTMEvent).not.toHaveBeenCalled();
    });

    it("should not request another page while recommendations are already loading", () => {
      mockRecommendationState = { data: { results: [buildRecommendation(1)], next: "page-2" }, isFetching: true };
      render(<VideoDetail />);

      act(() => mockEndReached?.());

      expect(sendGTMEvent).not.toHaveBeenCalled();
    });
  });
});
