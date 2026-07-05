import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const LINE_1 = 'Faites entrer la fête';
const LINE_2 = 'dans votre poche';

/**
 * Interlude between the universes story and the rest of the page.
 * The slogan WRITES ITSELF character by character (typewriter with a live
 * caret) when it scrolls into view, then the page flows on — no horizontal
 * divider, no background break: the same light tones continue on both
 * sides so the sections read as one continuous world.
 */
function useTypewriter(text, active, speed = 55, startDelay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    let i = 0;
    let interval = null;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [active, text, speed, startDelay]);
  return text.slice(0, count);
}

function PortalTransition() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-25% 0px' });
  const line1 = useTypewriter(LINE_1, inView, 55, 200);
  const line2 = useTypewriter(LINE_2, inView, 55, 200 + LINE_1.length * 55 + 250);
  const done = line2.length === LINE_2.length;

  return (
    <section ref={ref} className="relative bg-gradient-to-b from-white via-ink-100/60 to-white py-24 sm:py-32 overflow-hidden">
      {/* Ambient charter glow — slow independent loop */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full"
      >
        <div className="absolute inset-0 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute inset-10 rounded-full bg-secondary/10 blur-3xl" />
      </motion.div>

      <div className="relative z-10 text-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-ink-700 text-xs tracking-[0.35em] uppercase mb-4"
        >
          Moledi Event
        </motion.p>
        <h2 className="text-ink-900 text-3xl sm:text-5xl leading-tight max-w-3xl mx-auto min-h-[2.4em]" aria-label={`${LINE_1} ${LINE_2}`}>
          <span className="block">{line1}</span>
          <span className="block bg-gradient-to-r from-primary to-primary-300 bg-clip-text text-transparent">
            {line2}
            {/* Live caret while typing */}
            {inView && !done && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-[3px] h-[0.85em] align-baseline ml-1 bg-primary rounded-full"
              />
            )}
          </span>
        </h2>

        {/* Soft continuation cue once the sentence is written */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <span className="w-px h-14 bg-gradient-to-b from-primary/50 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

export default PortalTransition;
