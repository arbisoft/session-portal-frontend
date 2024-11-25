"use client";

import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { useMemo, useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isMounted ? mode : "light",
        },
      }),
    [mode, isMounted]
  );

  if (!isMounted) {
    return null;
  }

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

export default ThemeProvider;
