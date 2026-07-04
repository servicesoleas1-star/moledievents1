import { motion } from 'framer-motion';
import { illustration } from '../../config/media';

function PricingTeaser() {
  return (
    <section className="bg-white py-16 sm:py-24 lg:py-28">
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
                alt="Tarifs Moledi Events"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-xs text-ink-700">Revenu net estimé</p>
                <p className="font-heading text-2xl text-ink-900 normal-case leading-none mt-1">+ 94%</p>
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
            <p className="text-ink-700 text-base sm:text-lg normal-case mb-8 max-w-md">
              Pas d'abonnement à l'entrée : une commission simple et transparente
              par transaction. Simulez vos revenus nets et découvrez les frais par
              type d'événement.
            </p>
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
