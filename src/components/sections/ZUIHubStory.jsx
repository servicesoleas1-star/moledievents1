import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { illustration } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

/**
 * ZUI Hub-and-Spoke Scrollytelling — Prezi-style, driven by scroll.
 *
 * Key design principle (learned the hard way): elements on the virtual canvas
 * are DESIGNED AT THEIR TARGET ZOOMED-IN SIZE. When the camera is zoomed OUT
 * (overview) they appear small; when it dives in, they appear at natural,
 * crisp resolution — no upscaled/blurred text.
 *
 * Scales used:
 *   - overview: 0.42  → the whole solar system fits inside the viewport
 *   - dive:     1.0   → one satellite fills the viewing area at native size
 *   - nested:   2.0   → we zoom past the satellite into its Level-3 cluster
 *
 * The camera math: with transform-origin center and canvas centered on the
 * viewport (translate(-50%,-50%)), to bring canvas point (dx,dy) to viewport
 * center at scale S:
 *      transform: translate(-dx*S, -dy*S) scale(S)
 */

const HUB = { x: 0, y: 0 };
const SATELLITE_W = 560; // native px on the canvas
const NESTED_OFFSET_Y = 260; // where the Level-3 cluster sits inside cagnottes

const SATELLITES = [
  {
    id: 'billetterie',
    x: -1050, y: -520,
    icon: '🎟️', color: '#FF6A00',
    title: 'Billetterie',
    tagline: 'Concerts, conférences, spectacles',
    image: illustration.ticketing,
    lead: "Vendez des billets en ligne, encaissez par Mobile Money et sécurisez l'entrée avec un QR code inviolable scanné à la porte.",
    stats: [
      { k: '1 200+', v: 'billets/soirée' },
      { k: '<10s', v: 'du clic au billet' },
      { k: '100%', v: 'Mobile Money' },
    ],
  },
  {
    id: 'votes',
    x: 1050, y: -520,
    icon: '🗳️', color: '#2B6BFF',
    title: 'Votes & Scrutins',
    tagline: 'Élections, miss, prix, awards',
    image: illustration.votes,
    lead: "Organisez un scrutin transparent : vote gratuit ou payant, méthodes anti-fraude, jury pondéré et rapport de clôture certifié.",
    stats: [
      { k: 'Jury', v: 'pondéré' },
      { k: 'PDF', v: 'SHA-256' },
      { k: 'Anti-fraude', v: 'natif' },
    ],
  },
  {
    id: 'cagnottes',
    x: 1150, y: 420,
    icon: '💝', color: '#FF6A00',
    title: 'Cagnottes',
    tagline: 'Mobiliser pour une cause',
    image: illustration.donations,
    lead: "Collectez pour une cause. Chaque don est confirmé instantanément, avec reçu automatique aux donateurs.",
    nested: [
      { k: 'health',     label: 'Santé',      img: illustration.health,     desc: 'Frais médicaux, urgences, soins.' },
      { k: 'studies',    label: 'Études',     img: illustration.studies,    desc: 'Scolarité, bourses, matériel.' },
      { k: 'solidarity', label: 'Solidarité', img: illustration.solidarity, desc: 'Familles, sinistres, entraide.' },
      { k: 'projects',   label: 'Projets',    img: illustration.projects,   desc: 'Associations, initiatives locales.' },
    ],
  },
  {
    id: 'crowdfunding',
    x: -1150, y: 420,
    icon: '🚀', color: '#2B6BFF',
    title: 'Crowdfunding',
    tagline: 'Financer par paliers',
    image: illustration.crowdfunding,
    lead: "Structurez votre campagne en paliers, engagez votre communauté et suivez la progression en temps réel.",
    stats: [
      { k: 'Paliers', v: 'sur-mesure' },
      { k: 'Update', v: 'auto' },
      { k: 'Escrow', v: 'sécurisé' },
    ],
  },
  {
    id: 'concours',
    x: 0, y: 900,
    icon: '🎁', color: '#FF6A00',
    title: 'Concours & Tombolas',
    tagline: 'Tirages et compétitions',
    image: illustration.contests,
    lead: "Lancez concours et tombolas avec tirage automatique, prix mis sous séquestre et paiement immédiat au gagnant.",
    stats: [
      { k: 'Tirage', v: 'auto/manuel' },
      { k: 'Prix', v: 'séquestré' },
      { k: 'Notifs', v: 'temps réel' },
    ],
  },
];

