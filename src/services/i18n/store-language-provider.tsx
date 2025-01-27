"use client";

import { PropsWithChildren, useCallback, useMemo, useState } from "react";

import Cookies from "js-cookie";

import { cookieName, fallbackLanguage } from "./config";
import { Language, StoreLanguageActionsContext, StoreLanguageContext } from "./store-language-context";

function StoreLanguageProvider(props: PropsWithChildren<{}>) {
  const [language, setLanguageRaw] = useState<Language>(() => Cookies.get(cookieName) ?? fallbackLanguage);

  const setLanguage = useCallback((lang: Language) => {
    Cookies.set(cookieName, lang ?? fallbackLanguage);
    setLanguageRaw(lang ?? fallbackLanguage);
  }, []);

  const contextValue = useMemo(() => ({ language }), [language]);

  const contextActionsValue = useMemo(
    () => ({
      setLanguage,
    }),
    [setLanguage]
  );

  return (
    <StoreLanguageContext.Provider value={contextValue}>
      <StoreLanguageActionsContext.Provider value={contextActionsValue}>{props.children}</StoreLanguageActionsContext.Provider>
    </StoreLanguageContext.Provider>
  );
}

export default StoreLanguageProvider;
