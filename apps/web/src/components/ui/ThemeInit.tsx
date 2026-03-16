"use client";

import { useEffect } from "react";
import { applyTheme } from "./ThemeToggle";

/**
 * Invisible component that applies the full dark mode variables on mount.
 * Placed in the root layout so every page gets the complete theme applied.
 */
export function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("keystone-theme");
    let isDark: boolean;
    if (stored === "dark") {
      isDark = true;
    } else if (stored === "light") {
      isDark = false;
    } else {
      // "system" or no preference stored
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    applyTheme(isDark);
  }, []);

  return null;
}
