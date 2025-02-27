import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { useColorScheme } from "@mui/material/styles";

const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <>
      <ButtonGroup size="small" variant="outlined" aria-label="Basic button group">
        <Button
          variant={mode === "light" ? "contained" : undefined}
          onClick={() => setMode("light")}
          startIcon={<LightModeIcon />}
        >
          Light
        </Button>
        <Button
          variant={mode === "system" ? "contained" : undefined}
          onClick={() => setMode("system")}
          startIcon={<SettingsBrightnessIcon />}
        >
          System
        </Button>
        <Button variant={mode === "dark" ? "contained" : undefined} onClick={() => setMode("dark")} startIcon={<DarkModeIcon />}>
          Dark
        </Button>
      </ButtonGroup>
    </>
  );
};

export default ThemeToggle;
