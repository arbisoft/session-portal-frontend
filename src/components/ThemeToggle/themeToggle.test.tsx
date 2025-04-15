import { useColorScheme } from "@mui/material/styles";

import { customRender as render, screen, fireEvent } from "@/jest/utils/testUtils";

import ThemeToggle from "./themeToggle";

jest.mock("@mui/material/styles", () => ({
  ...jest.requireActual("@mui/material/styles"), // Preserve other exports
  useColorScheme: jest.fn(), // Mock useColorScheme
}));

describe("ThemeToggle", () => {
  const mockSetMode = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("renders the light mode button as active when mode is light", () => {
    // Mock the return value of useColorScheme
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "light",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);

    // Check that the light mode button is active
    const lightButton = screen.getByRole("button", { name: /light/i });
    expect(lightButton).toHaveClass("MuiButton-contained");

    // Check that the other buttons are not active
    const systemButton = screen.getByRole("button", { name: /system/i });
    expect(systemButton).not.toHaveClass("MuiButton-contained");

    const darkButton = screen.getByRole("button", { name: /dark/i });
    expect(darkButton).not.toHaveClass("MuiButton-contained");
  });

  it("renders the system mode button as active when mode is system", () => {
    // Mock the return value of useColorScheme
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "system",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);

    // Check that the system mode button is active
    const systemButton = screen.getByRole("button", { name: /system/i });
    expect(systemButton).toHaveClass("MuiButton-contained");

    // Check that the other buttons are not active
    const lightButton = screen.getByRole("button", { name: /light/i });
    expect(lightButton).not.toHaveClass("MuiButton-contained");

    const darkButton = screen.getByRole("button", { name: /dark/i });
    expect(darkButton).not.toHaveClass("MuiButton-contained");
  });

  it("renders the dark mode button as active when mode is dark", () => {
    // Mock the return value of useColorScheme
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "dark",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);

    // Check that the dark mode button is active
    const darkButton = screen.getByRole("button", { name: /dark/i });
    expect(darkButton).toHaveClass("MuiButton-contained");

    // Check that the other buttons are not active
    const lightButton = screen.getByRole("button", { name: /light/i });
    expect(lightButton).not.toHaveClass("MuiButton-contained");

    const systemButton = screen.getByRole("button", { name: /system/i });
    expect(systemButton).not.toHaveClass("MuiButton-contained");
  });

  it("calls setMode with 'light' when the light mode button is clicked", () => {
    // Mock the return value of useColorScheme
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "system",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);

    // Simulate a click on the light mode button
    const lightButton = screen.getByRole("button", { name: /light/i });
    fireEvent.click(lightButton);

    // Verify that setMode was called with 'light'
    expect(mockSetMode).toHaveBeenCalledWith("light");
  });

  it("calls setMode with 'system' when the system mode button is clicked", () => {
    // Mock the return value of useColorScheme
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "dark",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);

    // Simulate a click on the system mode button
    const systemButton = screen.getByRole("button", { name: /system/i });
    fireEvent.click(systemButton);

    // Verify that setMode was called with 'system'
    expect(mockSetMode).toHaveBeenCalledWith("system");
  });

  it("calls setMode with 'dark' when the dark mode button is clicked", () => {
    // Mock the return value of useColorScheme
    (useColorScheme as jest.Mock).mockReturnValue({
      mode: "light",
      setMode: mockSetMode,
    });

    render(<ThemeToggle />);

    // Simulate a click on the dark mode button
    const darkButton = screen.getByRole("button", { name: /dark/i });
    fireEvent.click(darkButton);

    // Verify that setMode was called with 'dark'
    expect(mockSetMode).toHaveBeenCalledWith("dark");
  });

  test("should snapshot test for ThemeToggle", () => {
    const { asFragment } = render(<ThemeToggle />);
    expect(asFragment()).toMatchSnapshot();
  });
});
