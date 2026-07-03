import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { illustration } from '../../config/media';

/**
 * Immersive "camera" scrollytelling (ZUI-inspired).
 * The scroll drives a virtual camera that flies THROUGH stacked scenes:
 *   Level 1  — overview of what the platform does
 *   Level 2  — zoom into one family (Cagnottes)
 *   Level 3  — deeper zoom into the sub-causes
 *   Outro    — pull back to the whole universe
 * Each scene enters zoomed-in, holds, then recedes — creating depth.
 * Transform-only (scale/opacity) → GPU accelerated. Reduced-motion safe.
 */

const families = [
  { key: 'ticketing', label: 'Billetterie', icon: '🎟️', angle: -90 },
  { key: 'votes', label: 'Votes & Scrutins', icon: '🗳️', angle: -18 },
  { key: 'donations', label: 'Cagnottes', icon: '💝', angle: 54 },
  { key: 'crowdfunding', label: 'Crowdfunding', icon: '🚀', angle: 126 },
  { key: 'contests', label: 'Concours & Tombolas', icon: '🎁', angle: 198 },
];

const subCauses = [
  { key: 'health', label: 'Santé', desc: 'Frais médicaux, urgences, soins.' },
  { key: 'studies', label: 'Études', desc: 'Scolarité, bourses, matériel.' },
  { key: 'solidarity', label: 'Solidarité', desc: 'Familles, sinistres, entraide.' },
  { key: 'projects', label: 'Projets', desc: 'Associations, initiatives locales.' },
];

// `points` = [fadeInStart, fullIn, fullOutStart, fadeOutEnd].
// Adjacent scenes share boundaries so crossfades overlap (no blank gaps).
function Scene({ children, points, scrollYProgress, zoom = true }) {
  const reduce = useReducedMotion();
  const opacity = useTransform(scrollYProgress, points, [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    points,
    zoom ? [1.28, 1, 1, 0.78] : [1.08, 1, 1, 0.96]
  );

  return (
    <motion.div
      style={reduce ? { opacity } : { opacity, scale }}
      className="absolute inset-0 flex items-center justify-center px-5"
    >
      <div className="w-full max-w-5xl">{children}</div>
    </motion.div>
  );
}

function ScrollStory() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Chapter progress bar
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative bg-ink-900" style={{ height: '480vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Ambient brand glows */}
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-secondary/20 blur-3xl" />

        {/* Chapter indicator */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 w-40 h-1 rounded-full bg-white/15 overflow-hidden">
          <motion.div style={{ scaleX: barScale }} className="h-full w-full origin-left bg-gradient-orange" />
        </div>

        {/* LEVEL 1 — Overview / orbital hub */}
        <Scene points={[0, 0.03, 0.20, 0.26]} scrollYProgress={scrollYProgress} zoom={false}>
          <div className="text-center">
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-4">
              Niveau 1 · L'univers Moledi
            </p>
            <h2 className="text-white text-3xl sm:text-5xl mb-10">
              Un univers, cinq façons de<br className="hidden sm:block" /> faire vivre vos événements
            </h2>
            <div className="relative mx-auto w-[300px] h-[300px] sm:w-[420px] sm:h-[420px]">
              <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-orange flex items-center justify-center text-center shadow-2xl shadow-primary/40">
                <span className="font-heading text-white text-sm sm:text-base leading-tight normal-case">
                  MOLEDI<br />EVENTS
                </span>
              </div>
              {families.map((f, i) => {
                const r = 165; // orbit radius (px)
                const rad = (f.angle * Math.PI) / 180;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  // Outer div owns the orbit position; inner motion only fades/scales.
                  <div
                    key={f.key}
                    className="absolute w-20 sm:w-24"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center gap-1.5 text-center"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-center justify-center text-2xl">
                        {f.icon}
                      </div>
                      <span className="text-[11px] sm:text-xs text-white/80 font-medium leading-tight">
                        {f.label}
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <p className="text-white/50 text-sm mt-10">Continuez à défiler pour plonger dans un univers ↓</p>
          </div>
        </Scene>

        {/* LEVEL 2 — Zoom into Cagnottes */}
        <Scene points={[0.20, 0.26, 0.48, 0.54]} scrollYProgress={scrollYProgress}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-3">
                Niveau 2 · Zoom sur les cagnottes
              </p>
              <h3 className="text-white text-3xl sm:text-4xl mb-4">Mobilisez pour une cause</h3>
              <p className="text-white/70 normal-case text-base sm:text-lg">
                Créez une cagnotte en quelques minutes, partagez-la, et suivez
                les dons en temps réel. Chaque contribution est confirmée par
                Mobile Money, avec un reçu instantané pour vos donateurs.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {['Dons en temps réel', 'Reçus automatiques', 'Objectif & progression'].map((t) => (
                  <span key={t} className="text-xs text-white/80 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={illustration.donations} alt="Cagnotte solidaire" className="w-full h-64 sm:h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <div className="bg-gradient-orange h-2 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <p className="text-white text-sm font-semibold">3 400 000 FCFA collectés · 68%</p>
                </div>
              </div>
            </div>
          </div>
        </Scene>

        {/* LEVEL 3 — Sub-causes */}
        <Scene points={[0.48, 0.54, 0.74, 0.80]} scrollYProgress={scrollYProgress}>
          <div className="text-center">
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-3">
              Niveau 3 · Chaque cause a sa place
            </p>
            <h3 className="text-white text-3xl sm:text-4xl mb-8">Santé, études, solidarité, projets…</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {subCauses.map((c) => (
                <div key={c.key} className="group relative rounded-2xl overflow-hidden border border-white/10">
                  <img src={illustration[c.key]} alt={c.label} className="w-full h-36 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                    <p className="font-heading text-white normal-case text-lg">{c.label}</p>
                    <p className="text-white/60 text-[11px] leading-snug mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Scene>

        {/* OUTRO — Pull back to the universe */}
        <Scene points={[0.74, 0.80, 0.97, 1]} scrollYProgress={scrollYProgress} zoom={false}>
          <div className="text-center">
            <h3 className="text-white text-3xl sm:text-5xl mb-4">
              Et ce n'est <span className="text-transparent bg-clip-text bg-gradient-orange">qu'un aperçu</span>
            </h3>
            <p className="text-white/70 normal-case text-base sm:text-lg max-w-xl mx-auto">
              Billetterie, votes, crowdfunding, concours… chaque univers cache
              la même promesse : simple à créer, puissant à partager, fiable pour
              encaisser.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {families.map((f) => (
                <span key={f.key} className="text-sm text-white/80 bg-white/10 border border-white/10 rounded-full px-4 py-2">
                  {f.icon} {f.label}
                </span>
              ))}
            </div>
          </div>
        </Scene>
      </div>
    </section>
  );
}

export default ScrollStory;
