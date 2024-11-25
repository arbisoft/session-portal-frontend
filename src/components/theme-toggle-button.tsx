import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import IconButton from "@mui/material/IconButton";
import { useColorScheme } from "@mui/material/styles";

const ThemeToggleButton = () => {
  const { colorScheme, setMode } = useColorScheme();

  return (
    <IconButton
      disableRipple
      onClick={() => {
        setMode(colorScheme === "light" ? "dark" : "light");
      }}
      color="inherit"
    >
      {colorScheme === "dark" ? (
        <LightMode sx={{ width: 30, height: 30 }} />
      ) : (
        <DarkMode sx={{ width: 30, height: 30 }} />
      )}
    </IconButton>
  );
};

export default ThemeToggleButton;
