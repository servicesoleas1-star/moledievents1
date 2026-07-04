import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { universes } from '../../data/universes';
import { media } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

/**
 * ZUI Hub-and-Spoke — refined per user brief.
 *
 * Layout
 *   Global view (Step 1)          : central logo + 6 named blocks visible at once
 *                                    (on BOTH mobile and desktop before any dive)
 *   Zoom 1 (per block)            : the block fills the viewport at native size,
 *                                    showing image + definition text
 *   Zoom 2 (nested inside block)  : 3 sub-cards fly in from behind the image →
 *                                    "Comment ça marche" · "Pour qui" · "Confiance"
 *   Return                        : dezoom to global view; next block; repeat.
 *
 * Camera math (transform-origin: 50% 50%, canvas centred on the viewport):
 *   To bring canvas point (dx, dy) to viewport centre at scale S:
 *     transform: translate(-dx*S, -dy*S) scale(S)
 * Scale values:
 *   overview: 0.42 (0.34 on mobile so everything fits)
 *   zoom-1  : 1.00 (block at native crisp resolution)
 *   zoom-2  : 1.35 (slight further push while 3 sub-cards fade in)
 */

// Block intrinsic size and orbit radius are picked at mount based on viewport
// so overview view fits everything in a single screen on both mobile & desktop.
function layoutFor(width) {
  if (width < 768) return { block: 340, height: 460, radius: 440 };
  if (width < 1200) return { block: 420, height: 560, radius: 640 };
  return { block: 480, height: 620, radius: 780 };
}

