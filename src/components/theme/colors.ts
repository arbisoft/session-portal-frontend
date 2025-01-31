export const colors = {
  gold: "#9f7d05",
  gray: "#908e8e",
  white: "#fff",
};

declare module "@mui/material/styles" {
  interface Palette {
    colors: typeof colors;
  }

  interface PaletteOptions {
    colors?: typeof colors;
  }
}
