import { motion } from 'framer-motion';
import { illustration } from '../../config/media';

/**
 * Featured events — a conceptual teaser, not a live feed. Per spec: no
 * invented dates, vote counts or amounts here (that data belongs to real
 * event pages, once they exist) — just three event visuals presented as
 * partially overlapping tickets, inviting the visitor to the full catalog.
 */

const TICKETS = [
  { image: illustration.ticketing, rotate: -8, z: 1 },
  { image: illustration.votes, rotate: 0, z: 3 },
  { image: illustration.crowdfunding, rotate: 8, z: 2 },
];

function Ticket({ image, rotate, z, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{ zIndex: z, marginLeft: index === 0 ? 0 : '-3.5rem' }}
      className="relative w-40 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-[0_20px_45px_-18px_rgba(11,19,36,0.4)] shrink-0"
    >
      <img src={image} alt="" loading="lazy" className="w-full h-full object-cover" />
      {/* Perforated ticket edge — a thin dashed stub line near the top */}
      <div className="absolute inset-x-0 top-6 border-t-2 border-dashed border-white/70" />
      <span className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-ink-50" />
    </motion.div>
  );
}

function FeaturedMarquee() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
          En ce moment
        </p>
        <h2 className="text-3xl sm:text-4xl text-ink-900 mb-10">Événements en vedette</h2>

        <div className="flex justify-center items-center mb-10">
          {TICKETS.map((t, i) => (
            <Ticket key={i} {...t} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-ink-700 normal-case mb-6 max-w-md mx-auto">
            Concerts, votes, cagnottes, projets — de nouveaux événements
            rejoignent la plateforme chaque semaine.
          </p>
          <a href="/evenements" className="btn btn-secondary">
            Découvrir tous les événements
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedMarquee;
