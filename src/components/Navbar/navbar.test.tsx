import { ReactElement } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";

import { act, fireEvent, screen, waitFor, render, RenderOptions } from "@/jest/utils/testUtils";
import { loginActions } from "@/redux/login/slice";
import { persistor } from "@/redux/store/configureStore";

import ThemeProvider from "../theme/theme-provider";

import Navbar from "./navbar";

// Mock Redux hooks
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"), // Preserve other exports
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock persistor
jest.mock("@/redux/store/configureStore", () => ({
  persistor: {
    purge: jest.fn(),
    persist: jest.fn(),
  },
}));

const mockStore = configureStore({
  reducer: {
    // Add your reducers here
    login: () => ({
      userInfo: {
        full_name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
      },
    }),
  },
});

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, {
    wrapper: ({ children }) => (
      <Provider store={mockStore}>
        <ThemeProvider>{children}</ThemeProvider>
      </Provider>
    ),
    ...options,
  });

describe("Navbar Component", () => {
  const mockDispatch = jest.fn();
  const mockUserInfo = {
    full_name: "John Doe",
    avatar: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    // Mock useSelector to return userInfo
    (useSelector as unknown as jest.Mock).mockReturnValue(mockUserInfo);

    // Mock useDispatch to return mockDispatch
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("should render Navbar without crashing", () => {
    customRender(<Navbar />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("should render the logo with YouTube icon and text", () => {
    render(<Navbar />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("Arbisoft Sessions Portal")).toBeInTheDocument();
    expect(screen.getByTestId("YouTubeIcon")).toBeInTheDocument();
  });

  test("should render search input", () => {
    render(<Navbar />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  test("should render avatar button", () => {
    render(<Navbar />);
    expect(screen.getByTestId("avatar-btn")).toBeInTheDocument();
  });

  test("should open user menu when avatar is clicked", () => {
    render(<Navbar />);
    const avatarButton = screen.getByTestId("avatar-btn");
    fireEvent.click(avatarButton);
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  test("should close user menu when menu item is clicked", () => {
    render(<Navbar />);
    const avatarButton = screen.getByTestId("Profile");
    fireEvent.click(avatarButton);
    const menuItem = screen.getByText("Profile");
    fireEvent.click(menuItem);
    expect(menuItem).not.toBeVisible();
  });

  test("should focus on search input when clicked", () => {
    render(<Navbar />);
    const searchInput = screen.getByPlaceholderText("Search...");
    act(() => {
      searchInput.focus();
    });
    expect(searchInput).toHaveFocus();
  });

  test("should user menu contains all settings and logout option", () => {
    render(<Navbar />);
    const avatarButton = screen.getByTestId("avatar-btn");
    fireEvent.click(avatarButton);
    const settings = ["Profile", "Account", "Dashboard", "Logout"];
    settings.forEach((setting) => {
      expect(screen.getByText(setting)).toBeInTheDocument();
    });
  });

  test("should apply correct styles for the search box", () => {
    render(<Navbar />);
    const searchBox = screen.getByPlaceholderText("Search...");
    expect(searchBox).toHaveStyle("color: currentColor");
  });

  test("should display tooltip on avatar button hover", async () => {
    render(<Navbar />);
    const avatarButton = screen.getByTestId("avatar-btn");
    fireEvent.mouseOver(avatarButton);
    expect(await screen.findByText("Open settings")).toBeInTheDocument();
  });

  test("should render search icon", () => {
    render(<Navbar />);
    expect(screen.getByTestId("SearchIcon")).toBeInTheDocument();
  });

  test("should call logout and purge persistor when logout is clicked", async () => {
    render(<Navbar />);
    const avatarButton = screen.getByRole("button", { name: /open settings/i });
    fireEvent.click(avatarButton);

    // Click the logout menu item
    const logoutMenuItem = screen.getByText("Logout");
    fireEvent.click(logoutMenuItem);

    // Verify that logout action and persistor purge are called
    expect(mockDispatch).toHaveBeenCalledWith(loginActions.logout());
    expect(persistor.purge).toHaveBeenCalled();

    // Wait for persistor.persist to be called
    await waitFor(() => expect(persistor.persist).toHaveBeenCalled());
  });

  test("should render ThemeToggle in the user menu", () => {
    render(<Navbar />);
    const avatarButton = screen.getByRole("button", { name: /open settings/i });
    fireEvent.click(avatarButton);
    expect(screen.getByRole("button", { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /system/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dark/i })).toBeInTheDocument();
  });

  test("should match snapshot", () => {
    const { asFragment } = render(<Navbar />);
    expect(asFragment()).toMatchSnapshot();
  });
});
