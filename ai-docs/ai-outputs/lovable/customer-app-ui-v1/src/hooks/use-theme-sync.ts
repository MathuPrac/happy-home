import { useEffect } from "react";
import { useTheme } from "@/store/theme";

/** Syncs the persisted Zustand theme to the <html> class. */
export function useThemeSync() {
  const mode = useTheme((s) => s.mode);
  useEffect(() => {
    const el = document.documentElement;
    if (mode === "dark") el.classList.add("dark");
    else el.classList.remove("dark");
  }, [mode]);
}
