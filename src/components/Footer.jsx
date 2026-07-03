import { media } from '../config/media';

const columns = [
  {
    title: 'Plateforme',
    links: [
      { label: 'Événements', href: '/evenements' },
      { label: 'Comment ça marche', href: '/comment-ca-marche' },
      { label: 'Tarifs & Couverture', href: '/tarifs' },
      { label: 'Devenir partenaire', href: '/partenaire' },
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
      { label: 'Conditions générales', href: '/legal' },
      { label: 'Mentions légales', href: '/legal#mentions' },
    ],
  },
];

const socials = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    path: 'M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1012 18.6 6.6 6.6 0 0012 5.4zm0 10.9a4.3 4.3 0 110-8.6 4.3 4.3 0 010 8.6zm6.4-11.2a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com',
    path: 'M16.5 3c.3 2.1 1.5 3.9 3.5 4.4v2.6c-1.3.1-2.6-.3-3.7-1v5.9c0 3.3-2.7 5.6-5.7 5.1-2.4-.4-4.2-2.5-4.1-4.9.1-2.6 2.3-4.6 4.9-4.4v2.7c-.4-.1-.8-.1-1.2 0-1 .3-1.6 1.3-1.4 2.3.2 1 1.2 1.7 2.2 1.5 1-.2 1.6-1 1.6-2V3h3.6z',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    path: 'M20.4 3H3.6C3.3 3 3 3.3 3 3.6v16.8c0 .3.3.6.6.6h16.8c.3 0 .6-.3.6-.6V3.6c0-.3-.3-.6-.6-.6zM8.3 18.3H5.6V9.7h2.7v8.6zM7 8.5a1.6 1.6 0 110-3.1 1.6 1.6 0 010 3.1zm11.3 9.8h-2.7v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.3h-2.7V9.7h2.6v1.2h.1c.4-.7 1.3-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1v4.7z',
  },
];

function Footer() {
  return (
    <footer className="bg-ink-900 text-white/70">
      {/* CTA strip */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-px rounded-3xl bg-gradient-to-r from-primary to-[#FFB347] p-8 sm:p-12 text-center overflow-hidden translate-y-[-2.5rem] shadow-2xl shadow-primary/30">
          <h3 className="text-white text-2xl sm:text-4xl mb-3">Prêt à lancer votre événement ?</h3>
          <p className="text-white/90 normal-case mb-6 max-w-lg mx-auto">
            Rejoignez les organisateurs qui font confiance à Moledi Events partout en Afrique francophone.
          </p>
          <a href="/inscription" className="inline-block bg-ink-900 text-white font-semibold rounded-full px-8 py-3.5 hover:bg-black transition-colors">
            Commencer gratuitement
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div>
            <img src={media.logo} alt="Moledi Events" className="h-10 w-auto rounded-md mb-4" />
            <p className="text-sm normal-case max-w-xs mb-5">
              La plateforme événementielle qui simplifie billetterie, votes,
              cagnottes, crowdfunding et concours en Afrique francophone.
            </p>
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-primary transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Moledi Events. Tous droits réservés.</p>
          <a href="mailto:contact@moledievents.com" className="hover:text-primary transition-colors">contact@moledievents.com</a>
          <p className="text-center">🌍 Afrique francophone · Paiement Mobile Money</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
