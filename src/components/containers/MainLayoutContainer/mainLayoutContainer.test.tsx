import { useSearchParams } from "next/navigation";

import { customRender as render, screen, waitFor } from "@/jest/utils/testUtils";

import MainLayoutContainer from "./mainLayoutContainer";

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useSearchParams: jest.fn(),
  usePathname: jest.fn().mockReturnValue("/some-path"),
}));

const mockNavigateTo = jest.fn();
jest.mock("@/hooks/useNavigation", () => ({
  __esModule: true,
  default: () => ({
    navigateTo: mockNavigateTo,
    getPageUrl: jest.fn((key) => key),
  }),
}));

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

describe("MainLayoutContainer", () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue("test search"),
    });

    jest.clearAllMocks();
  });

  test("should renders Navbar component", () => {
    render(
      <MainLayoutContainer>
        <div>Test Content</div>
      </MainLayoutContainer>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("should RightSidebar should be hidden on small screens (xs)", () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event("resize"));

    render(
      <MainLayoutContainer rightSidebar={<div>Right Content</div>}>
        <div>Test Content</div>
      </MainLayoutContainer>
    );

    expect(globalThis.innerWidth).toBe(500);

    waitFor(() => {
      expect(screen.queryByTestId("right-sidebar")).toHaveStyle("display:none");
    });
  });

  test("should RightSidebar should be visible on medium and larger screens (md+)", () => {
    global.innerWidth = 1024;
    window.dispatchEvent(new Event("resize"));

    render(
      <MainLayoutContainer rightSidebar={<div>Right Content</div>}>
        <div>Test Content</div>
      </MainLayoutContainer>
    );

    waitFor(() => {
      expect(screen.queryByTestId("right-sidebar")).toHaveStyle("display:block");
    });
  });

  test("should renders Sidebar component inside LeftSidebar", () => {
    render(
      <MainLayoutContainer>
        <div>Test Content</div>
      </MainLayoutContainer>
    );

    expect(screen.getByTestId("left-sidebar")).toBeInTheDocument();
  });

  test("should renders children inside ContentContainer", () => {
    render(
      <MainLayoutContainer>
        <div data-testid="content">Test Content</div>
      </MainLayoutContainer>
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  test("should does not render RightSidebar if rightSidebar prop is undefined", () => {
    render(
      <MainLayoutContainer>
        <div>Test Content</div>
      </MainLayoutContainer>
    );

    expect(screen.queryByTestId("right-sidebar")).not.toBeInTheDocument();
  });

  test("should renders RightSidebar when rightSidebar prop is provided", () => {
    render(
      <MainLayoutContainer rightSidebar={<div>Right Content</div>}>
        <div>Test Content</div>
      </MainLayoutContainer>
    );

    expect(screen.getByTestId("right-sidebar")).toBeInTheDocument();
  });

  test("should renders multiple children correctly", () => {
    render(
      <MainLayoutContainer>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </MainLayoutContainer>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  test("should matches snapshot for UI consistency", () => {
    const { asFragment } = render(
      <MainLayoutContainer rightSidebar={<div>Right Content</div>}>
        <div>Test Content</div>
      </MainLayoutContainer>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
