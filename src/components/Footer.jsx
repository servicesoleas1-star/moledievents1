import { useState } from 'react';
import { motion } from 'framer-motion';
import { media } from '../config/media';

const columns = [
  {
    title: 'Plateforme',
    links: [
      { label: 'Événements', href: '/evenements' },
      { label: 'Comment ça marche', href: '/comment-ca-marche' },
      { label: 'Tarifs', href: '/tarifs' },
      { label: 'Partenaires', href: '/partenaire' },
    ],
  },
  {
    title: 'Créer',
    links: [
      { label: 'Créer un événement', href: '/inscription' },
      { label: 'Se connecter', href: '/connexion' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Confidentialité', href: '/confidentialite' },
      { label: 'CGU', href: '/legal' },
      { label: 'Mentions légales', href: '/legal#mentions' },
    ],
  },
];

// Real brand-coloured social icons (SVG marks + brand backgrounds).
const socials = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    bg: '#1877F2',
    path: 'M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    bg: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1012 18.6 6.6 6.6 0 0012 5.4zm0 10.9a4.3 4.3 0 110-8.6 4.3 4.3 0 010 8.6zm6.4-11.2a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com',
    bg: '#000000',
    path: 'M16.5 3c.3 2.1 1.5 3.9 3.5 4.4v2.6c-1.3.1-2.6-.3-3.7-1v5.9c0 3.3-2.7 5.6-5.7 5.1-2.4-.4-4.2-2.5-4.1-4.9.1-2.6 2.3-4.6 4.9-4.4v2.7c-.4-.1-.8-.1-1.2 0-1 .3-1.6 1.3-1.4 2.3.2 1 1.2 1.7 2.2 1.5 1-.2 1.6-1 1.6-2V3h3.6z',
  },
  {
    name: 'X',
    href: 'https://x.com',
    bg: '#000000',
    path: 'M18.9 3H22l-7.4 8.4L23 21h-6.8l-5.3-6.5L4.7 21H1.6l7.9-9L1 3h6.9l4.8 6 6.2-6zm-1.2 16h1.9L7.3 4.8H5.3L17.7 19z',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    bg: '#0A66C2',
    path: 'M20.4 3H3.6C3.3 3 3 3.3 3 3.6v16.8c0 .3.3.6.6.6h16.8c.3 0 .6-.3.6-.6V3.6c0-.3-.3-.6-.6-.6zM8.3 18.3H5.6V9.7h2.7v8.6zM7 8.5a1.6 1.6 0 110-3.1 1.6 1.6 0 010 3.1zm11.3 9.8h-2.7v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.3h-2.7V9.7h2.6v1.2h.1c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1v4.7z',
  },
];

function Footer() {
  const [logoSrc, setLogoSrc] = useState(media.logo);

  return (
    <footer className="relative bg-ink-100 text-ink-700 overflow-hidden">
      {/* Restrained glows — orange + light blue only, matching the rest of the site */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

      {/* CTA — a simple, sober line, no coloured panel */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center"
      >
        <h3 className="text-ink-900 text-2xl sm:text-4xl mb-6 leading-tight">
          À l'événement annuel
        </h3>
        <a href="/inscription" className="btn btn-primary">
          Créer un événement
        </a>
      </motion.div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-ink-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pt-14 pb-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <img
              src={logoSrc}
              alt="Moledi Event"
              onError={() => setLogoSrc(media.logoFallback)}
              className="h-11 w-auto"
            />
            <p className="mt-4 text-sm normal-case max-w-xs leading-relaxed">
              Moledi Event connecte les organisateurs et le public, d'un bout
              à l'autre du continent africain.
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  style={
                    s.name === 'Instagram'
                      ? { backgroundImage: s.bg }
                      : { backgroundColor: s.bg }
                  }
                  className="w-9 h-9 flex items-center justify-center rounded-xl shadow-sm transition-transform hover:scale-110 hover:-translate-y-0.5"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>

            <a
              href="mailto:contact@moledievent.com"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-primary transition-colors"
            >
              contact@moledievent.com
            </a>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col, ci) => (
              <div key={col.title}>
                <h4 className="flex items-center gap-2 text-ink-900 font-semibold text-xs uppercase tracking-[0.2em] mb-4">
                  <span className={`w-1 h-4 rounded-full ${ci % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`} />
                  {col.title}
                </h4>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors group">
                        <span className="w-1 h-1 rounded-full bg-ink-200 group-hover:bg-primary transition-colors" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 border-t border-ink-200 text-xs text-ink-700/70">
          <p>© {new Date().getFullYear()} Moledi Event. Tous droits réservés.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="ml-1">Fait pour l'Afrique</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
