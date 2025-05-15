"use client";

import { useMemo, PropsWithChildren } from "react";

import GlobalStyles from "@mui/material/GlobalStyles";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  responsiveFontSizes,
  Shadows,
  Theme,
  useTheme,
} from "@mui/material/styles";
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
          shadows: [...defaultTheme.shadows].map(() => "none") as Shadows,
          palette: {
            mode: "dark",
            colors,
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
          },
        })
      ),
    [defaultTheme.shadows]
  );

  return (
    <MuiThemeProvider theme={props.customTheme || theme}>
      <GlobalStyles
        styles={{
          "html,body,#__next": {
            backgroundColor: "unset",
            fontFamily,
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
