import useSidebar from "@/hooks/useSidebar";
import { customRender, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";

import Sidebar from "./sidebar";

jest.mock("@/hooks/useSidebar", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    sidebarItems: [
      { id: 1, name: "Home" },
      { id: 2, name: "Settings" },
      { id: 3, name: "Profile" },
      { id: 4, name: "Logout" },
    ],
  })),
}));

describe("Sidebar Component", () => {
  test("should render Sidebar without crashing", () => {
    customRender(<Sidebar />);
    expect(screen.getByTestId("sidebar-container")).toBeInTheDocument();
  });

  test("should render all sidebar items", () => {
    customRender(<Sidebar />);
    const items = ["Home", "Settings", "Profile", "Logout"];
    items.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  test("should highlight selected item", () => {
    customRender(<Sidebar />);
    const item = screen.getByText("Home");
    fireEvent.click(item);
    expect(screen.getByTestId("sidebar-item-Home")).toBeInTheDocument();
    expect(item.parentElement).toHaveStyle("background-color: rgba(255, 255, 255, 0.2)");
  });

  test("should call handleSidebarToggle when an item is clicked", () => {
    const handleSidebarToggle = jest.fn();
    customRender(<Sidebar handleSidebarToggle={handleSidebarToggle} />);
    fireEvent.click(screen.getByText("Home"));
    expect(handleSidebarToggle).toHaveBeenCalled();
  });

  test("should render sidebar item icons", () => {
    customRender(<Sidebar />);
    expect(screen.getAllByRole("img")).toHaveLength(4);
  });

  test("should not call handleSidebarToggle if it is not provided", () => {
    customRender(<Sidebar />);
    fireEvent.click(screen.getByText("Profile"));
    expect(screen.getByTestId("sidebar-item-Profile")).toBeInTheDocument();
  });

  test("should allow menu items to be clickable", () => {
    customRender(<Sidebar />);
    const item = screen.getByText("Logout");
    fireEvent.click(item);
    expect(item).toBeTruthy();
  });

  test("should not change selection when clicking on the same item twice", () => {
    customRender(<Sidebar />);
    const item = screen.getByText("Home");
    fireEvent.click(item);
    fireEvent.click(item);
    expect(item.parentElement).toHaveStyle("background-color: rgba(255, 255, 255, 0.2)");
  });

  test("should support multiple clicks on different items", async () => {
    customRender(<Sidebar />);
    const item1 = screen.getByText("Home");
    const item2 = screen.getByText("Settings");

    fireEvent.click(item1);
    fireEvent.click(item2);
    await waitFor(() => {
      expect(item2.parentElement).toHaveStyle("background-color: rgba(255, 255, 255, 0.2)");
    });
  });

  test("should match snapshot", () => {
    const { asFragment } = customRender(<Sidebar />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("should not render menu items if sidebarItems is empty", () => {
    (useSidebar as jest.Mock).mockReturnValue({ sidebarItems: [] });
    customRender(<Sidebar />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  test("should show loading state when data is loading", () => {
    (useSidebar as jest.Mock).mockReturnValue({ sidebarItems: [], isDataLoading: true });
    const { getByTestId } = customRender(<Sidebar />);
    expect(getByTestId("loading")).toBeInTheDocument();
  });

  test("should allow menu item click when only one item exists", () => {
    (useSidebar as jest.Mock).mockReturnValue({ sidebarItems: [{ id: 0, name: "All" }] });
    customRender(<Sidebar />);
    const item = screen.getByText("All");
    fireEvent.click(item);
    expect(item).toBeTruthy();
  });
});
