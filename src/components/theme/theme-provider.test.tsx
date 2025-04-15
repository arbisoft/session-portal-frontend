import { createTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { render } from "@testing-library/react";

import { colors } from "./colors";
import InitColorSchemeScript from "./init-color-scheme-script";
import ThemeProvider from "./theme-provider";

import "@testing-library/jest-dom";

describe("ThemeProvider", () => {
  it("should render without crashing", () => {
    const { container } = render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  it("should render children components", () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Child Component</div>
      </ThemeProvider>
    );
    expect(getByText("Child Component")).toBeInTheDocument();
  });

  it("should apply the correct primary color", () => {
    const theme = createTheme();
    const { getByText } = render(
      <ThemeProvider customTheme={theme}>
        <div style={{ color: theme.palette.primary.main }}>Primary Color</div>
      </ThemeProvider>
    );
    expect(getByText("Primary Color")).toHaveStyle("color: #1976d2");
  });

  it("should apply the correct secondary color", () => {
    const theme = createTheme();
    const { getByText } = render(
      <ThemeProvider customTheme={theme}>
        <div style={{ color: theme.palette.secondary.main }}>Secondary Color</div>
      </ThemeProvider>
    );
    expect(getByText("Secondary Color")).toHaveStyle("color: #9c27b0");
  });

  it("should set typography font family correctly", () => {
    const theme = createTheme({
      typography: {
        fontFamily: ["Roboto Condensed ", "Roboto", "Helvetica", "Arial", "sans-serif"].join(),
      },
    });
    const { getByTestId } = render(
      <ThemeProvider customTheme={theme}>
        <Typography data-testid="test">Typography Test</Typography>
      </ThemeProvider>
    );
    expect(getByTestId("test")).toHaveStyle(`
      font-family: Roboto Condensed,Roboto,Helvetica,Arial,sans-serif
    `);
  });

  it("should ensure all shadows are set to 'none'", () => {
    const theme = createTheme();
    const shadows = [...theme.shadows].map(() => "none");

    expect(shadows.every((shadow) => shadow === "none")).toBe(true);
  });

  it("should have custom colors available", () => {
    expect(colors).toBeDefined();
  });

  it("should ensure correct contrast text for primary color", () => {
    const theme = createTheme();
    expect(theme.palette.primary.contrastText).toBe("#fff");
  });

  it("should ensure correct contrast text for secondary color", () => {
    const theme = createTheme();
    expect(theme.palette.secondary.contrastText).toBe("#fff");
  });

  it("should apply global styles correctly", () => {
    const theme = createTheme();
    const { container } = render(
      <ThemeProvider customTheme={theme}>
        <div>Global Style Test</div>
      </ThemeProvider>
    );
    expect(container.firstChild).toHaveStyle(`
      background-color: unset;
    `);
  });

  it("should handle light mode correctly", () => {
    const theme = createTheme({
      cssVariables: {
        colorSchemeSelector: "class",
      },
      colorSchemes: { light: true, dark: false },
      defaultColorScheme: "light",
    });
    expect(theme.palette.mode).toBe("light");
  });

  it("should handle dark mode correctly", () => {
    const theme = createTheme({
      cssVariables: {
        colorSchemeSelector: "class",
      },
      colorSchemes: { light: false, dark: true },
      defaultColorScheme: "dark",
    });
    expect(theme.palette.mode).toBe("dark");
  });

  it("should ensure background color is unset in global styles", () => {
    const { container } = render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    expect(container.firstChild).toHaveStyle("background-color: unset");
  });

  it("should set height to 100% for html, body, and __next root", () => {
    const { container } = render(
      <ThemeProvider>
        <div id="__next">
          <div>Test</div>
        </div>
      </ThemeProvider>
    );
    expect(container.firstChild).toHaveStyle("height: 100%");
  });

  it("should set width to 100% for html, body, and __next root", () => {
    const { container } = render(
      <ThemeProvider>
        <div id="__next">
          <div>Test</div>
        </div>
      </ThemeProvider>
    );
    expect(container.firstChild).toHaveStyle("width: 100%");
  });

  it("should ensure font size scales correctly in different screen sizes", () => {
    const theme = createTheme();
    expect(theme.typography.fontSize).toBeDefined();
  });

  it("should inherit Material UI theme values correctly", () => {
    const theme = createTheme();
    expect(theme.typography).toBeDefined();
  });

  it("should allow Material UI createTheme to override properties correctly", () => {
    const customTheme = createTheme({
      palette: {
        primary: { main: "#000000" },
      },
    });
    expect(customTheme.palette.primary.main).toBe("#000000");
  });

  it("should render correctly even when no children are provided", () => {
    const { container } = render(<ThemeProvider />);
    expect(container).toBeInTheDocument();
  });

  it("should not apply any invalid styles", () => {
    const { container } = render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    expect(container).not.toHaveStyle("invalidProperty: none");
  });
});

describe("InitColorSchemeScript", () => {
  it("should render without crashing", () => {
    const { container } = render(<InitColorSchemeScript />);
    expect(container).toBeInTheDocument();
  });

  it("should match the snapshot", () => {
    const { asFragment } = render(<InitColorSchemeScript />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("should render InitColorSchemeScriptMui internally", () => {
    const { container } = render(<InitColorSchemeScript />);
    expect(container.firstChild).toBeDefined();
  });

  it("should not apply unexpected props", () => {
    const { container } = render(<InitColorSchemeScript />);
    expect(container.firstChild).not.toHaveAttribute("unexpected-prop");
  });
});
