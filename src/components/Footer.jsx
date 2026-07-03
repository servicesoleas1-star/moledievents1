const columns = [
  {
    title: 'Plateforme',
    links: [
      { label: 'Événements', href: '/evenements' },
      { label: 'Comment ça marche', href: '/comment-ca-marche' },
      { label: 'Tarifs', href: '/tarifs' },
      { label: 'Devenir partenaire', href: '/partenaire' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '/a-propos' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Confidentialité', href: '/confidentialite' },
      { label: 'Mentions légales', href: '/legal' },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-ink-900 text-white/70 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div>
            <a href="/" className="font-heading text-2xl text-white">
              MOLEDI<span className="text-primary">EVENTS</span>
            </a>
            <p className="mt-4 text-sm normal-case max-w-xs">
              La plateforme événementielle qui simplifie billetterie, votes,
              cagnottes, crowdfunding et concours en Afrique de l'Ouest.
            </p>
            <div className="flex gap-3 mt-5">
              {['facebook', 'instagram', 'twitter', 'linkedin'].map((s) => (
                <a
                  key={s}
                  href={`https://${s}.com`}
                  aria-label={s}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors text-xs uppercase"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs">
          <p>© {new Date().getFullYear()} Moledi Events. Tous droits réservés.</p>
          <p>contact@moledievents.com</p>
          <p>Sénégal · Côte d'Ivoire · Mali · Bénin · Togo · Burkina Faso</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
