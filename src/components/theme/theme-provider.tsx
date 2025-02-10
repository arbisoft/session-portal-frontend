"use client";

import { useMemo, PropsWithChildren } from "react";

import { createTheme, ThemeProvider as MuiThemeProvider, Shadows, useTheme } from "@mui/material/styles";
import { Roboto_Condensed } from "next/font/google";

import { colors } from "./colors";

const robotoCondensed = Roboto_Condensed({ subsets: ["latin"] });

function ThemeProvider(props: PropsWithChildren<{}>) {
  const defaultTheme = useTheme();
  const theme = useMemo(
    () =>
      createTheme({
        cssVariables: {
          colorSchemeSelector: "class",
        },
        colorSchemes: { light: true, dark: true },
        shadows: [...defaultTheme.shadows].map(() => "none") as Shadows,
        palette: {
          ...defaultTheme.palette,
          colors: {
            ...colors,
          },
        },
        typography: {
          fontFamily: [robotoCondensed.style.fontFamily, "Roboto", "Helvetica", "Arial", "sans-serif"].join(),
        },
      }),
    [defaultTheme.shadows]
  );

  return <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>;
}

export default ThemeProvider;
