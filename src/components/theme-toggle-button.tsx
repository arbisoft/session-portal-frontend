import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggleButton = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <IconButton disableRipple onClick={toggleTheme} color="inherit">
      {mode === "dark" ? (
        <LightMode sx={{ width: 30, height: 30 }} />
      ) : (
        <DarkMode sx={{ width: 30, height: 30 }} />
      )}
    </IconButton>
  );
};

export default ThemeToggleButton;
