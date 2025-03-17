import { ReactElement } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { useSearchParams } from "next/navigation";
import { Provider, useDispatch, useSelector } from "react-redux";

import { fireEvent, screen, waitFor, render, RenderOptions, act } from "@/jest/utils/testUtils";
import { selectUserInfo } from "@/redux/login/selectors";
import { loginActions } from "@/redux/login/slice";
import { persistor } from "@/redux/store/configureStore";

import ThemeProvider from "../theme/theme-provider";

import Navbar from "./navbar";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/redux/store/configureStore", () => ({
  persistor: {
    purge: jest.fn(),
    persist: jest.fn(),
  },
}));

const mockNavigateTo = jest.fn();
jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({
    navigateTo: mockNavigateTo,
  }),
}));

const mockStore = configureStore({
  reducer: {
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
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector === selectUserInfo ? mockUserInfo : undefined
    );

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue("test search"),
    });

    jest.clearAllMocks();
  });

  test("should render Navbar without crashing", () => {
    customRender(<Navbar />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("should render logo with YouTube icon and text", () => {
    customRender(<Navbar />);
    expect(screen.getByText("Arbisoft Sessions Portal")).toBeInTheDocument();
    expect(screen.getByTestId("YouTubeIcon")).toBeInTheDocument();
  });

  test("should render avatar button", () => {
    customRender(<Navbar />);
    expect(screen.getByTestId("avatar-btn")).toBeInTheDocument();
  });

  test("should open user menu when avatar is clicked", () => {
    customRender(<Navbar />);
    fireEvent.click(screen.getByTestId("avatar-btn"));
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  test("should close user menu when menu item is clicked", () => {
    customRender(<Navbar />);
    fireEvent.click(screen.getByTestId("avatar-btn"));
    fireEvent.click(screen.getByTestId("Profile"));
    expect(screen.queryByText("Profile")).not.toBeVisible();
  });

  test("should focus on search input when clicked", () => {
    customRender(<Navbar />);
    const searchInput = screen.getByTestId("search-query");
    act(() => {
      searchInput.focus();
    });
    expect(searchInput).toHaveFocus();
  });

  test("should navigate on search submit", () => {
    customRender(<Navbar />);
    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "some test search" } });
    fireEvent.submit(searchInput.closest("form")!);
    expect(mockNavigateTo).toHaveBeenCalledWith("searchResult", { search: "some test search" });
  });

  test("should contain all user menu options", () => {
    customRender(<Navbar />);
    fireEvent.click(screen.getByTestId("avatar-btn"));
    const settings = ["Profile", "Account", "Dashboard", "Logout"];
    settings.forEach((setting) => {
      expect(screen.getByText(setting)).toBeInTheDocument();
    });
  });

  test("should display tooltip on avatar button hover", async () => {
    customRender(<Navbar />);
    fireEvent.mouseOver(screen.getByTestId("avatar-btn"));
    expect(await screen.findByText("Open settings")).toBeInTheDocument();
  });

  test("should clear search input when cancel icon is clicked", () => {
    customRender(<Navbar />);
    const searchInput = screen.getByTestId("search-query");
    fireEvent.change(searchInput, { target: { value: "Test Query" } });
    expect(searchInput).toHaveValue("Test Query");
    fireEvent.click(screen.getByTestId("cancelIcon"));
    expect(searchInput).toHaveValue("");
  });

  test("should call logout and purge persistor when logout is clicked", async () => {
    customRender(<Navbar />);
    fireEvent.click(screen.getByTestId("avatar-btn"));
    fireEvent.click(screen.getByText("Logout"));

    expect(mockDispatch).toHaveBeenCalledWith(loginActions.logout());
    expect(persistor.purge).toHaveBeenCalled();
    await waitFor(() => expect(persistor.persist).toHaveBeenCalled());
  });

  test("should render ThemeToggle in the user menu", () => {
    customRender(<Navbar />);
    fireEvent.click(screen.getByTestId("avatar-btn"));
    expect(screen.getByRole("button", { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /system/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dark/i })).toBeInTheDocument();
  });

  test("should navigate to the videos page when logo is clicked", () => {
    customRender(<Navbar />);
    fireEvent.click(screen.getByTestId("navbar-logo"));
    expect(mockNavigateTo).toHaveBeenCalledWith("videos");
  });

  test("should match snapshot", () => {
    const { asFragment } = customRender(<Navbar />);
    expect(asFragment()).toMatchSnapshot();
  });
});
