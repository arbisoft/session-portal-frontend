import { sendGTMEvent } from "@next/third-parties/google";
import { usePathname, useSearchParams } from "next/navigation";

import useSidebar from "@/hooks/useSidebar";
import { screen, fireEvent, waitFor, customRender, within } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import Sidebar from "./sidebar";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

jest.mock("@/hooks/useSidebar", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  __esModule: true,
  usePathname: jest.fn().mockReturnValue("/some-path"),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null), // Mocking no tag selected initially
  })),
}));

const mockNavigateTo = jest.fn();
jest.mock("@/hooks/useNavigation", () => ({
  ...jest.requireActual("@/hooks/useNavigation"),
  __esModule: true,
  default: () => ({
    navigateTo: mockNavigateTo,
  }),
}));

describe("Sidebar Component", () => {
  const mockItems = [
    { id: "1", name: "Test-1" },
    { id: "2", name: "Test-2" },
    { id: "3", name: "Test-3" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue({ get: jest.fn(() => null) });
    (useSidebar as jest.Mock).mockReturnValue({
      playlists: mockItems,
      arePlaylistsLoading: false,
      tags: mockItems,
    });
  });

  it("should render Sidebar without crashing", () => {
    customRender(<Sidebar />);
    expect(screen.getByTestId("sidebar-container")).toBeInTheDocument();
  });

  it("should render all sidebar items", () => {
    customRender(<Sidebar />);
    expect(screen.getByTestId("sidebar-item-All")).toBeInTheDocument();
    mockItems.forEach((item) => {
      expect(screen.getByTestId(`sidebar-item-${item.name}`)).toBeInTheDocument();
    });
  });

  it("should mark the playlist from the URL as the current page", () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => (key === "playlist" ? "Test-2" : null)),
    });

    customRender(<Sidebar />);

    expect(screen.getByTestId("sidebar-item-Test-2")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("sidebar-item-Test-1")).not.toHaveAttribute("aria-current");
  });

  it("should fill the tag chip from the URL", () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => (key === "tag" ? "Test-3" : null)),
    });

    customRender(<Sidebar />);

    expect(screen.getByTestId("sidebar-tags-Test-3")).toHaveClass("MuiChip-filled");
    expect(screen.getByTestId("sidebar-tags-Test-1")).toHaveClass("MuiChip-outlined");
  });

  it("should highlight selected item", async () => {
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-All");

    fireEvent.click(item);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-item-All")).toHaveClass("Mui-selected");
    });
  });

  it("should call navigateTo when a sidebar item is clicked", async () => {
    customRender(<Sidebar />);
    const firstItem = screen.getByTestId("sidebar-item-Test-1");

    fireEvent.click(firstItem);

    await waitFor(() => {
      expect(firstItem).toHaveAttribute("href", "/videos?playlist=Test-1");
    });
  });

  it("should render sidebar item icons", () => {
    customRender(<Sidebar />);
    expect(screen.getAllByTestId("sidebar-item-icon")).toHaveLength(mockItems.length + 1);
  });

  it("should highlight the selected tag", async () => {
    (usePathname as jest.Mock).mockReturnValue("videos?playlist=Test-1");
    customRender(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-item-Test-2")).not.toHaveClass("Mui-selected");
    });
  });

  it("should allow menu items to be clickable", async () => {
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-All");

    fireEvent.click(item);

    await waitFor(() => {
      expect(item).toHaveAttribute("href", "/videos");
    });
  });

  it("should not change selection when clicking on the same item twice", async () => {
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-All");

    fireEvent.click(item);
    fireEvent.click(item);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-item-All")).toHaveClass("Mui-selected");
    });
  });

  it("should support multiple clicks on different items", async () => {
    customRender(<Sidebar />);
    const item1 = screen.getByTestId("sidebar-item-All");
    const item2 = screen.getByTestId("sidebar-item-Test-1");

    fireEvent.click(item1);
    fireEvent.click(item2);
    await waitFor(() => {
      expect(item2).not.toHaveClass("Mui-selected");
    });
  });

  it("should render loading skeleton when data is loading", async () => {
    (useSidebar as jest.Mock).mockReturnValue({ playlists: [], arePlaylistsLoading: true, tags: [] });

    customRender(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });
  });

  it("should match snapshot", () => {
    const { asFragment } = customRender(<Sidebar />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("should render sidebar tags when data is loaded", async () => {
    customRender(<Sidebar />);

    await waitFor(() => {
      expect(within(screen.getByTestId("sidebar-tags")).getAllByRole("link")).toHaveLength(mockItems.length);
    });
  });

  it("should navigate when clicking on a menu item", async () => {
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-Test-2");

    fireEvent.click(item);

    await waitFor(() => {
      expect(item).toHaveAttribute("href", "/videos?playlist=Test-2");
    });
  });

  it("should show loading state when data is being fetched", async () => {
    (useSidebar as jest.Mock).mockReturnValue({
      arePlaylistsLoading: true,
      playlists: [],
      tags: [],
    });

    customRender(<Sidebar />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should allow menu item click when only one item exists", () => {
    (useSidebar as jest.Mock).mockReturnValue({ playlists: [], tags: [], arePlaylistsLoading: false });
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-All");
    fireEvent.click(item);
    expect(item).toBeTruthy();
  });

  it("should render all tags", () => {
    customRender(<Sidebar />);
    const tagNames = ["Test-1", "Test-2", "Test-3"];
    tagNames.forEach((name) => {
      expect(screen.getByTestId(`sidebar-tags-${name}`)).toBeInTheDocument();
    });
  });

  it("should highlight the selected tag correctly", () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("tag=Test-2"));
    customRender(<Sidebar />);
    const selectedTag = screen.getByTestId("sidebar-tags-Test-2");
    expect(selectedTag).toHaveClass("MuiChip-filled");
  });

  it("should allow clicking on a tag and trigger navigation", () => {
    customRender(<Sidebar />);
    const tag = screen.getByTestId("sidebar-tags-Test-1");
    fireEvent.click(tag);
    expect(tag).toHaveAttribute("href", "/videos?tag=Test-1");
  });
});

