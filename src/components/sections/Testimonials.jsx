import { motion } from 'framer-motion';

/**
 * NOTE (UML): there is no dedicated Testimonial table in DC-01→DC-10.
 * The schema only exposes a `TESTIMONIALS` BlockType for the campaign page
 * builder (DC-07). For the landing page, testimonials are curated content —
 * managed later via SiteConfig/back-office. Data is local for now.
 */
const testimonials = [
  {
    name: 'Aminata Mbaye',
    role: 'Organisatrice',
    type: 'Billetterie',
    avatar: 'https://i.pravatar.cc/120?img=45',
    quote: "Plus de 1 200 billets vendus en une semaine, sans aucun stress technique. Les paiements Mobile Money arrivent instantanément.",
  },
  {
    name: 'Ibrahima Fall',
    role: 'Porteur de projet',
    type: 'Crowdfunding',
    avatar: 'https://i.pravatar.cc/120?img=12',
    quote: "Objectif dépassé en trois semaines. La page était magnifique et le partage WhatsApp a tout changé.",
  },
  {
    name: 'Khady Diop',
    role: 'Organisatrice',
    type: 'Scrutin',
    avatar: 'https://i.pravatar.cc/120?img=32',
    quote: "Un système de vote transparent et fiable. Nos participants suivaient les résultats en direct, c'était vivant.",
  },
  {
    name: 'Moussa Traoré',
    role: 'Association',
    type: 'Cagnotte',
    avatar: 'https://i.pravatar.cc/120?img=68',
    quote: "Nous avons collecté pour une urgence médicale en 48h. La confiance des donateurs était au rendez-vous.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-primary mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold tracking-[0.15em] uppercase text-xs mb-2">Ils l'ont fait avec Moledi</p>
          <h2 className="text-3xl sm:text-5xl text-ink-900">Des organisateurs conquis</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-3xl p-7 border ${
                i === 0
                  ? 'bg-ink-900 border-ink-900 text-white sm:row-span-1'
                  : 'bg-ink-100 border-ink-200'
              }`}
            >
              <Stars />
              <blockquote className={`text-lg leading-relaxed normal-case ${i === 0 ? 'text-white' : 'text-ink-900'}`}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-6">
                <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/40" />
                <div>
                  <p className={`font-semibold ${i === 0 ? 'text-white' : 'text-ink-900'}`}>{t.name}</p>
                  <p className={`text-sm ${i === 0 ? 'text-white/60' : 'text-ink-700'}`}>{t.role}</p>
                </div>
                <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide bg-gradient-orange text-white rounded-full px-3 py-1">
                  {t.type}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
