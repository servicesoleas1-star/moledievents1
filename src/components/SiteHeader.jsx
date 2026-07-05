import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { media } from '../config/media';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

const navLinks = [
  { label: 'Événements', href: '/evenements' },
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Partenaires', href: '/partenaire' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Header for interior pages (Tarifs, Confidentialité, ...) — a deliberately
 * darker, always-solid variant of the homepage Navbar (which stays
 * transparent over the hero video and only turns light on scroll). Here
 * there's no hero to sit over, so the bar is solid ink from the first
 * frame, with a slim brand-gradient accent line to keep it from feeling
 * like a plain dark rectangle.
 */
function SiteHeader({ activeHref }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={container}
      data-no-translate
      className="fixed top-0 inset-x-0 z-50 bg-ink-900/95 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]"
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-primary via-primary-300 to-secondary" />
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        <motion.div variants={item}>
          <a href="/" className="flex items-center shrink-0" aria-label="Moledi Event">
            <img src={media.logoLight} alt="Moledi Event" className="h-10 sm:h-11 w-auto object-contain" />
          </a>
        </motion.div>

        <motion.ul variants={container} className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <motion.li key={link.href} variants={item}>
                <a
                  href={link.href}
                  className={`relative px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors group ${
                    isActive ? 'text-primary-300' : 'text-white/85 hover:text-primary-300'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary origin-left transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </a>
              </motion.li>
            );
          })}
        </motion.ul>

        <div className="hidden lg:flex items-center gap-3">
          <motion.div variants={item}>
            <LanguageSwitcher variant="light" />
          </motion.div>
          <motion.a
            variants={item}
            href="/connexion"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white/85 hover:text-primary-300 transition-colors"
          >
            Connexion
          </motion.a>
          <motion.a variants={item} href="/inscription" whileTap={{ scale: 0.97 }} className="btn btn-primary">
            Créer un événement
          </motion.a>
        </div>

        <div className="flex lg:hidden items-center gap-1.5">
          <motion.div variants={item}>
            <LanguageSwitcher variant="light" />
          </motion.div>
          <motion.button
            variants={item}
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </motion.button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} links={navLinks} activeHref={activeHref} />
    </motion.header>
  );
}

function MobileMenu({ open, onClose, links, activeHref }) {
  const panel = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
  };
  const list = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } } };
  const li = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-50 lg:hidden bg-ink-900 flex flex-col"
          data-no-translate
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
            <img src={media.logoLight} alt="Moledi Event" className="h-9 w-auto object-contain" />
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <motion.ul variants={list} initial="hidden" animate="show" className="flex-1 px-5 pt-3 overflow-y-auto">
            {links.map((l) => (
              <motion.li key={l.href} variants={li} className="border-b border-white/10">
                <a
                  href={l.href}
                  onClick={onClose}
                  className={`block py-4 font-heading text-lg normal-case tracking-wide transition-colors ${
                    activeHref === l.href ? 'text-primary-300' : 'text-white hover:text-primary-300'
                  }`}
                >
                  {l.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }}
            className="p-5 border-t border-white/10 space-y-3"
          >
            <div className="flex flex-row gap-3">
              <a href="/inscription" onClick={onClose} className="btn btn-primary flex-1 py-3.5">
                Créer un événement
              </a>
              <a
                href="/connexion"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm text-center text-white border border-white/25 hover:bg-white/10 transition-colors"
              >
                Connexion
              </a>
            </div>
            <p className="text-center text-[11px] text-white/50">
              Moledi Event — de l'idée à l'événement, en un clic.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SiteHeader;
