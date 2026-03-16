"use client";

import { useEffect } from "react";
import { DARK_VARS } from "./ThemeToggle";

/**
 * Invisible component that applies the full dark mode variables on mount.
 * Placed in the root layout so every page (landing, auth, dashboard)
 * gets the complete theme applied without needing a visible ThemeToggle.
 */
export function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("keystone-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (stored !== "light" && prefersDark);

    const root = document.documentElement;
    if (shouldBeDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      Object.entries(DARK_VARS).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      document.body.style.backgroundColor = "#1A1412";
      document.body.style.color = "#E8DDD0";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      Object.keys(DARK_VARS).forEach((key) => {
        root.style.removeProperty(key);
      });
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    }
  }, []);

  return null;
}
