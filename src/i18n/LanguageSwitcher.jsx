import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES, useLanguage } from './LanguageContext';
import { flag } from '../config/media';

const FLAG = { fr: flag('fr', 40), en: flag('gb', 40) };

function LanguageSwitcher({ variant = 'light' }) {
  const { lang, setLang, translating } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const btnClass =
    variant === 'dark'
      ? 'text-white/90 hover:bg-white/10'
      : 'text-ink-900 hover:bg-ink-100';

  return (
    <div className="relative" ref={ref} data-no-translate>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Choisir la langue"
        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors ${btnClass}`}
      >
        <img
          src={FLAG[lang]}
          alt={LANGUAGES[lang].label}
          width="22"
          height="16"
          className="rounded-sm shadow-sm"
        />
        <span className="text-sm font-semibold uppercase tracking-wide">
          {lang}
        </span>
        {translating && (
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl z-50"
          >
            {Object.values(LANGUAGES).map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-ink-100 transition-colors ${
                    lang === l.code ? 'font-semibold text-primary' : 'text-ink-900'
                  }`}
                >
                  <img
                    src={FLAG[l.code]}
                    alt={l.label}
                    width="24"
                    height="18"
                    className="rounded-sm shadow-sm"
                  />
                  {l.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSwitcher;
