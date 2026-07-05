/**
 * UML note: no dedicated Testimonial table exists in DC-01→DC-10. The schema
 * only exposes a `TESTIMONIALS` BlockType for the per-event page builder
 * (DC-07). For the landing page these are curated marketing content managed
 * later via SiteConfig/back-office. Data is local for now.
 */
const items = [
  { quote: "1 200 billets vendus en une semaine, sans stress technique.", role: "Organisatrice — Concert", tag: "Billetterie" },
  { quote: "Objectif dépassé en 3 semaines grâce au partage WhatsApp intégré.", role: "Porteur de projet", tag: "Crowdfunding" },
  { quote: "Scrutin transparent, résultats en direct — les votants ont adoré.", role: "Organisatrice de concours", tag: "Votes" },
  { quote: "Cagnotte urgence médicale : 48h et l'objectif était atteint.", role: "Association", tag: "Cagnottes" },
  { quote: "Tirage automatique certifié, plus aucune contestation.", role: "Marque nationale", tag: "Tombolas" },
];

function Testimonials() {
  const loop = [...items, ...items];
  return (
    <section className="relative bg-gradient-to-b from-white via-secondary-50/30 to-white py-16 sm:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14 text-center sm:text-left">
        <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
          Ils font confiance à Moledi Event
        </p>
        <h2 className="text-3xl sm:text-4xl text-ink-900">Vivez local, célébrez grand</h2>
      </div>

      <div className="relative">
        <div className="flex gap-5 w-max animate-marquee-testimonials px-4">
          {loop.map((t, i) => {
            const blue = i % 2 === 1;
            return (
              <figure
                key={i}
                className="shrink-0 w-[300px] sm:w-[380px] rounded-3xl border border-ink-200 bg-white p-6 flex flex-col justify-between shadow-[0_14px_40px_-22px_rgba(11,19,36,0.3)]"
              >
                <div>
                  <svg width="28" height="20" viewBox="0 0 32 24" className={blue ? 'fill-secondary mb-4' : 'fill-primary mb-4'} aria-hidden>
                    <path d="M0 24V13.5C0 5.6 5.2 0 12.4 0v5.6c-3.7 0-6.5 3-6.5 6.7H12v11.7H0zM19.6 24V13.5C19.6 5.6 24.8 0 32 0v5.6c-3.7 0-6.5 3-6.5 6.7h6.5v11.7H19.6z"/>
                  </svg>
                  <blockquote className="text-ink-900 text-lg leading-snug normal-case">
                    {t.quote}
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-ink-700">{t.role}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-widest rounded-full px-3 py-1 ${
                      blue ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {t.tag}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}

export default Testimonials;
