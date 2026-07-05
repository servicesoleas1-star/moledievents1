import { motion } from 'framer-motion';
import { getCommissionRate } from '../../data/commissionConfig';

const cards = [
  {
    rateType: 'TICKET',
    title: 'Tarif standard',
    desc: 'Billetterie, dons & cagnottes, crowdfunding, loteries, sponsoring.',
    tone: 'primary',
  },
  {
    rateType: 'VOTE',
    title: 'Votes & concours',
    desc: 'Scrutins publics, votes payants et concours à participation payante.',
    tone: 'secondary',
  },
  {
    rateType: 'FLAT',
    rate: 0,
    title: 'Retrait & carte',
    desc: 'Aucun frais de retrait vers votre mobile money, aucun frais de transaction sur les paiements par carte.',
    tone: 'ink',
  },
];

/**
 * Rate cards stack on scroll (each one sticks in place as the next slides
 * over it) instead of sitting side by side — same "card stack" pattern used
 * on fapshi.com. Falls back to a plain vertical stack visually on very
 * short viewports since sticky degrades gracefully.
 */
function RateCards() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {cards.map((c, i) => {
          const rate = c.rateType === 'FLAT' ? c.rate : getCommissionRate(c.rateType);
          return (
            <div
              key={c.rateType}
              className="sticky top-24 sm:top-28 mb-5 sm:mb-6 last:mb-0"
              style={{ zIndex: i + 1 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-9 shadow-[0_25px_60px_-25px_rgba(11,19,36,0.35)]"
              >
                <span
                  className={`w-2 h-2 rounded-full inline-block mb-3 sm:mb-4 ${
                    c.tone === 'primary' ? 'bg-primary' : c.tone === 'secondary' ? 'bg-secondary' : 'bg-ink-900'
                  }`}
                />
                <p className="text-4xl sm:text-5xl font-heading normal-case text-ink-900 mb-1.5 sm:mb-2">
                  {rate != null ? `${rate}%` : '—'}
                </p>
                <h3 className="text-base sm:text-lg font-semibold text-ink-900 mb-1.5 sm:mb-2">{c.title}</h3>
                <p className="text-xs sm:text-sm text-ink-700 normal-case leading-relaxed">{c.desc}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RateCards;