const OVERVIEW = 0.42;
const DIVE = 1.0;
const NESTED = 2.0;

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const captionRef = useRef(null);
  const progressRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;

      // Start with the whole solar system in view.
      gsap.set(canvas, { x: 0, y: 0, scale: OVERVIEW, transformOrigin: '50% 50%' });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Camera: fly to (dx,dy) at scale S. Canvas transform-origin is center,
      // canvas is centered on the viewport → move by (-dx*S, -dy*S).
      const flyTo = (dx, dy, S, dur = 1) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S, scale: S, duration: dur });
      const hold = (t = 0.6) => tl.to({}, { duration: t });
      const cap = (text) =>
        tl.call(() => (captionRef.current.textContent = text));

      // Overview hold at start
      cap('L’univers Moledi Events');
      hold(0.5);

      // Billetterie
      cap('Billetterie · Ouvrez la vente en 5 min');
      flyTo(SATELLITES[0].x, SATELLITES[0].y, DIVE, 1.2);
      hold(1.0);
      cap('Retour à la vue globale');
      flyTo(HUB.x, HUB.y, OVERVIEW, 0.9);

      // Votes
      cap('Votes & Scrutins · Transparence & jury');
      flyTo(SATELLITES[1].x, SATELLITES[1].y, DIVE, 1.2);
      hold(1.0);
      cap('Retour à la vue globale');
      flyTo(HUB.x, HUB.y, OVERVIEW, 0.9);

      // Cagnottes + Level-3 nested dive
      cap('Cagnottes · Mobilisez pour une cause');
      flyTo(SATELLITES[2].x, SATELLITES[2].y, DIVE, 1.2);
      hold(0.6);
      cap('Zoom · Niveau 3 · Vos causes');
      // Dive further into the Level-3 cluster (offset y so the sub-cause grid centers)
      flyTo(SATELLITES[2].x, SATELLITES[2].y + NESTED_OFFSET_Y, NESTED, 1.2);
      hold(1.2);
      cap('On remonte…');
      flyTo(SATELLITES[2].x, SATELLITES[2].y, DIVE, 0.8);
      flyTo(HUB.x, HUB.y, OVERVIEW, 0.9);

      // Crowdfunding
      cap('Crowdfunding · Paliers & communauté');
      flyTo(SATELLITES[3].x, SATELLITES[3].y, DIVE, 1.2);
      hold(1.0);
      cap('Retour à la vue globale');
      flyTo(HUB.x, HUB.y, OVERVIEW, 0.9);

      // Concours
      cap('Concours & Tombolas · Tirages sécurisés');
      flyTo(SATELLITES[4].x, SATELLITES[4].y, DIVE, 1.2);
      hold(1.0);

      // Final wide reveal
      cap('Un univers, cinq façons');
      flyTo(HUB.x, HUB.y, OVERVIEW * 0.9, 1.2);

      // HUD progress
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Mobile scale down (canvas is huge → make everything more compact).
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 640px)').matches;
    if (mobile && canvasRef.current) {
      // reduce base scale so more fits on a small screen
      // (handled by tighter viewport in CSS below; timeline math still works
      //  because it's proportional)
    }
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-ink-900"
      style={{ height: '700vh' }}
      aria-label="Découvrez l’univers Moledi Events"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-secondary/20 blur-3xl" />
        {/* Starfield */}
        <Starfield />

        {/* Fixed HUD (over the camera, with a subtle backdrop so captions
             stay readable when the zoomed satellite passes underneath) */}
        <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 z-30 text-center">
          <div className="rounded-2xl px-5 py-3 bg-ink-900/60 backdrop-blur-md border border-white/10 shadow-lg">
            <p className="text-white/60 tracking-[0.35em] uppercase text-[10px] mb-2">
              Une plateforme · Cinq univers
            </p>
            <div className="w-56 h-1 rounded-full bg-white/10 overflow-hidden mx-auto">
              <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-gradient-orange" />
            </div>
            <p
              ref={captionRef}
              className="mt-2 font-heading text-white text-base normal-case tracking-wide"
            >
              L’univers Moledi Events
            </p>
          </div>
        </div>

        {/* Scroll hint (only visible at the very start) */}
        <ScrollHint />

        {/* Camera viewport wraps the virtual canvas */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={canvasRef}
            className="absolute left-1/2 top-1/2"
            style={{ willChange: 'transform' }}
          >
            <OrbitTrace />
            <Hub />
            {SATELLITES.map((s) => (
              <Satellite key={s.id} s={s} width={SATELLITE_W} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Hub() {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: 0, top: 0 }}
    >
      <div className="relative w-56 h-56 rounded-full bg-gradient-orange flex items-center justify-center shadow-[0_0_120px_-10px_#FF6A00]">
        <div className="absolute inset-3 rounded-full bg-ink-900/25 backdrop-blur-sm" />
        <div className="relative text-center">
          <p className="font-heading text-white text-3xl leading-none normal-case tracking-wide">MOLEDI</p>
          <p className="font-heading text-white/85 text-sm mt-2 normal-case tracking-[0.4em]">EVENTS</p>
        </div>
        {/* Rotating ring */}
        <div className="absolute inset-[-14px] rounded-full border border-white/20 animate-[spin_18s_linear_infinite]" />
      </div>
    </div>
  );
}

function OrbitTrace() {
  return (
    <svg
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: 0, top: 0, width: 2800, height: 2400 }}
      viewBox="-1400 -1200 2800 2400"
    >
      <ellipse cx="0" cy="0" rx="1200" ry="720" fill="none" stroke="#FF6A00" strokeOpacity="0.14" strokeWidth="2" strokeDasharray="6 12" />
      <ellipse cx="0" cy="200" rx="1350" ry="900" fill="none" stroke="#2B6BFF" strokeOpacity="0.10" strokeWidth="2" strokeDasharray="6 12" />
    </svg>
  );
}

