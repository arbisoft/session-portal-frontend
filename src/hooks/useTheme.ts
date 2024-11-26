import { useThemeStore } from "@/stores/useThemeStore";

export const useTheme = () => {
  const { mode, toggleTheme, setTheme } = useThemeStore();

  return { mode, toggleTheme, setTheme };
};
