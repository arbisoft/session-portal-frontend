import { usePathname, useSearchParams } from "next/navigation";

import useSidebar from "@/hooks/useSidebar";
import { screen, fireEvent, waitFor, customRender } from "@/jest/utils/testUtils";

import Sidebar from "./sidebar";

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

  it("should highlight selected item", async () => {
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-All");

    fireEvent.click(item);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-item-All")).toHaveStyle("background-color: transparent");
    });
  });

  it("should call navigateTo when a sidebar item is clicked", async () => {
    customRender(<Sidebar />);
    const firstItem = screen.getByTestId("sidebar-item-Test-1");

    fireEvent.click(firstItem);

    await waitFor(() => {
      expect(mockNavigateTo).toHaveBeenCalledWith("videos", { playlist: "Test-1" });
    });
  });

  it("should render sidebar item icons", () => {
    customRender(<Sidebar />);
    expect(screen.getAllByRole("img")).toHaveLength(mockItems.length + 1);
  });

  it("should highlight the selected tag", async () => {
    (usePathname as jest.Mock).mockReturnValue("videos?playlist=Test-1");
    customRender(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-item-Test-2")).toHaveStyle("background-color: transparent");
    });
  });

  it("should allow menu items to be clickable", async () => {
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-All");

    fireEvent.click(item);

    await waitFor(() => {
      expect(mockNavigateTo).toHaveBeenCalledWith("videos");
    });
  });

  it("should not change selection when clicking on the same item twice", async () => {
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-All");

    fireEvent.click(item);
    fireEvent.click(item);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-item-All")).toHaveStyle("background-color: transparent");
    });
  });

  it("should support multiple clicks on different items", async () => {
    customRender(<Sidebar />);
    const item1 = screen.getByTestId("sidebar-item-All");
    const item2 = screen.getByTestId("sidebar-item-Test-1");

    fireEvent.click(item1);
    fireEvent.click(item2);
    await waitFor(() => {
      expect(item2).toHaveStyle("background-color: transparent");
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
      expect(screen.getAllByRole("button")).toHaveLength(mockItems.length);
    });
  });

  it("should navigate when clicking on a menu item", async () => {
    customRender(<Sidebar />);
    const item = screen.getByTestId("sidebar-item-Test-2");

    fireEvent.click(item);

    await waitFor(() => {
      expect(mockNavigateTo).toHaveBeenCalledWith("videos", { playlist: "Test-2" });
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
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("tag=2"));
    customRender(<Sidebar />);
    const selectedTag = screen.getByTestId("sidebar-item-Test-2");
    expect(selectedTag).toHaveStyle("background-color: transparent");
  });

  it("should allow clicking on a tag and trigger navigation", () => {
    customRender(<Sidebar />);
    const tag = screen.getByTestId("sidebar-tags-Test-1");
    fireEvent.click(tag);
    expect(mockNavigateTo).toHaveBeenCalledWith("videos", { tag: "Test-1" });
  });
});
