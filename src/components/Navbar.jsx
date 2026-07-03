import { useState } from 'react';

const navLinks = [
  { label: 'Événements', href: '/evenements' },
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Couverture', href: '/tarifs#couverture' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Devenir partenaire', href: '/partenaire' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('FR');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-ink-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <a href="/" className="font-heading text-2xl text-ink-900">
          MOLEDI<span className="text-primary">EVENTS</span>
        </a>

        <ul className="hidden lg:flex items-center gap-6 font-body text-sm font-medium text-ink-700">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
            className="text-sm font-semibold text-ink-700 border border-ink-200 rounded-full px-3 py-1 hover:border-primary hover:text-primary transition-colors"
          >
            {lang}
          </button>
          <a
            href="/connexion"
            className="text-sm font-semibold text-ink-700 hover:text-primary transition-colors"
          >
            Connexion
          </a>
          <a
            href="/inscription"
            className="bg-gradient-orange text-white text-sm font-semibold rounded-full px-5 py-2.5 shadow-sm hover:opacity-90 transition-opacity"
          >
            Créer un événement
          </a>
        </div>

        <button
          className="lg:hidden text-ink-900"
          onClick={() => setOpen(!open)}
          aria-label="Ouvrir le menu"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-ink-200 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-ink-700 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <a href="/connexion" className="text-sm font-semibold text-ink-700">
              Connexion
            </a>
            <a
              href="/inscription"
              className="bg-gradient-orange text-white text-sm font-semibold rounded-full px-5 py-2.5"
            >
              Créer un événement
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
