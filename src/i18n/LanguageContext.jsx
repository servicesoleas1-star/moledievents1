import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Language architecture — READY FOR Google Translate, not yet wired.
 *
 * UML check (DC-10): the schema exposes `LanguageConfig` (code / active /
 * is_default) but NO translation-cache table. Per project decision, Google
 * Translate is therefore NOT implemented yet. This provider only:
 *   - holds the active language (FR default, EN available),
 *   - persists the user's choice,
 *   - exposes a translate() hook that currently returns source text as-is.
 *
 * When a `TranslationCache` table is added, implement the fetch+cache logic
 * inside `translate()` here — every `<T>` in the app updates automatically.
 */

const STORAGE_KEY = 'moledi_lang';

export const LANGUAGES = {
  fr: { code: 'fr', label: 'Français', flag: '🇫🇷' },
  en: { code: 'en', label: 'English', flag: '🇬🇧' },
};

const LanguageContext = createContext({
  lang: 'fr',
  setLang: () => {},
  translate: (text) => text,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('fr');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES[saved]) setLangState(saved);
  }, []);

  const setLang = (code) => {
    if (!LANGUAGES[code]) return;
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
  };

  // Placeholder translator. Returns source text untouched for now.
  // TODO(Google Translate + TranslationCache): resolve translations here.
  const translate = (text) => text;

  return (
    <LanguageContext.Provider value={{ lang, setLang, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

/** Inline translatable text. Usage: <T>Bonjour</T> */
export function T({ children }) {
  const { translate } = useLanguage();
  return translate(children);
}
