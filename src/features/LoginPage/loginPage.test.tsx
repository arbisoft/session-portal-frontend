import { ReactElement } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { render, RenderOptions, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";

import ThemeProvider from "@/components/theme/theme-provider";
import { loginActions } from "@/redux/login/slice";

import LoginPage from "./loginPage";

const mockUseGoogleLogin = jest.fn();
const mockLoginAndSetCookie = jest.fn();
const mockDispatch = jest.fn();

jest.mock("@react-oauth/google", () => ({
  useGoogleLogin: jest.fn((config) => mockUseGoogleLogin(config)),
}));

const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
  useSearchParams: jest.fn(() => ({ get: mockGet })),
}));

jest.mock("@/app/login/actions", () => ({
  loginAndSetCookie: jest.fn((data) => mockLoginAndSetCookie(data)),
}));

let featureFlag = false;

jest.mock("@/hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({
    isFeatureEnabled: () => featureFlag,
  }),
}));

const mockShowNotification = jest.fn();

jest.mock("@/components/Notification", () => ({
  useNotification: () => ({ showNotification: mockShowNotification }),
}));

const mockNavigateTo = jest.fn();

jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({ navigateTo: mockNavigateTo }),
}));

jest.mock("@/components/ThemeToggle", () => ({
  default: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useTransition: () => [false, (cb: () => void) => cb()],
}));

const mockStore = configureStore({
  reducer: {
    login: () => ({}),
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

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
    featureFlag = false;
  });

  it("renders login page", () => {
    customRender(<LoginPage />);
    expect(screen.getByText("Sessions Portal")).toBeInTheDocument();
  });

  it("renders arbisoft logo", () => {
    customRender(<LoginPage />);
    expect(screen.getByAltText("arbisoft-logo")).toBeInTheDocument();
  });

  it("renders google login button", () => {
    customRender(<LoginPage />);
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
    expect(screen.getByAltText("google-logo")).toBeInTheDocument();
  });

  it("calls useGoogleLogin with handlers", () => {
    customRender(<LoginPage />);
    expect(mockUseGoogleLogin).toHaveBeenCalledWith({
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    });
  });

  it("calls googleLoginHandler when button clicked", () => {
    const loginHandler = jest.fn();
    mockUseGoogleLogin.mockReturnValue(loginHandler);

    customRender(<LoginPage />);

    fireEvent.click(screen.getByTestId("login-button"));

    expect(loginHandler).toHaveBeenCalled();
  });

  it("handles successful login and navigates to videos", async () => {
    let successHandler: ((param: object) => Promise<void>) | undefined;

    mockUseGoogleLogin.mockImplementation(({ onSuccess }) => {
      successHandler = onSuccess;
      return jest.fn();
    });

    mockLoginAndSetCookie.mockResolvedValue({ access: "token" });

    customRender(<LoginPage />);

    if (!successHandler) {
      throw new Error("successHandler was not assigned");
    }

    await successHandler({ access_token: "token123" });

    await waitFor(() => {
      expect(mockLoginAndSetCookie).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(loginActions.login({ access: "token" }));
      expect(mockNavigateTo).toHaveBeenCalledWith("videos");
    });
  });

  it("redirects when redirect_to param exists", async () => {
    mockGet.mockReturnValue("/redirect-path");

    let successHandler: ((param: object) => Promise<void>) | undefined;

    mockUseGoogleLogin.mockImplementation(({ onSuccess }) => {
      successHandler = onSuccess;
      return jest.fn();
    });

    mockLoginAndSetCookie.mockResolvedValue({ access: "token" });

    customRender(<LoginPage />);

    if (!successHandler) {
      throw new Error("successHandler was not assigned");
    }

    await successHandler({ access_token: "token123" });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/redirect-path");
    });
  });

  it("ignores invalid redirect_to path and navigates to videos", async () => {
    mockGet.mockReturnValue("//evil.com");

    let successHandler: ((param: object) => Promise<void>) | undefined;

    mockUseGoogleLogin.mockImplementation(({ onSuccess }) => {
      successHandler = onSuccess;
      return jest.fn();
    });

    mockLoginAndSetCookie.mockResolvedValue({ access: "token" });

    customRender(<LoginPage />);

    if (!successHandler) {
      throw new Error("successHandler was not assigned");
    }

    await successHandler({ access_token: "token123" });

    await waitFor(() => {
      expect(mockNavigateTo).toHaveBeenCalledWith("videos");
      expect(mockPush).not.toHaveBeenCalledWith("//evil.com");
    });
  });

  it("falls back to window location search for redirect_to and navigates correctly", async () => {
    mockGet.mockReturnValue(null);

    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        search: "?redirect_to=%2Fvideos%2F777",
      },
    });

    let successHandler!: (param: object) => Promise<void>;

    mockUseGoogleLogin.mockImplementation(({ onSuccess }) => {
      successHandler = onSuccess;
      return jest.fn();
    });

    mockLoginAndSetCookie.mockResolvedValue({ access: "token" });

    customRender(<LoginPage />);

    await successHandler({ access_token: "token123" });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/videos/777");
    });

    // restore
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("shows error when credential has no access_token", async () => {
    let successHandler: ((param: object) => Promise<void>) | undefined;

    mockUseGoogleLogin.mockImplementation(({ onSuccess }) => {
      successHandler = onSuccess;
      return jest.fn();
    });

    customRender(<LoginPage />);

    if (!successHandler) {
      throw new Error("successHandler was not assigned");
    }

    await successHandler({});

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith({
        message: "Google login failed: No credential received.",
        severity: "error",
      });
    });
  });

  it("handles google login error callback", () => {
    let errorHandler: (() => void) | undefined;

    mockUseGoogleLogin.mockImplementation(({ onError }) => {
      errorHandler = onError;
      return jest.fn();
    });

    customRender(<LoginPage />);

    if (!errorHandler) {
      throw new Error("errorHandler was not assigned");
    }

    errorHandler();

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Authentication Error: Google login failed. Please try again.",
      severity: "error",
    });
  });

  it("does not render theme toggle when feature disabled", () => {
    featureFlag = false;

    customRender(<LoginPage />);

    expect(screen.queryByTestId("theme-toggle")).not.toBeInTheDocument();
  });

  it("creates FormData with auth_token", async () => {
    let successHandler: ((param: object) => Promise<void>) | undefined;
    const appendSpy = jest.spyOn(FormData.prototype, "append");

    mockUseGoogleLogin.mockImplementation(({ onSuccess }) => {
      successHandler = onSuccess;
      return jest.fn();
    });

    mockLoginAndSetCookie.mockResolvedValue({ access: "token" });

    customRender(<LoginPage />);

    if (!successHandler) {
      throw new Error("successHandler was not assigned");
    }

    await successHandler({ access_token: "token123" });

    expect(appendSpy).toHaveBeenCalledWith("auth_token", "token123");
  });
});
