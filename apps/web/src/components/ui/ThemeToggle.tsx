"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

type ThemeMode = "light" | "dark";

// Dark mode: swap using ONLY colors from the light mode brand palette.
//
// LIGHT MODE PALETTE (for reference):
//   background: #FDF8F0 (cream)     earth: #2C1810 (deep brown)
//   surface:    #FFFFFF (white)      earth-light: #3D2215
//   surface-alt: #F5F0E8 (beige)    clay: #8B4513
//   warm:       #F5E6D3 (warm)      sand: #D4A574
//   cream:      #FDF8F0             muted: #6A6A6A
//   foreground: #3A3A3A (slate)     border: #E0D5C8
//
// DARK MODE = exact inversion:
//   Light backgrounds → dark browns
//   Dark text → light creams
//
const DARK_VARS: Record<string, string> = {
  // Backgrounds: deeper dark with card contrast
  "--color-background": "#1A0F0A",    // page bg: deeper than earth
  "--color-surface": "#2C1810",       // cards: earth brown (visible against bg)
  "--color-surface-alt": "#3A261B",   // card hover/alt
  "--color-surface-dim": "#1A0F0A",   // same as bg

  // Text: warm cream/beige tones (not stark white)
  "--color-foreground": "#F5E6D3",    // body text: warm cream
  "--color-muted": "#C4956A",         // secondary text: warm golden brown
  "--color-slate-text": "#F5E6D3",    // slate → warm cream

  // Brand headings & accents
  "--color-earth": "#F5E6D3",         // headings: warm cream
  "--color-earth-light": "#FDF8F0",   // heading bright
  "--color-clay": "#D4A574",          // accent: sand golden
  "--color-clay-light": "#E0BC92",    // accent lighter
  "--color-sand": "#A0522D",          // subtle accent: sienna
  "--color-sand-light": "#8B4513",    // subtle darker
  "--color-warm": "#2C1810",          // subtle bg: same as surface
  "--color-cream": "#1A0F0A",         // same as background

  // Primary
  "--color-primary": "#F5E6D3",       // warm cream
  "--color-primary-foreground": "#2C1810",
  "--color-secondary": "#D4A574",     // sand golden
  "--color-secondary-foreground": "#2C1810",
  "--color-accent": "#10B981",
  "--color-accent-foreground": "#FFFFFF",
  "--color-accent-light": "rgba(16, 185, 129, 0.15)",

  // Borders: light sand → dark brown tones
  "--color-border": "#5C4033",        // was #E0D5C8 → darker brown
  "--color-border-dark": "#6B4226",   // was #C8BBAD → accent-wa brown

  // Status: brighter for dark backgrounds
  "--color-success": "#4ADE80",
  "--color-success-bg": "rgba(74, 222, 128, 0.12)",
  "--color-warning": "#FBBF24",
  "--color-warning-bg": "rgba(251, 191, 36, 0.12)",
  "--color-danger": "#FB7185",
  "--color-danger-bg": "rgba(251, 113, 133, 0.12)",
  "--color-info": "#60A5FA",
  "--color-info-bg": "rgba(96, 165, 250, 0.12)",

  // Market accents
  "--color-accent-usa": "#60A5FA",
  "--color-accent-usa-light": "rgba(96, 165, 250, 0.15)",
  "--color-accent-wa": "#D4A574",
  "--color-accent-wa-light": "rgba(212, 165, 116, 0.15)",

  // Emerald (translucent for dark)
  "--color-emerald-50": "rgba(16, 185, 129, 0.06)",
  "--color-emerald-100": "rgba(16, 185, 129, 0.10)",
  "--color-emerald-200": "rgba(16, 185, 129, 0.15)",
  "--color-emerald-300": "rgba(110, 231, 183, 0.20)",
  "--color-emerald-400": "rgba(52, 211, 153, 0.30)",
  "--color-emerald-500": "#10B981",
  "--color-emerald-600": "#34D399",
  "--color-emerald-700": "#6EE7B7",
  "--color-emerald-800": "#A7F3D0",
  "--color-emerald-900": "#D1FAE5",
  "--color-emerald-950": "#ECFDF5",

  // Shadows
  "--shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.3)",
  "--shadow-md": "0 4px 16px rgba(0, 0, 0, 0.4)",
  "--shadow-lg": "0 12px 40px rgba(0, 0, 0, 0.5)",
};

export { DARK_VARS };

function resolveIsDark(mode: ThemeMode): boolean {
  return mode === "dark";
}

// Persistent theme-color enforcer — survives Next.js head re-renders
let themeColorTarget: string = "#2C1810";
let themeColorObserver: MutationObserver | null = null;

function enforceThemeColor(color: string) {
  themeColorTarget = color;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  metas.forEach((m) => { m.setAttribute("content", color); m.removeAttribute("media"); });
  if (metas.length === 0) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    document.head.appendChild(meta);
  }
  // Watch for Next.js re-rendering the head and resetting the tag
  if (!themeColorObserver) {
    themeColorObserver = new MutationObserver(() => {
      const current = document.querySelector('meta[name="theme-color"]');
      if (current && current.getAttribute("content") !== themeColorTarget) {
        current.setAttribute("content", themeColorTarget);
        current.removeAttribute("media");
      }
    });
    themeColorObserver.observe(document.head, { childList: true, subtree: true, attributes: true });
  }
}

export function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
    Object.entries(DARK_VARS).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    document.body.style.backgroundColor = "#1A0F0A";
    document.body.style.color = "#E8DDD0";
    enforceThemeColor("#F5E6D3");
    (window as any).__ksThemeColor = "#F5E6D3";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    Object.keys(DARK_VARS).forEach((key) => {
      root.style.removeProperty(key);
    });
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
    enforceThemeColor("#2C1810");
    (window as any).__ksThemeColor = "#2C1810";
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
