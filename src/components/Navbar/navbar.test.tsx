import { act, fireEvent, customRender as render, screen } from "@/jest/utils/testUtils";

import Navbar from "./navbar";

describe("Navbar Component", () => {
  test("should renders Navbar without crashing", () => {
    render(<Navbar />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("should renders the logo with YouTube icon", () => {
    render(<Navbar />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("Arbisoft Sessions Portal")).toBeInTheDocument();
  });

  test("should renders search input", () => {
    render(<Navbar />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  test("should renders avatar button", () => {
    render(<Navbar />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("should opens user menu when avatar is clicked", () => {
    render(<Navbar />);
    const avatarButton = screen.getByRole("button");
    fireEvent.click(avatarButton);
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  test("should closes user menu when menu item is clicked", () => {
    render(<Navbar />);
    const avatarButton = screen.getByRole("button");
    fireEvent.click(avatarButton);
    const menuItem = screen.getByText("Profile");
    fireEvent.click(menuItem);
    expect(menuItem).not.toBeVisible();
  });

  test("should search input is focusable", () => {
    render(<Navbar />);
    const searchInput = screen.getByPlaceholderText("Search...");
    act(() => {
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });
  });

  test("should user menu contains all settings", () => {
    render(<Navbar />);
    const avatarButton = screen.getByRole("button");
    fireEvent.click(avatarButton);
    const settings = ["Profile", "Account", "Dashboard", "Logout"];
    settings.forEach((setting) => {
      expect(screen.getByText(setting)).toBeInTheDocument();
    });
  });

  test("should applies correct styles for the search box", () => {
    render(<Navbar />);
    const searchBox = screen.getByPlaceholderText("Search...");
    expect(searchBox).toHaveStyle("color: currentColor");
  });

  test("should tooltip is present on avatar button", async () => {
    render(<Navbar />);
    const avatarButton = screen.getByRole("button");
    fireEvent.mouseOver(avatarButton);
    expect(await screen.findByText("Open settings")).toBeInTheDocument();
  });

  test("should search icon is displayed", () => {
    render(<Navbar />);
    expect(screen.getByTestId("SearchIcon")).toBeInTheDocument();
  });

  test("should snapshot test for Navbar", () => {
    const { asFragment } = render(<Navbar />);
    expect(asFragment()).toMatchSnapshot();
  });
});
