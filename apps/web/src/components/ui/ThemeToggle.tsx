"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const DARK_VARS: Record<string, string> = {
  "--color-background": "#1A1412",
  "--color-foreground": "#E8DDD0",
  "--color-surface": "#231E1A",
  "--color-surface-alt": "#2C2520",
  "--color-surface-dim": "#1E1916",
  "--color-primary": "#E8DDD0",
  "--color-primary-foreground": "#1A1412",
  "--color-secondary": "#C4956A",
  "--color-secondary-foreground": "#1A1412",
  "--color-accent": "#10B981",
  "--color-accent-foreground": "#FFFFFF",
  "--color-accent-light": "rgba(5, 150, 105, 0.15)",
  "--color-border": "#3D342C",
  "--color-border-dark": "#4A4038",
  "--color-muted": "#9A8E82",
  "--color-earth": "#E8DDD0",
  "--color-earth-light": "#F5E6D3",
  "--color-clay": "#C4956A",
  "--color-clay-light": "#D4A574",
  "--color-sand": "#8B7B6B",
  "--color-sand-light": "#7A6B5B",
  "--color-warm": "#2C2520",
  "--color-cream": "#1A1412",
  "--color-slate-text": "#E8DDD0",
  "--color-success": "#2D6A4F",
  "--color-success-bg": "rgba(45, 106, 79, 0.2)",
  "--color-warning": "#BC6C25",
  "--color-warning-bg": "rgba(188, 108, 37, 0.2)",
  "--color-danger": "#9B2226",
  "--color-danger-bg": "rgba(155, 34, 38, 0.2)",
  "--color-info": "#1B4965",
  "--color-info-bg": "rgba(27, 73, 101, 0.2)",
  "--color-accent-usa": "#1B4965",
  "--color-accent-usa-light": "rgba(27, 73, 101, 0.25)",
  "--color-accent-wa": "#6B4226",
  "--color-accent-wa-light": "rgba(107, 66, 38, 0.25)",
  "--color-emerald-50": "rgba(5, 150, 105, 0.1)",
  "--color-emerald-100": "rgba(5, 150, 105, 0.15)",
  "--color-emerald-200": "rgba(5, 150, 105, 0.2)",
  "--color-emerald-300": "rgba(110, 231, 183, 0.3)",
  "--color-emerald-400": "rgba(52, 211, 153, 0.4)",
  "--color-emerald-500": "#10B981",
  "--color-emerald-600": "#059669",
  "--color-emerald-700": "#6EE7B7",
  "--color-emerald-800": "#A7F3D0",
  "--color-emerald-900": "#D1FAE5",
  "--color-emerald-950": "#ECFDF5",
  "--shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.3)",
  "--shadow-md": "0 4px 16px rgba(0, 0, 0, 0.35)",
  "--shadow-lg": "0 12px 40px rgba(0, 0, 0, 0.45)",
};

export { DARK_VARS };

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("keystone-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldBeDark =
      stored === "dark" || (stored !== "light" && prefersDark);
    setDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  function applyTheme(isDark: boolean) {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      Object.entries(DARK_VARS).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      Object.keys(DARK_VARS).forEach((key) => {
        root.style.removeProperty(key);
      });
    }
  }

  function toggle() {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("keystone-theme", newDark ? "dark" : "light");
    applyTheme(newDark);
  }

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-lg text-sand/50 hover:text-sand/80 transition-colors"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
