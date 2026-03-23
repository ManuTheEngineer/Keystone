"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

type ThemeMode = "light" | "dark";

// Dark mode: ALL CSS variables that need to change.
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

  // Brand colors for CONTENT area (not sidebar — sidebar uses --sidebar-* vars)
  "--color-earth": "#E8DDD0",       // Content headings: cream on dark bg
  "--color-earth-light": "#F5E6D3",
  "--color-clay": "#C4956A",        // Accent: warm gold
  "--color-clay-light": "#D4A574",
  "--color-sand": "#8B7B6B",        // Muted text
  "--color-sand-light": "#7A6B5B",
  "--color-warm": "#2C2520",        // Content card alt bg
  "--color-cream": "#1A1412",       // Same as background

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

function resolveIsDark(mode: ThemeMode): boolean {
  return mode === "dark";
}

export function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
    Object.entries(DARK_VARS).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    document.body.style.backgroundColor = "#1A1412";
    document.body.style.color = "#E8DDD0";
    // Update window title bar color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#FDF8F0");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    Object.keys(DARK_VARS).forEach((key) => {
      root.style.removeProperty(key);
    });
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#2C1810");
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = localStorage.getItem("keystone-theme") as ThemeMode | null;
    const initial: ThemeMode = stored === "dark" ? "dark" : "light";
    setMode(initial);
    applyTheme(resolveIsDark(initial));
  }, []);

  function toggle() {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("keystone-theme", next);
    applyTheme(resolveIsDark(next));
  }

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-lg transition-colors"
      style={{ color: "var(--color-sand)" }}
      title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {mode === "light" && <Sun size={16} />}
      {mode === "dark" && <Moon size={16} />}
    </button>
  );
}
