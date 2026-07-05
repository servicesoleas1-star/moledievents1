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

// The logo is an image and replaces ALL text — no wordmark next to it.
function Logo({ className = 'h-10' }) {
  const [src, setSrc] = useState(media.logo);
  return (
    <a href="/" className="flex items-center shrink-0" aria-label="Moledi Event">
      <img
        src={src}
        alt="Moledi Event"
        className={`${className} w-auto object-contain`}
        onError={() => setSrc(media.logoFallback)}
      />
    </a>
  );
}

// Staggered arrival — each element slides down gently and fades in.
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};
const item = {
  hidden: { opacity: 0, y: -14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(11,19,36,0.15)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        <motion.div variants={item}>
          <Logo className="h-10 sm:h-11" />
        </motion.div>

        {/* Desktop nav */}
        <motion.ul
          variants={container}
          className="hidden lg:flex items-center gap-1 xl:gap-2"
        >
          {navLinks.map((link) => (
            <motion.li key={link.href} variants={item}>
              <a
                href={link.href}
                className="relative px-3 py-2 text-[13px] font-semibold rounded-full transition-colors group text-ink-900 hover:text-primary"
              >
                {link.label}
                <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </a>
            </motion.li>
          ))}
        </motion.ul>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          <motion.div variants={item}>
            <LanguageSwitcher variant="light" />
          </motion.div>
          <motion.a
            variants={item}
            href="/connexion"
            className="text-sm font-semibold px-4 py-2 rounded-full transition-colors text-ink-900 hover:text-primary"
          >
            Connexion
          </motion.a>
          <motion.a
            variants={item}
            href="/inscription"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white bg-gradient-to-r from-primary to-primary-300 shadow-[0_8px_20px_-6px_rgba(255,106,0,0.55)] hover:shadow-[0_12px_28px_-6px_rgba(255,106,0,0.7)] transition-shadow"
          >
            Créer un événement
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </motion.a>
        </div>

        {/* Mobile actions */}
        <div className="flex lg:hidden items-center gap-1.5">
          <motion.div variants={item}>
            <LanguageSwitcher variant="light" />
          </motion.div>
          <motion.button
            variants={item}
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="w-11 h-11 flex items-center justify-center rounded-full transition-colors text-ink-900 hover:bg-ink-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </motion.button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} links={navLinks} />
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile menu — elegant side drawer sliding in from the right edge,  */
/*  with a soft spring, staggered items and charter-gradient accents.  */
/* ------------------------------------------------------------------ */

function MobileMenu({ open, onClose, links }) {
  const drawer = {
    hidden: { x: '100%' },
    show: { x: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
    exit: { x: '100%', transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] } },
  };
  const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.18 } },
  };
  const li = {
    hidden: { opacity: 0, x: 32 },
    show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            variants={drawer}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-y-0 right-0 z-50 w-[86%] max-w-sm lg:hidden flex flex-col bg-white shadow-2xl"
            data-no-translate
          >
            {/* Decorative charter gradients inside the drawer */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-primary/25 to-primary-300/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-gradient-to-tr from-secondary/20 to-secondary-100/10 blur-2xl" />

            <div className="relative flex items-center justify-between px-5 pt-5 pb-4">
              <img
                src={media.logo}
                alt="Moledi Event"
                className="h-9 w-auto object-contain"
                onError={(e) => { e.currentTarget.src = media.logoFallback; }}
              />
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <motion.ul
              variants={list}
              initial="hidden"
              animate="show"
              className="relative flex-1 px-3 pt-2 overflow-y-auto"
            >
              {links.map((l, i) => (
                <motion.li key={l.href} variants={li}>
                  <a
                    href={l.href}
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-2xl px-4 py-4 hover:bg-ink-100 transition-colors"
                  >
                    <span className="flex items-center gap-3.5">
                      <span
                        className={`w-1.5 h-8 rounded-full ${i % 2 === 0 ? 'bg-gradient-to-b from-primary to-primary-300' : 'bg-gradient-to-b from-secondary to-secondary-100'}`}
                      />
                      <span className="font-heading text-ink-900 text-xl normal-case tracking-wide">
                        {l.label}
                      </span>
                    </span>
                    <span className="w-8 h-8 rounded-full bg-ink-100 group-hover:bg-white flex items-center justify-center transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.45 } }}
              className="relative p-5 space-y-2.5"
            >
              <a
                href="/inscription"
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-full text-white bg-gradient-to-r from-primary to-primary-300 shadow-lg shadow-primary/30"
              >
                Créer un événement
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href="/connexion"
                onClick={onClose}
                className="flex items-center justify-center text-sm font-semibold py-3.5 rounded-full border border-ink-200 text-ink-900 hover:bg-ink-100 transition-colors"
              >
                Connexion
              </a>
              <p className="text-center text-[11px] text-ink-700 pt-1.5">
                Moledi Event — de l'idée à l'événement, en un clic.
              </p>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Navbar;
