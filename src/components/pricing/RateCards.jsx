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
];

function RateCards() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-6">
        {cards.map((c, i) => {
          const rate = getCommissionRate(c.rateType);
          return (
            <motion.div
              key={c.rateType}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-ink-200 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(11,19,36,0.3)]"
            >
              <span
                className={`w-2 h-2 rounded-full inline-block mb-4 ${
                  c.tone === 'primary' ? 'bg-primary' : 'bg-secondary'
                }`}
              />
              <p className="text-5xl font-heading normal-case text-ink-900 mb-2">
                {rate != null ? `${rate}%` : '—'}
              </p>
              <h3 className="text-lg font-semibold text-ink-900 mb-2">{c.title}</h3>
              <p className="text-sm text-ink-700 normal-case leading-relaxed">{c.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default RateCards;
