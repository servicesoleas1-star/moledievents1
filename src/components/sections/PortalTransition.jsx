import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Light-ray transition — a soft luminous burst blooms from a horizon line,
 * washes the screen in warm brand light, then dissolves into the next
 * section. Compact (100vh) and mobile-friendly.
 */
function PortalTransition() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const rayScale = useTransform(scrollYProgress, [0.2, 0.55, 0.8], [0.4, 1.6, 3.4]);
  const rayOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.75, 0.95], [0, 1, 1, 0]);
  const bgWash = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.35, 0.5, 0.7], [0, 1, 0]);
  const textY = useTransform(scrollYProgress, [0.35, 0.7], [24, -12]);

  return (
    <section ref={ref} className="relative h-screen bg-ink-900 overflow-hidden">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Horizon */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Warm brand wash */}
        <motion.div
          style={{ opacity: bgWash }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/25 to-transparent"
        />

        {/* Central light ray — a bloom of orange light */}
        <motion.div
          style={{ scale: rayScale, opacity: rayOpacity }}
          className="absolute w-[36rem] h-[36rem] rounded-full origin-center"
        >
          <div className="absolute inset-0 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute inset-8 rounded-full bg-[#FFB347]/40 blur-3xl" />
          <div className="absolute inset-16 rounded-full bg-white/50 blur-2xl" />
        </motion.div>

        {/* Slogan */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 text-center px-6"
        >
          <p className="text-white/70 text-xs tracking-[0.35em] uppercase mb-3">
            Moledi Events
          </p>
          <h2 className="text-white text-3xl sm:text-5xl leading-tight max-w-3xl mx-auto">
            Faites entrer la fête<br className="hidden sm:block" /> dans votre poche
          </h2>
        </motion.div>
      </div>
    </section>
  );
}

export default PortalTransition;
