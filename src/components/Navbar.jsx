import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { media } from '../config/media';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

const navLinks = [
  { label: 'Créer un événement', href: '/inscription' },
  { label: 'Événements', href: '/evenements' },
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Couverture', href: '/tarifs#couverture' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Devenir partenaire', href: '/partenaire' },
];

// Orchestrated arrival: container glides in from the right, children stagger.
const container = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      when: 'beforeChildren',
      delayChildren: 0.25,
      staggerChildren: 0.08,
    },
  },
};
const item = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const logoVariant = {
  hidden: { opacity: 0, scale: 0.8, y: -8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function Logo() {
  return (
    <a href="/" className="flex items-center shrink-0" aria-label="Moledi Events — accueil">
      <img src={media.logo} alt="Moledi Events" className="h-9 sm:h-10 w-auto" />
    </a>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-ink-200 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16 sm:h-[72px]">
        <motion.div variants={logoVariant}>
          <Logo />
        </motion.div>

        {/* Desktop links */}
        <ul className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <motion.li key={link.href} variants={item}>
              <a
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-full transition-colors group ${
                  scrolled ? 'text-ink-700 hover:text-primary' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
                <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-orange scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </a>
            </motion.li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden xl:flex items-center gap-3">
          <motion.div variants={item}>
            <LanguageSwitcher />
          </motion.div>
          <motion.a
            variants={item}
            href="/connexion"
            className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
              scrolled
                ? 'border-ink-200 text-ink-900 hover:border-secondary hover:text-secondary'
                : 'border-white/40 text-white hover:bg-white/10'
            }`}
          >
            Connexion
          </motion.a>
          <motion.a
            variants={item}
            href="/inscription"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gradient-orange text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            Créer un événement
          </motion.a>
        </div>

        {/* Mobile actions */}
        <div className="flex xl:hidden items-center gap-2">
          <motion.div variants={item}>
            <LanguageSwitcher />
          </motion.div>
          <motion.button
            variants={item}
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className={`relative w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-full border transition-colors ${
              scrolled ? 'border-ink-200 text-ink-900' : 'border-white/40 text-white'
            }`}
          >
            <span className="block w-5 h-0.5 rounded-full bg-current" />
            <span className="block w-5 h-0.5 rounded-full bg-current" />
            <span className="block w-3.5 h-0.5 rounded-full bg-current self-center ml-[-6px]" />
          </motion.button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </motion.header>
  );
}

function MobileMenu({ open, onClose }) {
  const panel = {
    hidden: { clipPath: 'circle(0% at 100% 0%)' },
    show: {
      clipPath: 'circle(150% at 100% 0%)',
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], when: 'beforeChildren', staggerChildren: 0.06, delayChildren: 0.15 },
    },
    exit: { clipPath: 'circle(0% at 100% 0%)', transition: { duration: 0.4, ease: [0.7, 0, 0.84, 0] } },
  };
  const link = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-[70] bg-ink-900 xl:hidden"
        >
          <div className="flex items-center justify-between px-4 h-16">
            <img src={media.logo} alt="Moledi Events" className="h-9 w-auto rounded-md" />
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="w-11 h-11 flex items-center justify-center rounded-full border border-white/30 text-white"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 pt-4 pb-8 flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
            <ul className="space-y-0.5 flex-1">
              {navLinks.map((l) => (
                <motion.li key={l.href} variants={link}>
                  <a
                    href={l.href}
                    onClick={onClose}
                    className="flex items-center justify-between py-2.5 text-lg font-heading uppercase tracking-wide text-white border-b border-white/10"
                  >
                    {l.label}
                    <span className="text-primary text-sm">→</span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.div variants={link} className="grid grid-cols-2 gap-3 pt-6 shrink-0">
              <a
                href="/connexion"
                onClick={onClose}
                className="text-center text-sm font-semibold py-3.5 rounded-full border border-white/40 text-white"
              >
                Connexion
              </a>
              <a
                href="/inscription"
                onClick={onClose}
                className="text-center text-sm font-semibold py-3.5 rounded-full bg-gradient-orange text-white shadow-lg shadow-primary/30"
              >
                Créer un événement
              </a>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Navbar;
