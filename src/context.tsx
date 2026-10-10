import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import data from "./data/countries.json";
import { STRINGS, initialLang, localeOf, type Strings } from "./i18n";
import type { Country, Lang } from "./quiz";
import { saveLang } from "./session";

export const COUNTRIES = data as Country[];
export const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

interface AppContext {
  lang: Lang;
  t: Strings;
  setLang: (lang: Lang) => void;
}

const Context = createContext<AppContext | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  useEffect(() => {
    document.documentElement.lang = localeOf(lang);
    document.title = STRINGS[lang].title;
  }, [lang]);
  const value = useMemo<AppContext>(
    () => ({
      lang,
      t: STRINGS[lang],
      setLang: (next) => {
        saveLang(next);
        setLangState(next);
      },
    }),
    [lang],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp(): AppContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useApp fora do AppProvider");
  return ctx;
}
