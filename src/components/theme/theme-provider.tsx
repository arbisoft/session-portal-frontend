"use client";

import { useMemo, PropsWithChildren } from "react";

import GlobalStyles from "@mui/material/GlobalStyles";
import { createTheme, ThemeProvider as MuiThemeProvider, responsiveFontSizes, Theme, useTheme } from "@mui/material/styles";
import { Roboto_Condensed, Inter } from "next/font/google";

import { pxToRem } from "@/utils/styleUtils";

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
      responsiveFontSizes(
        createTheme({
          cssVariables: {
            colorSchemeSelector: "class",
          },
          defaultColorScheme: "dark",
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
            h1: { fontSize: pxToRem(28) },
            h2: { fontSize: pxToRem(24) },
            h3: { fontSize: pxToRem(22) },
            h4: { fontSize: pxToRem(20) },
            h5: { fontSize: pxToRem(16) },
            h6: { fontSize: pxToRem(12) },
            bodySmall: { ...defaultTheme.typography.body1, fontSize: pxToRem(12), fontFamily },
            bodyMedium: { ...defaultTheme.typography.body1, fontSize: pxToRem(14), fontFamily },
            bodyLarge: { ...defaultTheme.typography.body1, fontSize: pxToRem(16), fontFamily },
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
        })
      ),
    [defaultTheme.shadows]
  );

  return (
    <MuiThemeProvider theme={props.customTheme || theme} defaultMode="dark">
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
