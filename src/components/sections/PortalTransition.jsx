import { motion } from 'framer-motion';

/**
 * Slogan interlude between the universes section and the rest of the page.
 * Previously this was driven by precise scroll-position math (useScroll +
 * useTransform across an exact 100vh window), which made the reveal feel
 * rushed/jarring on real devices. Replaced with the same safe whileInView
 * reveal used everywhere else on the site, plus a slow ambient glow loop
 * that runs independently of scroll (so it can never feel broken or
 * out of sync).
 */
function PortalTransition() {
  return (
    <section className="relative bg-ink-900 py-24 sm:py-32 overflow-hidden">
      {/* Horizon line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Ambient glow — slow independent loop, never tied to scroll */}
      <motion.div
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full"
      >
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute inset-10 rounded-full bg-[#FFB347]/30 blur-3xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20% 0px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center px-6"
      >
        <p className="text-white/60 text-xs tracking-[0.35em] uppercase mb-3">Moledi Events</p>
        <h2 className="text-white text-3xl sm:text-5xl leading-tight max-w-3xl mx-auto">
          Faites entrer la fête<br className="hidden sm:block" /> dans votre poche
        </h2>
      </motion.div>
    </section>
  );
}

export default PortalTransition;
