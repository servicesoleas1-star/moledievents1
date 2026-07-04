import { createContext, useContext, useEffect, useState } from 'react';
import { translatePage, restoreOriginal } from '../lib/translate';

const STORAGE_KEY = 'moledi_lang';

export const LANGUAGES = {
  fr: { code: 'fr', label: 'Français' },
  en: { code: 'en', label: 'English' },
};

const LanguageContext = createContext({
  lang: 'fr',
  setLang: () => {},
  translating: false,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('fr');
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES[saved]) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = async (code) => {
    if (!LANGUAGES[code] || code === lang) return;
    localStorage.setItem(STORAGE_KEY, code);
    setTranslating(true);
    try {
      if (code === 'fr') {
        restoreOriginal(document.body);
      } else {
        await translatePage(document.body, 'fr', code);
      }
    } finally {
      setTranslating(false);
      setLangState(code);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, translating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
