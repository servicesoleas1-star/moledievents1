import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { media } from '../config/media';

const wrap = {
  hidden: {},
  show: { transition: { delayChildren: 0.4, staggerChildren: 0.12 } },
};
const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

// Word-by-word reveal with a soft rise + blur-out — no overflow clipping
// (per-word clipping proved unreliable on some mobile browsers).
function WordsReveal({ text, delay = 0, className = '', wordClassName = () => '' }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className={`inline-block whitespace-pre ${wordClassName(w, i)}`}
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.09 }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  );
}

// Floating universe chips that drift gently around the headline — a light,
// lively entry that sells the six universes at a glance.
const CHIPS = [
  { label: 'Billetterie', x: '6%', y: '24%', delay: 1.6, tone: 'orange' },
  { label: 'Votes', x: '85%', y: '20%', delay: 1.8, tone: 'blue' },
  { label: 'Cagnottes', x: '10%', y: '68%', delay: 2.0, tone: 'blue' },
  { label: 'Crowdfunding', x: '82%', y: '64%', delay: 2.2, tone: 'orange' },
  { label: 'Tombolas', x: '24%', y: '10%', delay: 2.4, tone: 'blue' },
  { label: 'Sponsoring', x: '68%', y: '82%', delay: 2.6, tone: 'orange' },
];

function FloatingChip({ chip }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: chip.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute hidden md:block"
      style={{ left: chip.x, top: chip.y }}
    >
      <motion.span
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5 + chip.delay, repeat: Infinity, ease: 'easeInOut' }}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-sm ${
          chip.tone === 'orange'
            ? 'bg-primary/10 border-primary/30 text-primary-600'
            : 'bg-secondary/10 border-secondary/30 text-secondary'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${chip.tone === 'orange' ? 'bg-primary' : 'bg-secondary'}`} />
        {chip.label}
      </motion.span>
    </motion.span>
  );
}

function Hero() {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onData = () => setVideoReady(true);
    const onError = () => setVideoAvailable(false);
    v.addEventListener('loadeddata', onData);
    v.addEventListener('error', onError, true);
    const id = requestAnimationFrame(() => {
      v.load();
      v.play().catch(() => {});
    });
    return () => {
      v.removeEventListener('loadeddata', onData);
      v.removeEventListener('error', onError, true);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-white">
      {/* Video background, treated LIGHT per the charter: the footage sits
          under a white veil with soft orange/blue tints instead of a dark
          overlay, so the whole page stays on a clear background. */}
      <img
        src={media.heroPoster}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      />
      {videoAvailable && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={media.heroPoster}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={media.heroVideo} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white" />
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 via-transparent to-primary/10" />

      {/* Soft charter glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-primary/10 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[32rem] h-[32rem] rounded-full bg-secondary/10 blur-[110px]" />

      {/* Floating universe chips */}
      <div className="absolute inset-0 max-w-7xl mx-auto">
        {CHIPS.map((c) => (
          <FloatingChip key={c.label} chip={c} />
        ))}
      </div>

      <motion.div
        variants={wrap}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 w-full text-center pt-16"
      >
        <motion.p
          variants={rise}
          className="inline-flex items-center gap-2 text-primary font-semibold tracking-[0.24em] uppercase text-[10px] sm:text-xs mb-6 px-4 py-1.5 rounded-full border border-primary/25 bg-white/70 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Moledi Event
        </motion.p>

        <h1
          className="text-ink-900 leading-[1.06] sm:leading-[1.0]"
          style={{ fontSize: 'clamp(2.1rem, 8vw, 5.2rem)' }}
        >
          <WordsReveal text="De l'idée à l'événement," delay={0.5} className="block" />
          <WordsReveal
            text="en un clic"
            delay={1.05}
            className="block"
            wordClassName={() => 'bg-gradient-to-r from-primary to-primary-300 bg-clip-text text-transparent'}
          />
        </h1>

        <motion.p
          variants={rise}
          className="mt-6 sm:mt-7 text-sm sm:text-lg md:text-xl text-ink-700 normal-case max-w-xl sm:max-w-2xl mx-auto"
        >
          Billetterie, votes, cagnottes, crowdfunding, sponsoring, concours —
          Moledi Event, la plateforme événementielle de l'Afrique francophone,
          dans votre poche.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-8 sm:mt-10 flex flex-row items-stretch justify-center gap-3 sm:gap-4 px-2"
        >
          {/* Bouton principal — orange gradient + arrow, per the UI kit */}
          <motion.a
            href="/inscription"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold px-5 sm:px-8 py-3 sm:py-3.5 rounded-full text-white bg-gradient-to-r from-primary to-primary-300 shadow-[0_16px_36px_-8px_rgba(255,106,0,0.5)]"
          >
            Créer un événement
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hidden sm:block">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </motion.a>
          {/* Bouton secondaire — solid blue + arrow, per the UI kit */}
          <motion.a
            href="/evenements"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold px-5 sm:px-8 py-3 sm:py-3.5 rounded-full text-white bg-secondary shadow-[0_16px_36px_-8px_rgba(43,107,255,0.45)]"
          >
            Parcourir les événements
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hidden sm:block">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </motion.a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="mt-12 sm:mt-16 flex flex-col items-center gap-2 text-ink-700"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">Découvrir</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-full border border-ink-200 bg-white/80 flex items-center justify-center shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
