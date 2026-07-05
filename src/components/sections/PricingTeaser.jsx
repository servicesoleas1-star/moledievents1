import { motion } from 'framer-motion';
import { illustration } from '../../config/media';

/**
 * Pricing teaser — mirrors the UML DC-08 commission model:
 *   CommissionConfig      → one rate per campaign type (CommissionType enum:
 *                           VOTE | TICKET | DONATION | CF | CONTEST | LOTTERY)
 *   UserCommissionConfig  → negotiated per-organizer overrides
 * No invented numbers here: the exact rates live in the back-office config;
 * the landing page presents the model and links to /tarifs for details.
 */

const COMMISSION_TYPES = [
  { type: 'TICKET', label: 'Billetterie', tone: 'orange' },
  { type: 'VOTE', label: 'Votes', tone: 'blue' },
  { type: 'DONATION', label: 'Cagnottes', tone: 'orange' },
  { type: 'CF', label: 'Crowdfunding', tone: 'blue' },
  { type: 'CONTEST', label: 'Concours', tone: 'orange' },
  { type: 'LOTTERY', label: 'Tombolas', tone: 'blue' },
];

function PricingTeaser() {
  return (
    <section className="bg-gradient-to-b from-white via-primary-50/40 to-white py-16 sm:py-24 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image — appears FIRST on mobile so it's always visible */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 lg:order-2"
          >
            <div className="absolute -inset-4 bg-secondary/10 rounded-[2rem] blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-ink-200 shadow-2xl aspect-[4/3] lg:aspect-square">
              <img
                src={illustration.pricing}
                alt="Tarifs Moledi Event"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-xs text-ink-700">Reversement</p>
                <p className="font-heading text-xl text-ink-900 normal-case leading-none mt-1">Temps réel</p>
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-xs text-ink-700">Abonnement</p>
                <p className="font-heading text-xl normal-case leading-none mt-1 bg-gradient-to-r from-primary to-primary-300 bg-clip-text text-transparent">0 F</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1"
          >
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-3">
              Tarification claire
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-ink-900 mb-5 leading-[1.05]">
              Vous ne payez que quand vous encaissez
            </h2>
            <p className="text-ink-700 text-base sm:text-lg normal-case mb-6 max-w-md">
              Pas d'abonnement à l'entrée : une commission unique, prélevée par
              transaction confirmée, dont le taux dépend du type de campagne.
              Tarifs négociés possibles pour les grands organisateurs.
            </p>

            {/* One commission rate per campaign type (CommissionType enum) */}
            <div className="flex flex-wrap gap-2 mb-8">
              {COMMISSION_TYPES.map((c) => (
                <span
                  key={c.type}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border ${
                    c.tone === 'blue'
                      ? 'bg-secondary/5 border-secondary/25 text-secondary'
                      : 'bg-primary/5 border-primary/25 text-primary-600'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${c.tone === 'blue' ? 'bg-secondary' : 'bg-primary'}`} />
                  {c.label}
                </span>
              ))}
            </div>

            <a
              href="/tarifs"
              className="inline-flex items-center gap-2 bg-secondary text-white font-semibold rounded-full px-7 sm:px-8 py-3.5 shadow-[0_16px_36px_-8px_rgba(43,107,255,0.5)] hover:gap-3 transition-all"
            >
              Découvrir nos tarifs
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PricingTeaser;
