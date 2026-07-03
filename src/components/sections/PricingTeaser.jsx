import { motion } from 'framer-motion';
import { illustration } from '../../config/media';

function PricingTeaser() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text — left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-primary font-semibold tracking-[0.15em] uppercase text-xs mb-3">Tarification claire</p>
            <h2 className="text-3xl sm:text-5xl text-ink-900 mb-5">
              Vous ne payez que quand vous encaissez
            </h2>
            <p className="text-ink-700 text-base sm:text-lg normal-case mb-8 max-w-md">
              Pas d'abonnement à l'entrée : une commission simple et transparente
              par transaction. Simulez vos revenus nets et découvrez les frais
              par type d'événement.
            </p>
            <a
              href="/tarifs"
              className="inline-flex items-center gap-2 bg-gradient-blue text-white font-semibold rounded-full px-8 py-4 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:gap-3 transition-all"
            >
              Découvrir nos tarifs
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </motion.div>

          {/* Image — right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-blue opacity-10 rounded-[2rem] blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-ink-200 shadow-2xl">
              <img src={illustration.pricing} alt="Tarifs Moledi Events" className="w-full h-72 sm:h-96 object-cover" />
              <div className="absolute top-4 right-4 bg-white rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-xs text-ink-700">Revenu net estimé</p>
                <p className="font-heading text-2xl text-ink-900 normal-case">+ 94%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PricingTeaser;
