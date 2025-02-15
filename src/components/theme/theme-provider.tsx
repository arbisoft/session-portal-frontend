"use client";

import { useMemo, PropsWithChildren } from "react";

import GlobalStyles from "@mui/material/GlobalStyles";
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
          primary: {
            main: "#18465e", // TODO: will change colors when colors are provided
            contrastText: "#fff",
          },
          secondary: {
            main: "#eb6009", // TODO: will change colors are provided
            contrastText: "#fff",
          },
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

  return (
    <MuiThemeProvider theme={theme}>
      <GlobalStyles
        styles={{
          "html,body,#__next": {
            backgroundColor: "unset",
            fontFamily: theme.typography.fontFamily,
            height: "100%",
            width: "100%",
          },
        }}
      />
      {props.children}
    </MuiThemeProvider>
  );
}

export default ThemeProvider;
