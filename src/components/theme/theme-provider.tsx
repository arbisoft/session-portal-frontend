"use client";

import { useMemo, PropsWithChildren } from "react";

import GlobalStyles from "@mui/material/GlobalStyles";
import { createTheme, ThemeProvider as MuiThemeProvider, Theme, useTheme } from "@mui/material/styles";
import { Roboto_Condensed, Inter } from "next/font/google";

import { colors } from "./colors";

const inter = Inter({ subsets: ["latin"] });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"] });

declare module "@mui/material/styles" {
  interface TypographyVariants {
    bodySmall: React.CSSProperties;
    bodyMedium: React.CSSProperties;
    bodyLarge: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    bodySmall?: React.CSSProperties;
    bodyMedium?: React.CSSProperties;
    bodyLarge?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    body1: false;
    body2: false;
    bodySmall: true;
    bodyMedium: true;
    bodyLarge: true;
  }
}

function ThemeProvider(props: PropsWithChildren<{ customTheme?: Theme }>) {
  const fontFamily = [robotoCondensed.style.fontFamily, inter.style.fontFamily, "Helvetica", "Arial", "sans-serif"].join();
  const defaultTheme = useTheme();
  const theme = useMemo(
    () =>
      createTheme({
        cssVariables: {
          colorSchemeSelector: "class",
        },
        colorSchemes: {
          light: {
            palette: {
              mode: "light",
              primary: {
                main: "#E3E3E3",
              },
              secondary: {
                main: "#A5A5A5",
              },
              background: {
                default: "#F2F2F2",
                paper: "#F3F3F3",
              },
              text: {
                primary: "#000000",
                secondary: "#7f7f7f",
              },
            },
          },
          dark: {
            palette: {
              mode: "dark",
              primary: {
                main: "#3c3e42",
              },
              secondary: {
                main: "#51555c",
              },
              text: {
                primary: "#fff",
                secondary: "#908e8e",
              },
            },
          },
        },
        typography: {
          fontFamily: fontFamily,
          h1: { fontSize: 28, lineHeight: "normal" },
          h2: { fontSize: 24, lineHeight: "normal" },
          h3: { fontSize: 22, lineHeight: "normal" },
          h4: { fontSize: 20, lineHeight: "normal" },
          h5: { fontSize: 16, lineHeight: "normal" },
          h6: { fontSize: 12, lineHeight: "normal" },
          bodySmall: { ...defaultTheme.typography.body1, fontSize: 12, lineHeight: "normal", fontFamily },
          bodyMedium: { ...defaultTheme.typography.body1, fontSize: 14, lineHeight: "normal", fontFamily },
          bodyLarge: { ...defaultTheme.typography.body1, fontSize: 16, lineHeight: "normal", fontFamily },
        },
        components: {
          MuiTypography: {
            defaultProps: {
              variant: "bodyMedium",
              variantMapping: {
                bodySmall: "p",
                bodyMedium: "p",
                bodyLarge: "p",
              },
            },
          },
          MuiCssBaseline: {
            /* c8 ignore next 14 */
            styleOverrides: (val) => ({
              body: {
                backgroundColor: colors.light.background,
                color: colors.light.text.primary,
                ...(val.palette.mode === "dark" && {
                  backgroundAttachment: "fixed",
                  backgroundColor: colors.dark.background,
                  backgroundImage: "url(/assets/svgs/background.svg)",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  color: colors.dark.text.primary,
                }),
              },
            }),
          },
        },
      }),
    [defaultTheme.shadows]
  );

  return (
    <MuiThemeProvider theme={props.customTheme || theme}>
      <GlobalStyles
        styles={{
          "html,body,#__next": {
            height: "100%",
            margin: 0,
            minHeight: "100%",
            width: "100%",
          },
        }}
      />
      {props.children}
    </MuiThemeProvider>
  );
}

export default ThemeProvider;
