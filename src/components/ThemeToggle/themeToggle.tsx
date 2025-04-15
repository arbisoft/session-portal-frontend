import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { useColorScheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme();

  const { t } = useTranslation("common");

  return (
    <>
      <ButtonGroup size="small" variant="outlined" aria-label="Basic button group">
        <Button
          variant={mode === "light" ? "contained" : undefined}
          onClick={() => setMode("light")}
          startIcon={<LightModeIcon />}
        >
          {t("light")}
        </Button>
        <Button
          variant={mode === "system" ? "contained" : undefined}
          onClick={() => setMode("system")}
          startIcon={<SettingsBrightnessIcon />}
        >
          {t("system")}
        </Button>
        <Button variant={mode === "dark" ? "contained" : undefined} onClick={() => setMode("dark")} startIcon={<DarkModeIcon />}>
          {t("dark")}
        </Button>
      </ButtonGroup>
    </>
  );
};

export default ThemeToggle;
