import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { media } from '../config/media';

const wrap = {
  hidden: {},
  show: { transition: { delayChildren: 0.3, staggerChildren: 0.14 } },
};
const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
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
          initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.08 }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
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
      {/* Video background — fills the ENTIRE header, including the menu
          band above it (the navbar floats transparent on top until the
          user scrolls). Looping, and visible enough to read as footage,
          with a measured dark veil so the white copy always stays crisp —
          that contrast is what gives the header its sense of depth. */}
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
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/75 via-ink-900/35 to-ink-900/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />

      <motion.div
        variants={wrap}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 w-full text-center pt-16"
      >
        <motion.p
          variants={rise}
          className="inline-flex items-center gap-2 text-white font-semibold tracking-[0.24em] uppercase text-[10px] sm:text-xs mb-6 px-4 py-2 rounded-lg border border-white/25 bg-white/10 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-300" />
          Moledi Event
        </motion.p>

        <h1
          className="text-white leading-[1.06] sm:leading-[1.0]"
          style={{ fontSize: 'clamp(2.1rem, 8vw, 5.2rem)' }}
        >
          <WordsReveal text="De l'idée à l'événement," delay={0.45} className="block" />
          <WordsReveal
            text="en un clic"
            delay={0.95}
            className="block"
            wordClassName={() => 'bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent'}
          />
        </h1>

        <motion.p
          variants={rise}
          className="mt-6 sm:mt-7 text-sm sm:text-lg md:text-xl text-white/85 normal-case max-w-xl sm:max-w-2xl mx-auto"
        >
          Moledi Event rassemble tous vos rendez-vous — grands ou intimes —
          en un seul endroit, simple à organiser et à partager.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-8 sm:mt-10 flex flex-row items-stretch justify-center gap-3 sm:gap-4 px-2"
        >
          <motion.a
            href="/inscription"
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary flex-1 sm:flex-initial px-5 sm:px-8 py-3 sm:py-3.5"
          >
            Créer un événement
          </motion.a>
          <motion.a
            href="/evenements"
            whileTap={{ scale: 0.97 }}
            className="btn btn-light flex-1 sm:flex-initial px-5 sm:px-8 py-3 sm:py-3.5"
          >
            Parcourir les événements
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
