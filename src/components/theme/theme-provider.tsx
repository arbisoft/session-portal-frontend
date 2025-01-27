"use client";

import { useMemo, PropsWithChildren } from "react";

import { createTheme, ThemeProvider as MuiThemeProvider, Shadows, useTheme } from "@mui/material/styles";

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
      }),
    [defaultTheme.shadows]
  );

  return <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>;
}

export default ThemeProvider;
