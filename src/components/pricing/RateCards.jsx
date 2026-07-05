import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getCommissionRate } from '../../data/commissionConfig';
import { illustration } from '../../config/media';

const cards = [
  {
    rateType: 'TICKET',
    title: 'Tarif standard',
    desc: 'Billetterie, dons & cagnottes, crowdfunding, loteries, sponsoring.',
    tone: 'primary',
    image: illustration.ticketing,
  },
  {
    rateType: 'VOTE',
    title: 'Votes & concours',
    desc: 'Scrutins publics, votes payants et concours à participation payante.',
    tone: 'secondary',
    image: illustration.votes,
  },
  {
    rateType: 'FLAT',
    rate: 0,
    title: 'Retrait & carte',
    desc: 'Aucun frais de retrait vers votre mobile money, aucun frais de transaction sur les paiements par carte.',
    tone: 'ink',
    image: illustration.cashout,
  },
];

const N = cards.length;

function RateCard({ c, i, isLast, scrollYProgress }) {
  const rate = c.rateType === 'FLAT' ? c.rate : getCommissionRate(c.rateType);

  // Recedes over the scroll segment during which the *next* card arrives
  // and docks over it — smaller, dimmer, never an abrupt swap.
  const segStart = i / (N - 1);
  const segEnd = (i + 1) / (N - 1);
  const scale = useTransform(scrollYProgress, [segStart, segEnd], [1, 1 - (i + 1) * 0.045], { clamp: true });
  const brightness = useTransform(scrollYProgress, [segStart, segEnd], [1, 1 - (i + 1) * 0.12], { clamp: true });
  const filter = useTransform(brightness, (b) => `brightness(${b})`);

  return (
    <div className={isLast ? '' : 'h-[60vh] sm:h-[50vh]'}>
      <div className="sticky" style={{ top: `${88 + i * 14}px`, zIndex: i + 1 }}>
        <motion.div
          style={isLast ? undefined : { scale, filter, transformOrigin: 'top center' }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 sm:gap-6 rounded-2xl border border-ink-200 bg-white p-6 sm:p-9 shadow-[0_25px_60px_-25px_rgba(11,19,36,0.35)]"
        >
          <div className="flex-1 min-w-0">
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
          </div>
          <img src={c.image} alt="" className="w-16 h-16 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0" />
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Rate cards stack on scroll: card 0 sticks and holds, then card 1 slides
 * up and docks just below its top edge (a slice of card 0's border stays
 * visible above it, receded — smaller, dimmer — instead of an abrupt swap).
 * Card 2 then docks below card 1 the same way, with both earlier cards
 * still peeking, further receded. A single scroll tracker over the whole
 * stack drives every card's recede amount, so nothing ever "bumps" — each
 * transition is a continuous scroll-linked motion.
 */
function RateCards() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section className="py-16 sm:py-20">
      <div ref={containerRef} className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {cards.map((c, i) => (
          <RateCard key={c.rateType} c={c} i={i} isLast={i === N - 1} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

export default RateCards;
