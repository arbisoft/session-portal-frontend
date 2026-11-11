import { customRender as render, fireEvent, screen } from "@/jest/utils/testUtils";

import VideosListingPage from "./videosListingPage";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockNavigateTo = jest.fn();
let mockQuery = "";

jest.mock("next/navigation", () => ({
  usePathname: () => "/videos",
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(mockQuery),
}));

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  ALLOWED_PAGES: { videos: "/videos" },
  default: () => ({ navigateTo: mockNavigateTo, getPageUrl: jest.fn() }),
}));

jest.mock("@/redux/events/apiSlice", () => ({
  useGetEventsQuery: () => ({
    data: { results: [], next: null },
    isFetching: false,
    isLoading: false,
    isUninitialized: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock("@/components/containers/MainLayoutContainer", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/FeaturedSlider/featuredSlider", () => ({ FeaturedSlider: () => null }));

describe("VideosListingPage filter and sort", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = "";
  });

  it("should show the labelled Filter and Sort control next to the title without any active filter chips", () => {
    render(<VideosListingPage />);

    expect(screen.getByRole("heading", { name: "All videos" })).toBeInTheDocument();
    expect(screen.getByText("Filter and Sort")).toBeVisible();
    expect(screen.getByRole("button", { name: /Filter and Sort/ })).toHaveTextContent("Newest first");
    expect(screen.queryByTestId("active-filters")).not.toBeInTheDocument();
  });

  it("should show the applied year and sort on the page, with a way to clear them", () => {
    mockQuery = "year=2020&order=event_time";
    render(<VideosListingPage />);

    expect(screen.getByRole("button", { name: /Filter and Sort/ })).toHaveTextContent("2020 · Oldest first");
    expect(screen.getByText("Year: 2020")).toBeVisible();
    expect(screen.getByText("Sort: Oldest first")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(mockNavigateTo).toHaveBeenCalledWith("videos", {});
  });

  it("should keep the sort when only the year chip is removed", () => {
    mockQuery = "year=2020&order=event_time";
    render(<VideosListingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Remove filter Year: 2020" }));

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { order: "event_time" });
  });
});
