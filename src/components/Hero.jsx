import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { media } from '../config/media';

const wrap = {
  hidden: {},
  show: { transition: { delayChildren: 0.6, staggerChildren: 0.14 } },
};
const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// Word-by-word reveal for the headline
function Reveal({ text, className = '', delay = 0 }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.08 }}
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

  // Lazy-load the MP4 after mount: poster shows instantly, video fades in.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onData = () => setVideoReady(true);
    v.addEventListener('loadeddata', onData);
    // kick off load only after first paint
    const id = requestAnimationFrame(() => {
      v.load();
      v.play().catch(() => {});
    });
    return () => {
      v.removeEventListener('loadeddata', onData);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-ink-900">
      {/* Poster (instant) */}
      <img
        src={media.heroPoster}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Video (progressive) */}
      <video
        ref={videoRef}
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

      {/* Overlays for legibility + brand tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/55 to-ink-900/90" />
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary-400/30 via-transparent to-primary/25" />

      <motion.div
        variants={wrap}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 w-full text-center"
      >
        <motion.p
          variants={rise}
          className="font-body text-primary font-semibold tracking-[0.2em] uppercase text-xs sm:text-sm mb-5"
        >
          La plateforme événementielle d'Afrique francophone
        </motion.p>

        <h1 className="text-white text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl">
          <Reveal text="Lancez, gérez et" delay={0.6} />
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-orange">
            <Reveal text="encaissez vos événements" delay={0.95} />
          </span>
        </h1>

        <motion.p
          variants={rise}
          className="mt-6 sm:mt-7 text-base sm:text-xl text-white/80 font-body normal-case max-w-2xl mx-auto"
        >
          Billetterie, votes, cagnottes, crowdfunding et concours — une seule
          plateforme pour créer votre événement, mobiliser votre communauté et
          recevoir vos paiements par Mobile Money.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-9 flex flex-row items-stretch justify-center gap-3 sm:gap-4"
        >
          <motion.a
            href="/inscription"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-initial text-center text-sm sm:text-base font-semibold px-5 sm:px-8 py-3.5 rounded-full bg-gradient-orange text-white shadow-xl shadow-primary/30"
          >
            Créer mon événement
          </motion.a>
          <motion.a
            href="/evenements"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-initial text-center text-sm sm:text-base font-semibold px-5 sm:px-8 py-3.5 rounded-full bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            Parcourir les événements
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5"
        >
          <span className="w-1 h-2 rounded-full bg-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
