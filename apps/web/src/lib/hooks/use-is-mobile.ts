"use client";

import { useState, useEffect } from "react";

/**
 * Returns true when the viewport width is below the given breakpoint (default 640px).
 * Uses a state + effect pattern so the value is false during SSR and updates on resize.
 */
export function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
