export const colors = {
  light: {
    background: "#F2F2F2",
    surface: "#F8F9FA", // Slightly off-white for cards/surfaces
    text: {
      primary: "#212529", // Dark gray for main text
      secondary: "#495057", // Medium gray for secondary text
    },
    divider: "#E9ECEF", // Light gray for dividers
  },

  // Dark mode colors (from Home screen dark.png)
  dark: {
    background: "#121212", // Very dark background
    surface: "#1E1E1E", // Slightly lighter surface
    text: {
      primary: "#E9ECEF", // Light gray/white for text
      secondary: "#ADB5BD", // Medium gray for secondary text
    },
    divider: "#2D2D2D", // Dark divider
  },

  // Additional colors
  error: {
    main: "#FF006E",
    light: "#FF4D8D",
    dark: "#D1005A",
  },
  success: {
    main: "#06D6A0",
    light: "#38E8B8",
    dark: "#04B487",
  },
  warning: {
    main: "#FFBE0B",
    light: "#FFD44D",
    dark: "#E6A800",
  },
  info: {
    main: "#3A86FF",
    light: "#63A0FF",
    dark: "#1F6FD8",
  },
};
declare module "@mui/material/styles" {
  interface Palette {
    colors: typeof colors;
  }

  interface PaletteOptions {
    colors?: typeof colors;
  }
}
