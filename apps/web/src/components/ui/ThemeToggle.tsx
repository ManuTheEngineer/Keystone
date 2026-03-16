"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

// Dark mode: ALL CSS variables that need to change.
// Status colors are LIGHTER so they are readable on dark backgrounds.
// Earth/clay/sand INVERT (dark bg needs light text).
// Emerald shades become translucent for dark backgrounds.
const DARK_VARS: Record<string, string> = {
  // Core backgrounds
  "--color-background": "#1A1412",
  "--color-foreground": "#E8DDD0",
  "--color-surface": "#231E1A",
  "--color-surface-alt": "#2C2520",
  "--color-surface-dim": "#1E1916",

  // Primary (inverted for dark)
  "--color-primary": "#E8DDD0",
  "--color-primary-foreground": "#1A1412",
  "--color-secondary": "#C4956A",
  "--color-secondary-foreground": "#1A1412",
  "--color-accent": "#10B981",
  "--color-accent-foreground": "#FFFFFF",
  "--color-accent-light": "rgba(5, 150, 105, 0.15)",

  // Borders (lighter for dark bg)
  "--color-border": "#3D342C",
  "--color-border-dark": "#4A4038",

  // Text
  "--color-muted": "#9A8E82",
  "--color-slate-text": "#E8DDD0",

  // Brand colors (inverted)
  "--color-earth": "#E8DDD0",
  "--color-earth-light": "#F5E6D3",
  "--color-clay": "#C4956A",
  "--color-clay-light": "#D4A574",
  "--color-sand": "#8B7B6B",
  "--color-sand-light": "#7A6B5B",
  "--color-warm": "#2C2520",
  "--color-cream": "#1A1412",

  // Status colors: BRIGHTER for dark mode readability
  "--color-success": "#4ADE80",
  "--color-success-bg": "rgba(74, 222, 128, 0.15)",
  "--color-warning": "#FBBF24",
  "--color-warning-bg": "rgba(251, 191, 36, 0.15)",
  "--color-danger": "#FB7185",
  "--color-danger-bg": "rgba(251, 113, 133, 0.15)",
  "--color-info": "#60A5FA",
  "--color-info-bg": "rgba(96, 165, 250, 0.15)",

  // Market accents (translucent for dark)
  "--color-accent-usa": "#60A5FA",
  "--color-accent-usa-light": "rgba(96, 165, 250, 0.2)",
  "--color-accent-wa": "#C4956A",
  "--color-accent-wa-light": "rgba(196, 149, 106, 0.2)",

  // Emerald scale (translucent for dark)
  "--color-emerald-50": "rgba(16, 185, 129, 0.08)",
  "--color-emerald-100": "rgba(16, 185, 129, 0.12)",
  "--color-emerald-200": "rgba(16, 185, 129, 0.18)",
  "--color-emerald-300": "rgba(110, 231, 183, 0.25)",
  "--color-emerald-400": "rgba(52, 211, 153, 0.35)",
  "--color-emerald-500": "#10B981",
  "--color-emerald-600": "#34D399",
  "--color-emerald-700": "#6EE7B7",
  "--color-emerald-800": "#A7F3D0",
  "--color-emerald-900": "#D1FAE5",
  "--color-emerald-950": "#ECFDF5",

  // Shadows (deeper for dark)
  "--shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.4)",
  "--shadow-md": "0 4px 16px rgba(0, 0, 0, 0.5)",
  "--shadow-lg": "0 12px 40px rgba(0, 0, 0, 0.6)",
};

export { DARK_VARS };

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("keystone-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (stored !== "light" && prefersDark);
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
      // Also override body bg directly for immediate effect
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
      className="p-1.5 rounded-lg transition-colors"
      style={{ color: "var(--color-sand)" }}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
