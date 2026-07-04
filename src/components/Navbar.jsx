import { useState, useEffect, useRef } from 'react';
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

function Logo({ className = 'h-9', variant = 'dark' }) {
  // "dark" variant = for use over dark background (hero) → renders logoLight
  // "light" variant = for use over light background (scrolled nav) → renders logo
  const primary = variant === 'dark' ? media.logoLight : media.logo;
  const [src, setSrc] = useState(primary);
  useEffect(() => setSrc(primary), [primary]);
  return (
    <a
      href="/"
      className="flex items-center shrink-0"
      aria-label="Moledi Events"
    >
      <img
        src={src}
        alt="Moledi Events"
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
  const [scrolledPast, setScrolledPast] = useState(false);
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Any section marked data-navbar-theme="dark" (Hero, ZUIHubStory, ...) keeps
  // the header transparent even after scrolling, so its white/blurred band
  // never covers dark, full-bleed content underneath it.
  useEffect(() => {
    const sections = document.querySelectorAll('[data-navbar-theme="dark"]');
    if (!sections.length) return;
    const navHeight = window.innerWidth < 1024 ? 64 : 80;
    const states = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => states.set(entry.target, entry.isIntersecting));
        setOverDark(Array.from(states.values()).some(Boolean));
      },
      { rootMargin: `-${navHeight}px 0px -${Math.max(window.innerHeight - navHeight - 1, 0)}px 0px`, threshold: 0 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrolled = scrolledPast && !overDark;

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
          ? 'bg-white/85 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(11,19,36,0.15)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        <motion.div variants={item}>
          <Logo className="h-10 sm:h-11" variant={scrolled ? 'light' : 'dark'} />
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
                className={`relative px-3 py-2 text-[13px] font-semibold rounded-full transition-colors group ${
                  scrolled ? 'text-ink-900 hover:text-primary' : 'text-white hover:text-primary-100'
                }`}
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
            <LanguageSwitcher variant={scrolled ? 'light' : 'dark'} />
          </motion.div>
          <motion.a
            variants={item}
            href="/connexion"
            className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
              scrolled
                ? 'text-ink-900 hover:text-primary'
                : 'text-white hover:text-primary-100'
            }`}
          >
            Connexion
          </motion.a>
          <motion.a
            variants={item}
            href="/inscription"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full bg-primary text-white shadow-[0_8px_20px_-6px_rgba(255,106,0,0.55)] hover:shadow-[0_12px_28px_-6px_rgba(255,106,0,0.7)] transition-shadow"
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
            <LanguageSwitcher variant={scrolled ? 'light' : 'dark'} />
          </motion.div>
          <motion.button
            variants={item}
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
              scrolled ? 'text-ink-900 hover:bg-ink-100' : 'text-white hover:bg-white/10'
            }`}
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
/*   Mobile menu — bottom-sheet with backdrop, quick to open           */
/* ------------------------------------------------------------------ */

function MobileMenu({ open, onClose, links }) {
  const sheet = {
    hidden: { y: '100%' },
    show: { y: 0, transition: { type: 'spring', damping: 32, stiffness: 340 } },
    exit: { y: '100%', transition: { duration: 0.28, ease: [0.7, 0, 0.84, 0] } },
  };
  const li = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
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
            className="fixed inset-0 z-40 bg-ink-900/60 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            variants={sheet}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
            data-no-translate
          >
            <div className="mx-3 mb-3 rounded-3xl bg-white shadow-2xl border border-ink-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full bg-primary" />
                  <p className="font-heading text-ink-900 text-sm tracking-wide uppercase">Menu</p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center hover:bg-ink-200 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <motion.ul
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.045, delayChildren: 0.1 }}
                className="py-2"
              >
                {links.map((l) => (
                  <motion.li key={l.href} variants={li}>
                    <a
                      href={l.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-ink-100 transition-colors"
                    >
                      <span className="font-body text-ink-900 font-semibold">
                        {l.label}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                      </svg>
                    </a>
                  </motion.li>
                ))}
              </motion.ul>

              <div className="grid grid-cols-2 gap-2 p-4 pt-2">
                <a
                  href="/connexion"
                  onClick={onClose}
                  className="text-center text-sm font-semibold py-3 rounded-full bg-ink-100 text-ink-900 hover:bg-ink-200 transition-colors"
                >
                  Connexion
                </a>
                <a
                  href="/inscription"
                  onClick={onClose}
                  className="text-center text-sm font-semibold py-3 rounded-full bg-primary text-white shadow-lg shadow-primary/30"
                >
                  Créer un événement
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Navbar;
