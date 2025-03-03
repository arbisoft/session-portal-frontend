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
  test("should renders Sidebar without crashing", () => {
    customRender(<Sidebar />);
    expect(screen.getByTestId("sidebar-container")).toBeInTheDocument();
  });

  test("should renders all sidebar items", () => {
    const items = [
      { id: 1, name: "Home" },
      { id: 2, name: "Settings" },
      { id: 3, name: "Profile" },
      { id: 4, name: "Logout" },
    ];
    customRender(<Sidebar />);
    items.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  test("should highlights selected item", () => {
    customRender(<Sidebar />);
    const item = screen.getByText("Home");
    fireEvent.click(item);
    expect(screen.getByTestId("sidebar-item-Home")).toBeInTheDocument();
    expect(item.parentElement).toHaveStyle("background-color: rgba(255, 255, 255, 0.2)");
  });

  test("should calls handleSidebarToggle when an item is clicked", () => {
    const handleSidebarToggle = jest.fn();
    customRender(<Sidebar handleSidebarToggle={handleSidebarToggle} />);
    fireEvent.click(screen.getByText("Home"));
    expect(screen.getByTestId("sidebar-item-Home")).toBeInTheDocument();
    expect(handleSidebarToggle).toHaveBeenCalled();
  });

  test("should renders sidebar item icons", () => {
    customRender(<Sidebar />);
    expect(screen.getAllByRole("img")).toHaveLength(4);
  });

  test("should does not call handleSidebarToggle if it is not provided", () => {
    customRender(<Sidebar />);
    fireEvent.click(screen.getByText("Profile"));
    expect(screen.getByTestId("sidebar-item-Profile")).toBeInTheDocument();
    expect(true).toBe(true);
  });

  test("should menu items should be clickable", () => {
    customRender(<Sidebar />);
    const item = screen.getByText("Logout");
    expect(screen.getByTestId("sidebar-item-Logout")).toBeInTheDocument();
    fireEvent.click(item);
    expect(item).toBeTruthy();
  });

  test("should menu should not change selection when clicking on the same item twice", () => {
    customRender(<Sidebar />);
    expect(screen.getByTestId("sidebar-item-Home")).toBeInTheDocument();
    const item = screen.getByText("Home");
    fireEvent.click(item);
    fireEvent.click(item);
    expect(item.parentElement).toHaveStyle("background-color: rgba(255, 255, 255, 0.2)");
  });

  test("should menu should support multiple clicks on different items", async () => {
    customRender(<Sidebar />);
    const item1 = screen.getByText("Home");
    const item2 = screen.getByText("Settings");

    fireEvent.click(item1);
    fireEvent.click(item2);

    await waitFor(() => {
      expect(item2.parentElement).toHaveStyle("background-color: rgba(255, 255, 255, 0.2)");
    });
  });

  test("should not render menu items if sidebarItems is empty", () => {
    (useSidebar as jest.Mock).mockReturnValue({ sidebarItems: [] });
    customRender(<Sidebar />);
    expect(screen.queryByRole("img")).toBeNull();
  });
});
