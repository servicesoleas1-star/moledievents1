import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * "Gates opening" transition — two luminous doors slide apart on scroll,
 * revealing daylight behind, bridging the immersive story to the real content.
 */
function PortalTransition() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const leftX = useTransform(scrollYProgress, [0.15, 0.6], ['0%', '-100%']);
  const rightX = useTransform(scrollYProgress, [0.15, 0.6], ['0%', '100%']);
  const glow = useTransform(scrollYProgress, [0.15, 0.45, 0.7], [0, 1, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0.35, 0.65], [0.9, 1.1]);

  return (
    <section ref={ref} className="relative h-[130vh] bg-white">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Daylight behind the doors */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50 to-secondary-50" />
        <motion.div
          style={{ opacity: glow }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-primary/30 blur-3xl"
        />

        {/* Center message */}
        <motion.div style={{ opacity: textOpacity, scale: textScale }} className="relative z-10 text-center px-6">
          <p className="text-secondary font-semibold tracking-[0.2em] uppercase text-xs mb-3">En ce moment</p>
          <h2 className="text-ink-900 text-3xl sm:text-5xl">Place aux événements</h2>
        </motion.div>

        {/* Left door */}
        <motion.div style={{ x: leftX }} className="absolute inset-y-0 left-0 w-1/2 bg-ink-900 border-r border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900 to-secondary-400/20" />
          <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
        </motion.div>
        {/* Right door */}
        <motion.div style={{ x: rightX }} className="absolute inset-y-0 right-0 w-1/2 bg-ink-900 border-l border-white/10">
          <div className="absolute inset-0 bg-gradient-to-l from-ink-900 to-primary/20" />
          <div className="absolute left-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

export default PortalTransition;
