import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { universes } from '../../data/universes';
import { media } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

/**
 * ZUI Hub-and-Spoke — camera-driven scrollytelling.
 *
 * Everything the user sees (camera translate/scale, front-face blur/opacity,
 * nested-cluster blur/opacity, active ring) is tweened INSIDE ONE continuous
 * GSAP timeline scrubbed by scroll. Nothing is toggled by discrete React
 * state — that was the source of the "jumpy / rushed" feeling. Scrubbing a
 * single timeline guarantees the camera and the content crossfade move at
 * exactly the same rate as the scrollbar, in both directions.
 *
 * Levels
 *   Overview : logo + all 6 blocks visible at once (autoscaled to always
 *              fit the current viewport — no manual per-breakpoint tuning).
 *   Zoom 1   : camera dives on one block; image + definition readable.
 *   Zoom 2   : camera pushes further; the front face dims + blurs (the
 *              "vision floue" the client asked for) while 3 nested cards
 *              (Comment ça marche / Pour qui / Confiance) crossfade in.
 *   Return   : reverse crossfade, zoom back out, move to the next block.
 *
 * Camera math (transform-origin 50% 50%, canvas centred on the viewport):
 *   to bring canvas point (dx,dy) to the viewport centre at scale S:
 *     transform: translate(-dx*S, -dy*S) scale(S)
 */

// Orbit layout — desktop-scale numbers; overview zoom is auto-fitted to the
// viewport at runtime so no breakpoint can ever cause blocks to overlap.
const BLOCK_W = 460;
const BLOCK_H = 600;
const ORBIT_R = 900;
const ANGLES = [-90, -30, 30, 90, 150, 210];

function positionsFor(count) {
  return ANGLES.slice(0, count).map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.cos(rad) * ORBIT_R), y: Math.round(Math.sin(rad) * ORBIT_R) };
  });
}

const positions = positionsFor(universes.length);

