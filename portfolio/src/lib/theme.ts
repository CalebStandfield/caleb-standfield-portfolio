import { useSyncExternalStore } from "react";

// Day/night lives on <html data-theme>. index.html sets it before first paint
// from the saved choice, so this module only reads, flips, and saves it.

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";

const listeners = new Set<() => void>();

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // storage blocked (private mode); the choice just won't persist
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "dark");
  const toggle = () => applyTheme(theme === "dark" ? "light" : "dark");
  return [theme, toggle];
}
