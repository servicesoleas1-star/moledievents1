import { motion } from 'framer-motion';
import { paymentMethods, paymentMethodMeta } from '../../data/paymentMethods';

function MethodCard({ m }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-transform ${
        m.integrated ? 'border-ink-200 bg-white hover:-translate-y-0.5' : 'border-ink-200 bg-ink-100/60 opacity-70'
      }`}
    >
      <span
        className="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center font-heading text-[11px] normal-case tracking-wide text-center leading-tight"
        style={{ backgroundColor: m.bg, color: m.fg }}
      >
        {m.operator
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 3)}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900 truncate">{m.operator}</p>
        <p className="text-[11px] text-ink-700">
          {paymentMethodMeta[m.method]?.label} {!m.integrated && '· Bientôt disponible'}
        </p>
      </div>
    </div>
  );
}

/**
 * Payment methods — every operator is mapped ahead of time to the
 * `PaymentMethod` enum (UML DC-08) so integrating a real `Aggregator` later
 * is just flipping `integrated` to true; nothing in this grid is invented
 * per-country, it only reflects what `paymentMethods.js` declares.
 */
function PaymentMethodsGrid() {
  const live = paymentMethods.filter((m) => m.integrated);
  const upcoming = paymentMethods.filter((m) => !m.integrated);

  return (
    <section className="py-16 sm:py-20 bg-ink-100/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
            Moyens de paiement
          </p>
          <h2 className="text-3xl sm:text-5xl text-ink-900">Les opérateurs que vous utilisez déjà</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {live.map((m) => (
            <MethodCard key={m.operator} m={m} />
          ))}
        </div>

        {upcoming.length > 0 && (
          <>
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink-700 mb-4">
              Prochainement
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {upcoming.map((m) => (
                <MethodCard key={m.operator} m={m} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default PaymentMethodsGrid;
