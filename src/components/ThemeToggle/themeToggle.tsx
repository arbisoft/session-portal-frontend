import React from "react";

import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import IconButton from "@mui/material/IconButton";
import { useColorScheme, alpha, useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();

  return (
    <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        role="dark-mode-button"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        size="medium"
        color="inherit"
        sx={{
          ml: 1,
          bgcolor: mode === "dark" ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.04),
          "&:hover": {
            bgcolor: mode === "dark" ? alpha(theme.palette.common.white, 0.12) : alpha(theme.palette.common.black, 0.08),
          },
        }}
      >
        {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
