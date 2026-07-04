import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { media } from '../config/media';

const wrap = {
  hidden: {},
  show: { transition: { delayChildren: 0.55, staggerChildren: 0.13 } },
};
const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

function Reveal({ text, delay = 0 }) {
  return (
    <span>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.07 }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
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
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-ink-900">
      {/* Poster shows instantly, video fades in when ready */}
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

      {/* Brand-tinted overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/55 to-ink-900/90" />
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/25 via-transparent to-primary/25" />

      <motion.div
        variants={wrap}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 w-full text-center"
      >
        <motion.p
          variants={rise}
          className="text-primary font-semibold tracking-[0.28em] uppercase text-[10px] sm:text-xs mb-5"
        >
          L'Afrique bouge, Moledi la connecte
        </motion.p>

        <h1 className="text-white text-[2.15rem] leading-[1.02] sm:text-6xl lg:text-7xl">
          <Reveal text="Vivez l'événement" delay={0.55} />
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FFB347]">
            <Reveal text="en un seul clic" delay={0.9} />
          </span>
        </h1>

        <motion.p
          variants={rise}
          className="mt-6 sm:mt-7 text-sm sm:text-lg md:text-xl text-white/85 normal-case max-w-xl sm:max-w-2xl mx-auto"
        >
          Billetterie, votes, cagnottes, crowdfunding, sponsoring, concours —
          la plateforme événementielle de l'Afrique francophone, dans votre poche.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-8 sm:mt-10 flex flex-row items-stretch justify-center gap-3 sm:gap-4 px-2"
        >
          <motion.a
            href="/inscription"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold px-5 sm:px-8 py-3 sm:py-3.5 rounded-full bg-primary text-white shadow-[0_16px_36px_-8px_rgba(255,106,0,0.55)]"
          >
            Créer un événement
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hidden sm:block">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </motion.a>
          <motion.a
            href="/evenements"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold px-5 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white/10 text-white border border-white/30 backdrop-blur-sm"
          >
            Parcourir
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