// Per-block scroll "budget", in arbitrary timeline units. Generous durations
// on purpose: this is what makes the dive feel deliberate instead of rushed.
const T = {
  in: 1.6,        // fly from overview into zoom-1
  zoom1Hold: 1.0, // reading time for the definition
  deepen: 1.1,    // push from zoom-1 into zoom-2 (crossfade happens here)
  zoom2Hold: 1.9, // reading time for the 3 nested cards
  surface: 0.9,   // crossfade back to the front face
  out: 1.1,       // fly back out to overview
};
const INTRO_HOLD = 0.6;
const UNIT_VH = 62; // how many vh one timeline "unit" consumes — tune pacing here

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const frontRefs = useRef([]);
  const nestedRefs = useRef([]);
  const ringRefs = useRef([]);
  const [sectionVh, setSectionVh] = useState(600);

  useLayoutEffect(() => {
    const perBlock = T.in + T.zoom1Hold + T.deepen + T.zoom2Hold + T.surface + T.out;
    const totalUnits = INTRO_HOLD + perBlock * universes.length;
    setSectionVh(Math.round(totalUnits * UNIT_VH));

    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      // Auto-fit overview scale: compute the bounding box of hub + all
      // blocks, then scale so it fits inside the viewport with a margin.
      const maxX = Math.max(...positions.map((p) => Math.abs(p.x))) + BLOCK_W / 2;
      const maxY = Math.max(...positions.map((p) => Math.abs(p.y))) + BLOCK_H / 2;
      const OVERVIEW = Math.min(
        (viewportW * 0.94) / (maxX * 2),
        (viewportH * 0.86) / (maxY * 2)
      );
      const mobile = viewportW < 768;
      const ZOOM_1 = mobile ? Math.min(1, (viewportW * 0.86) / BLOCK_W) : 1;
      const ZOOM_2 = ZOOM_1 * 1.18;

      gsap.set(canvas, { x: 0, y: 0, scale: OVERVIEW, transformOrigin: '50% 50%' });
      gsap.set(nestedRefs.current, { opacity: 0, filter: 'blur(14px)' });
      gsap.set(ringRefs.current, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      });

      const flyTo = (dx, dy, S, dur) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S, scale: S, duration: dur }, '>');
      const hold = (dur) => tl.to({}, { duration: dur });

      hold(INTRO_HOLD);

      positions.forEach((p, i) => {
        const front = frontRefs.current[i];
        const nested = nestedRefs.current[i];
        const ring = ringRefs.current[i];

        // Approach + ring fade-in happen together.
        flyTo(p.x, p.y, ZOOM_1, T.in);
        tl.to(ring, { opacity: 1, duration: T.in * 0.6 }, `<`);
        hold(T.zoom1Hold);

        // Deepen the zoom while crossfading front → nested (the blurred
        // "vision floue" transition, entirely scroll-scrubbed).
        flyTo(p.x, p.y, ZOOM_2, T.deepen);
        tl.to(front, { opacity: 0.08, filter: 'blur(10px)', duration: T.deepen }, '<');
        tl.to(nested, { opacity: 1, filter: 'blur(0px)', duration: T.deepen }, '<');
        hold(T.zoom2Hold);

        // Surface: camera eases back from zoom-2 to zoom-1 while the nested
        // cluster fades back into the (now sharp again) front face.
        flyTo(p.x, p.y, ZOOM_1, T.surface);
        tl.to(nested, { opacity: 0, filter: 'blur(14px)', duration: T.surface }, '<');
        tl.to(front, { opacity: 1, filter: 'blur(0px)', duration: T.surface }, '<');

        // Pull all the way back out to the overview, fading the ring as we go.
        flyTo(0, 0, OVERVIEW, T.out);
        tl.to(ring, { opacity: 0, duration: T.out * 0.5 }, '<');
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-ink-900"
      style={{ height: `${sectionVh}vh` }}
      aria-label="Les 6 univers de Moledi Events"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-secondary/25 blur-3xl" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={canvasRef} className="absolute left-1/2 top-1/2" style={{ willChange: 'transform' }}>
            <CenterLogo />
            {universes.map((univ, i) => (
              <Block
                key={univ.id}
                univ={univ}
                pos={positions[i]}
                frontRef={(el) => (frontRefs.current[i] = el)}
                nestedRef={(el) => (nestedRefs.current[i] = el)}
                ringRef={(el) => (ringRefs.current[i] = el)}
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
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: 0 }}>
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-white flex items-center justify-center shadow-[0_30px_80px_-10px_rgba(255,106,0,0.55)] ring-4 ring-primary/40">
        <img
          src={src}
          alt="Moledi Events"
          onError={() => setSrc(media.logoFallback)}
          className="w-4/5 h-4/5 object-contain"
        />
        <div className="absolute inset-[-14px] rounded-[2rem] border border-primary/25 animate-[spin_22s_linear_infinite]" />
      </div>
    </div>
  );
}

function Block({ univ, pos, frontRef, nestedRef, ringRef }) {
  return (
    <div
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width: BLOCK_W,
        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
      }}
    >
      <div
        ref={ringRef}
        className="pointer-events-none absolute -inset-2 rounded-[36px] ring-4 ring-primary/60 shadow-[0_40px_100px_-15px_rgba(255,106,0,0.45)]"
      />
      <div
        className="relative rounded-[28px] overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]"
        style={{ height: BLOCK_H }}
      >
        {/* Front face — image + definition (Zoom 1) */}
        <div ref={frontRef} className="absolute inset-0 flex flex-col">
          <div className="relative h-[45%] shrink-0">
            <img src={univ.image} alt={univ.label} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/0 to-transparent" />
          </div>
          <div className="p-7 sm:p-8 flex-1 flex flex-col justify-center">
            <h3 className="font-heading text-ink-900 text-2xl sm:text-3xl leading-tight normal-case mb-4">
              {univ.label}
            </h3>
            <p className="text-ink-700 text-sm sm:text-base leading-relaxed normal-case">
              {univ.definition}
            </p>
          </div>
        </div>

        {/* Nested face — 3 cards (Zoom 2), absolutely layered above the front,
            revealed purely by the timeline-driven opacity/blur tween. */}
        <div
          ref={nestedRef}
          className="absolute inset-0 bg-white flex flex-col"
          style={{ opacity: 0, filter: 'blur(14px)' }}
        >
          <div className="px-6 pt-5 pb-3 border-b border-ink-100 shrink-0">
            <p className="text-primary text-[10px] tracking-[0.3em] uppercase font-semibold">
              Zoom · {univ.label}
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
            {[univ.nested.how, univ.nested.who, univ.nested.trust].map((c) => (
              <div
                key={c.title}
                className="relative flex-1 rounded-2xl overflow-hidden bg-ink-100 border border-ink-200 flex"
              >
                <div className="relative w-28 sm:w-32 shrink-0">
                  <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="p-3 sm:p-4 flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-primary text-[9px] sm:text-[10px] tracking-[0.2em] uppercase mb-1 font-semibold">
                    {c.title}
                  </p>
                  <p className="text-ink-700 text-[11px] sm:text-xs leading-snug">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ZUIHubStory;