function positionsFor(count, radius) {
  const angles = [-90, -30, 30, 90, 150, 210];
  return angles.slice(0, count).map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.cos(rad) * radius), y: Math.round(Math.sin(rad) * radius) };
  });
}

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const activeIdxRef = useRef(-1);
  const zoom2Ref = useRef(false);
  const [activeIdx, setActiveIdxState] = useState(-1);
  const [zoom2, setZoom2State] = useState(false);
  const [layout, setLayout] = useState(() =>
    layoutFor(typeof window !== 'undefined' ? window.innerWidth : 1440)
  );
  const positions = positionsFor(universes.length, layout.radius);

  useEffect(() => {
    const onResize = () => setLayout(layoutFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      const OVERVIEW = mobile ? 0.30 : 0.42;
      const ZOOM_1 = mobile ? 0.85 : 1.0;
      const ZOOM_2 = mobile ? 1.15 : 1.35;

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

      const flyTo = (dx, dy, S, dur = 1) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S, scale: S, duration: dur });
      const hold = (t = 0.5) => tl.to({}, { duration: t });

      // Independent trigger for the active-block highlight — reliable in both
      // scroll directions (unlike timeline.call()).
      // Timeline segments per block: [enter → zoom1 hold → zoom2 hold → return]
      // We compute progress-thresholds after timeline is built.

      // Opening: hold on global view long enough to read all 6 blocks.
      hold(0.4);

      const boundaries = []; // { from, to } normalized time of each block sequence
      let cursor = 0.4; // matches the "hold(0.4)" above

      positions.forEach((p, i) => {
        const startProgress = cursor;

        // Zoom 1 dive
        flyTo(p.x, p.y, ZOOM_1, 1.2); cursor += 1.2;
        hold(0.5); cursor += 0.5;
        // Zoom 2 deep dive (inside the block)
        flyTo(p.x, p.y, ZOOM_2, 0.9); cursor += 0.9;
        hold(0.9); cursor += 0.9;
        // Retour au Zoom 1, puis à la vue globale
        flyTo(p.x, p.y, ZOOM_1, 0.5); cursor += 0.5;
        flyTo(0, 0, OVERVIEW, 0.9); cursor += 0.9;

        boundaries.push({ from: startProgress, to: cursor, zoom2From: startProgress + 1.7 });
      });

      // Compute total duration to normalise thresholds.
      const total = cursor;
      const normalized = boundaries.map((b) => ({
        from: b.from / total,
        to: b.to / total,
        zoom2From: b.zoom2From / total,
      }));

      // Highlight + Zoom-2 content visibility driven by progress.
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: ({ progress }) => {
          let idx = -1;
          let zoom2 = false;
          for (let i = 0; i < normalized.length; i++) {
            const b = normalized[i];
            if (progress >= b.from && progress < b.to) {
              idx = i;
              zoom2 = progress >= b.zoom2From;
              break;
            }
          }
          if (idx !== activeIdxRef.current) {
            activeIdxRef.current = idx;
            setActiveIdxState(idx);
          }
          if (zoom2 !== zoom2Ref.current) {
            zoom2Ref.current = zoom2;
            setZoom2State(zoom2);
          }
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-ink-900"
      style={{ height: `${Math.round(70 * universes.length + 60)}vh` }}
      aria-label="Les 6 univers de Moledi Events"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Ambient brand glows */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-secondary/25 blur-3xl" />

        {/* Camera viewport */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={canvasRef}
            className="absolute left-1/2 top-1/2"
            style={{ willChange: 'transform' }}
          >
            <CenterLogo />
            {universes.map((univ, i) => (
              <Block
                key={univ.id}
                idx={i}
                univ={univ}
                pos={positions[i]}
                active={activeIdx === i}
                showNested={activeIdx === i && zoom2}
                width={layout.block}
                height={layout.height}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- pieces ------------------------------ */

function CenterLogo() {
  const [src, setSrc] = useState(media.logo);
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: 0, top: 0 }}
    >
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-white flex items-center justify-center shadow-[0_30px_80px_-10px_rgba(255,106,0,0.55)] ring-4 ring-primary/40">
        <img
          src={src}
          alt="Moledi Events"
          onError={() => setSrc(media.logoFallback)}
          className="w-4/5 h-4/5 object-contain"
        />
        {/* Rotating brand ring */}
        <div className="absolute inset-[-14px] rounded-[2rem] border border-primary/25 animate-[spin_22s_linear_infinite]" />
      </div>
    </div>
  );
}

function Block({ idx, univ, pos, active, showNested, width, height }) {
  return (
    <div
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width,
        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
      }}
    >
      <div
        className={`relative rounded-[28px] overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] transition-shadow duration-500 ${
          active
            ? 'ring-4 ring-primary/60 shadow-[0_40px_100px_-15px_rgba(255,106,0,0.45)]'
            : 'ring-0'
        }`}
        style={{ height }}
      >
        {/* Front face (Zoom 1): image + definition — fades out when Zoom 2 opens */}
        <div
          className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${
            showNested ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="relative h-1/2">
            <img
              src={univ.image}
              alt={univ.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/0 to-transparent" />
          </div>
          <div className="p-8">
            <h3 className="font-heading text-ink-900 text-3xl leading-tight normal-case mb-4">
              {univ.label}
            </h3>
            <p className="text-ink-700 text-base leading-relaxed normal-case">
              {univ.definition}
            </p>
          </div>
        </div>

        {/* Zoom-2 face: 3 nested cards revealed on deep zoom */}
        <NestedCluster nested={univ.nested} label={univ.label} visible={showNested} />
      </div>
    </div>
  );
}

function NestedCluster({ nested, label, visible }) {
  const cards = [nested.how, nested.who, nested.trust];
  return (
    <div
      className={`absolute inset-0 bg-white flex flex-col transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="px-6 pt-6 pb-3 border-b border-ink-100">
        <p className="text-primary text-[10px] tracking-[0.3em] uppercase font-semibold">
          Zoom · {label}
        </p>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="relative rounded-2xl overflow-hidden bg-ink-100 border border-ink-200 flex flex-col"
          >
            <div className="relative h-24">
              <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="p-3 flex-1">
              <p className="text-primary text-[9px] tracking-[0.25em] uppercase mb-1.5 font-semibold">
                {c.title}
              </p>
              <p className="text-ink-700 text-[11px] leading-snug">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ZUIHubStory;
