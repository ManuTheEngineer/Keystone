"use client";

import { createContext, useContext } from "react";
import type { Locale } from "../i18n";

const LocaleContext = createContext<Locale>("en");

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export { LocaleContext };
