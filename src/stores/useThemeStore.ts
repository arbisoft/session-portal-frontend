import { create } from "zustand";

type ThemeState = {
  mode: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (mode: "light" | "dark") => void;
};

const loadThemeFromLocalStorage = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    const savedMode = localStorage.getItem("theme");
    return savedMode === "dark" ? "dark" : "light";
  }
  return "light";
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: loadThemeFromLocalStorage(),
  toggleTheme: () =>
    set((state) => {
      const newMode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", newMode);
      return { mode: newMode };
    }),
  setTheme: (mode: "light" | "dark") => {
    localStorage.setItem("theme", mode);
    set({ mode });
  },
}));
