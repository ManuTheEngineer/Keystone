"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { t as translate, type Locale } from "@/lib/i18n";

/**
 * Hook that returns a translation function bound to the user's locale.
 * Falls back to "en" if no locale is set.
 *
 * Usage:
 *   const { t, locale } = useTranslation();
 *   <p>{t("nav.dashboard")}</p>
 */
export function useTranslation() {
  const { profile } = useAuth();
  const locale: Locale = (profile?.locale as Locale) || "en";

  const t = useCallback(
    (key: string) => translate(key, locale),
    [locale]
  );

  return { t, locale };
}
