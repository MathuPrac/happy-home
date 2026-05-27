import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  set: (m: ThemeMode) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "dark",
      toggle: () => set((s) => ({ mode: s.mode === "dark" ? "light" : "dark" })),
      set: (m) => set({ mode: m }),
    }),
    { name: "hh-theme" },
  ),
);