describe("Sidebar Home item filter", () => {
  const mockPlaylists = [{ id: "1", name: "Test-1" }];

  const mockSearch = (values: Record<string, string>) =>
    (useSearchParams as jest.Mock).mockReturnValue({ get: jest.fn((key: string) => values[key] ?? null) });

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/videos");
    mockSearch({});
    (useSidebar as jest.Mock).mockReturnValue({ playlists: mockPlaylists, arePlaylistsLoading: false, tags: [] });
  });

  const openFilterMenu = () => {
    fireEvent.click(screen.getByTestId("sidebar-filter-button"));
    return screen.getByRole("menu", { name: "Filter and sort videos" });
  };

  it("should label the first sidebar item Home", () => {
    customRender(<Sidebar />);

    expect(within(screen.getByTestId("sidebar-item-All")).getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("All Videos")).not.toBeInTheDocument();
  });

  it("should keep the filter button outside the Home link and the playlist menu", () => {
    customRender(<Sidebar />);

    const filterButton = screen.getByTestId("sidebar-filter-button");
    expect(screen.getByTestId("sidebar-item-All")).not.toContainElement(filterButton);
    expect(screen.getByRole("menu", { name: "Video playlists" })).not.toContainElement(filterButton);
  });

  it("should open the sort and filter menu from the filter button", () => {
    customRender(<Sidebar />);
    const filterButton = screen.getByTestId("sidebar-filter-button");
    expect(filterButton).toHaveAttribute("aria-expanded", "false");

    const menu = openFilterMenu();

    expect(filterButton).toHaveAttribute("aria-expanded", "true");
    expect(within(menu).getByText("Sort By")).toBeInTheDocument();
    expect(within(menu).getByRole("menuitemradio", { name: "Newest first" })).toHaveAttribute("aria-checked", "true");
    expect(within(menu).getByText("Filter by")).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Clear all filters" })).toBeInTheDocument();
  });

  it("should sort oldest first and keep the current playlist and year", async () => {
    mockSearch({ playlist: "Test-1", year: "2024" });
    customRender(<Sidebar />);

    fireEvent.click(within(openFilterMenu()).getByRole("menuitemradio", { name: "Oldest first" }));

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { playlist: "Test-1", year: "2024", order: "event_time" });
    await waitFor(() => expect(screen.queryByRole("menu", { name: "Filter and sort videos" })).not.toBeInTheDocument());
  });

  it("should filter by the chosen year", () => {
    customRender(<Sidebar />);
    const year = String(new Date().getFullYear() - 1);

    fireEvent.click(within(openFilterMenu()).getByRole("menuitemradio", { name: year }));

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { year });
  });

  it("should show the year from the URL as selected", () => {
    mockSearch({ year: "2023" });
    customRender(<Sidebar />);

    expect(within(openFilterMenu()).getByRole("menuitemradio", { name: "2023" })).toHaveAttribute("aria-checked", "true");
  });

  it("should clear sort and year but keep the current view", () => {
    mockSearch({ tag: "Test-3", order: "event_time", year: "2024" });
    customRender(<Sidebar />);

    fireEvent.click(within(openFilterMenu()).getByRole("menuitem", { name: "Clear all filters" }));

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { tag: "Test-3" });
  });

  it("should start from the unfiltered Home view when filtering from another page", () => {
    (usePathname as jest.Mock).mockReturnValue("/videos/my-video");
    mockSearch({ tag: "Test-3" });
    customRender(<Sidebar />);

    fireEvent.click(within(openFilterMenu()).getByRole("menuitemradio", { name: "Oldest first" }));

    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { order: "event_time" });
  });

  it("should not let the filter button click reach a parent that closes the drawer", () => {
    const onParentClick = jest.fn();
    customRender(
      <div onClick={onParentClick}>
        <Sidebar />
      </div>
    );

    fireEvent.click(screen.getByTestId("sidebar-filter-button"));

    expect(onParentClick).not.toHaveBeenCalled();
    expect(screen.getByRole("menu", { name: "Filter and sort videos" })).toBeInTheDocument();
  });

  it("should link the filter button to its menu with unique ids", () => {
    customRender(<Sidebar />);
    const button = screen.getByTestId("sidebar-filter-button");

    const menu = openFilterMenu();

    expect(menu).toHaveAttribute("aria-labelledby", button.id);
    const controlledId = button.getAttribute("aria-controls") ?? "";
    expect(controlledId).not.toBe("");
    expect(document.querySelectorAll(`[id="${controlledId}"]`)).toHaveLength(1);
    expect(document.getElementById(controlledId)).toContainElement(menu);
  });

  it("should not navigate just by opening the menu or rendering the sidebar", () => {
    customRender(<Sidebar />);
    openFilterMenu();

    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("should keep reporting the Home item as the All Videos playlist for continuity of historical data", () => {
    customRender(<Sidebar />);

    fireEvent.click(screen.getByTestId("sidebar-item-All"));

    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: GA_EVENTS.SIDEBAR_PLAYLIST_SELECT,
      event_category: ANALYTICS_CATEGORY.SIDEBAR,
      playlist: "All Videos",
    });
  });

  it("should not report an analytics event just for opening the filter menu", () => {
    customRender(<Sidebar />);

    openFilterMenu();

    expect(sendGTMEvent).not.toHaveBeenCalled();
  });
});