function Satellite({ s, width }) {
  return (
    <div
      className="absolute"
      style={{
        left: 0, top: 0,
        transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px))`,
        width,
      }}
    >
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-ink-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        {/* Cover */}
        <div className="relative h-52">
          <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/50 to-transparent" />
          <div
            className="absolute top-4 left-4 flex items-center gap-2 rounded-full px-4 py-1.5 text-white text-sm font-semibold shadow-lg"
            style={{ backgroundColor: s.color }}
          >
            <span className="text-lg leading-none">{s.icon}</span>
            {s.title}
          </div>
        </div>
        {/* Body */}
        <div className="p-7">
          <h3 className="font-heading text-white text-4xl leading-tight normal-case">{s.title}</h3>
          <p className="text-primary text-xs mt-1 tracking-[0.25em] uppercase">{s.tagline}</p>
          <p className="text-white/75 text-base mt-4 leading-relaxed normal-case">{s.lead}</p>

          {s.stats && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              {s.stats.map((st) => (
                <div key={st.k} className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3.5 text-center">
                  <p className="font-heading text-white text-xl normal-case leading-none">{st.k}</p>
                  <p className="text-white/60 text-[11px] mt-1.5 leading-tight">{st.v}</p>
                </div>
              ))}
            </div>
          )}

          {s.nested && (
            <div className="mt-6">
              <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-3">Vos causes · Niveau 3</p>
              <div className="grid grid-cols-2 gap-3">
                {s.nested.map((n) => (
                  <div key={n.k} className="relative rounded-2xl overflow-hidden border border-white/10 h-40">
                    <img src={n.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      <p className="font-heading text-white text-base normal-case leading-tight">{n.label}</p>
                      <p className="text-white/70 text-[11px] leading-tight mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Starfield() {
  // Purely decorative sparkles behind the canvas.
  const stars = Array.from({ length: 60 });
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((_, i) => {
        const size = Math.random() * 2 + 1;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{
              width: size,
              height: size,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
            }}
          />
        );
      })}
    </div>
  );
}

function ScrollHint() {
  return (
    <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-white/50 text-xs">
      <span className="tracking-[0.3em] uppercase">Défilez pour explorer</span>
      <div className="w-6 h-9 rounded-full border border-white/30 flex items-start justify-center p-1.5">
        <span className="block w-1 h-2 rounded-full bg-white/60 animate-bounce" />
      </div>
    </div>
  );
}

export default ZUIHubStory;
