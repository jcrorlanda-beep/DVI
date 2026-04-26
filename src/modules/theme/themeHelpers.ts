export type ThemeMode = "bright" | "dark";

const STORAGE_KEY = "dvi_theme_mode_v1";

export function getThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "bright") return stored;
  } catch {
    // ignore storage errors
  }
  return "bright";
}

export function setThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
}

export function applyThemeToDocument(mode: ThemeMode): void {
  document.documentElement.setAttribute("data-theme", mode);
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === "bright" ? "dark" : "bright";
}
