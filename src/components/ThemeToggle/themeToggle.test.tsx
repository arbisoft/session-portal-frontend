import { useColorScheme } from "@mui/material/styles";

import { customRender as render, screen, fireEvent } from "@/jest/utils/testUtils";

import ThemeToggle from "./themeToggle";

// Mock useColorScheme
jest.mock("@mui/material/styles", () => ({
  ...jest.requireActual("@mui/material/styles"),
  useColorScheme: jest.fn(),
}));

describe("ThemeToggle", () => {
  const mockSetMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders light mode icon when current mode is dark", () => {
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "dark",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);

    // Check that the light mode icon is rendered (Brightness7)
    expect(screen.getByRole("dark-mode-button")).toBeInTheDocument();
    expect(screen.getByTestId("Brightness7Icon")).toBeInTheDocument();
  });

  it("renders dark mode icon when current mode is light", () => {
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "light",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);

    // Check that the dark mode icon is rendered (Brightness4)
    expect(screen.getByRole("dark-mode-button")).toBeInTheDocument();
    expect(screen.getByTestId("Brightness4Icon")).toBeInTheDocument();
  });

  it("toggles from dark to light mode on click", () => {
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "dark",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);
    const toggleButton = screen.getByRole("dark-mode-button");

    fireEvent.click(toggleButton);

    expect(mockSetMode).toHaveBeenCalledWith("light");
  });

  it("toggles from light to dark mode on click", () => {
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "light",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);
    const toggleButton = screen.getByRole("dark-mode-button");

    fireEvent.click(toggleButton);

    expect(mockSetMode).toHaveBeenCalledWith("dark");
  });

  it("matches snapshot", () => {
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "light",
      setMode: mockSetMode,
    });

    const { asFragment } = render(<ThemeToggle />);
    expect(asFragment()).toMatchSnapshot();
  });
});
