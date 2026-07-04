import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { universes } from '../../data/universes';
import { media } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

/**
 * ZUI Hub-and-Spoke — camera-driven scrollytelling.
 *
 * Everything visible (camera translate/scale, front/nested crossfade, ring
 * highlight, HUD label) is tweened inside ONE continuous GSAP timeline
 * scrubbed by scroll — nothing is toggled by discrete React state, so the
 * camera and the content move at exactly the rate of the scrollbar, in both
 * directions, with no jump.
 *
 * v2 changes vs the previous pass:
 *   - Dropped the blur() crossfade (expensive on mobile GPUs, read as
 *     "broken/hazy" rather than premium) → plain opacity + scale crossfade,
 *     lighter and crisper.
 *   - Shorter overall scroll distance (was ~46 timeline units, now ~34) so
 *     the ride doesn't outstay its welcome.
 *   - Added a persistent HUD (current universe name + 1..6 progress dots)
 *     so the user always has their bearings, and an explicit "vue
 *     d'ensemble" pulse during every return-to-overview leg.
 *   - Alternates the active-ring color between the two brand colors
 *     (orange / bright blue) instead of orange-only, so the actual charter
 *     blue reads as a real color, not just a tiny text accent.
 *
 * Levels
 *   Overview : logo + all 6 blocks visible at once (auto-fit scale — always
 *              recomputed from the live viewport, so blocks can never
 *              overlap or touch, on any screen size).
 *   Zoom 1   : camera dives on one block; image + definition readable.
 *   Zoom 2   : camera pushes further; front face fades out while 3 nested
 *              cards (Comment ça marche / Pour qui / Confiance) fade in.
 *   Return   : reverse crossfade, camera pulls back out to the overview —
 *              HUD confirms "Vue d'ensemble" before diving into the next.
 *
 * Camera math (transform-origin 50% 50%, canvas centred on the viewport):
 *   to bring canvas point (dx,dy) to the viewport centre at scale S:
 *     transform: translate(-dx*S, -dy*S) scale(S)
 */

const BLOCK_W = 460;
const BLOCK_H = 600;
const ORBIT_R = 900;
const ANGLES = [-90, -30, 30, 90, 150, 210];
const RING_COLORS = ['#FF6A00', '#2B6BFF']; // alternate orange / brand blue

function positionsFor(count) {
  return ANGLES.slice(0, count).map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.cos(rad) * ORBIT_R), y: Math.round(Math.sin(rad) * ORBIT_R) };
  });
}

const positions = positionsFor(universes.length);

// Per-block scroll "budget", in arbitrary timeline units — tightened from
// the previous pass so six dives don't feel endless.
const T = {
  in: 1.3,        // fly from overview into zoom-1
  zoom1Hold: 0.8, // reading time for the definition
  deepen: 0.9,    // push from zoom-1 into zoom-2 (crossfade happens here)
  zoom2Hold: 1.4, // reading time for the 3 nested cards
  surface: 0.7,   // crossfade back to the front face
  out: 0.9,       // fly back out to overview
};
const INTRO_HOLD = 0.5;
const UNIT_VH = 50;

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const frontRefs = useRef([]);
  const nestedRefs = useRef([]);
  const ringRefs = useRef([]);
  const hudLabelRef = useRef(null);
  const hudDotsRef = useRef([]);
  const overviewPulseRef = useRef(null);
  const [sectionVh, setSectionVh] = useState(600);

  useLayoutEffect(() => {
    const perBlock = T.in + T.zoom1Hold + T.deepen + T.zoom2Hold + T.surface + T.out;
    const totalUnits = INTRO_HOLD + perBlock * universes.length;
    setSectionVh(Math.round(totalUnits * UNIT_VH));

    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      const maxX = Math.max(...positions.map((p) => Math.abs(p.x))) + BLOCK_W / 2;
      const maxY = Math.max(...positions.map((p) => Math.abs(p.y))) + BLOCK_H / 2;
      // Reserve room at the top for the HUD (label + progress dots) so the
      // topmost block never renders underneath it.
      const HUD_RESERVE = 230;
      const OVERVIEW = Math.min(
        (viewportW * 0.94) / (maxX * 2),
        ((viewportH - HUD_RESERVE) * 0.86) / (maxY * 2)
      );
      const mobile = viewportW < 768;
      const ZOOM_1 = mobile ? Math.min(1, (viewportW * 0.86) / BLOCK_W) : 1;
      const ZOOM_2 = ZOOM_1 * 1.18;

      gsap.set(canvas, { x: 0, y: 0, scale: OVERVIEW, transformOrigin: '50% 50%' });
      // Nested cards start fully below the block (hidden by its
      // overflow-hidden corner radius) — they'll slide up to COVER the
      // front face like a drawer, so the two layers are never both
      // legible at once (a plain crossfade let both texts overlap mid-
      // transition, which read as a rendering bug rather than a reveal).
      gsap.set(nestedRefs.current, { yPercent: 100 });
      gsap.set(ringRefs.current, { opacity: 0 });
      gsap.set(overviewPulseRef.current, { opacity: 1 });

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

      const flyTo = (dx, dy, S, dur) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S, scale: S, duration: dur }, '>');
      const hold = (dur) => tl.to({}, { duration: dur });
      const setLabel = (text) => tl.call(() => (hudLabelRef.current.textContent = text));
      const setDot = (i) => tl.call(() => {
        hudDotsRef.current.forEach((d, di) => d && d.classList.toggle('bg-primary', di === i));
        hudDotsRef.current.forEach((d, di) => d && d.classList.toggle('bg-white/25', di !== i));
      });

      hold(INTRO_HOLD);

      positions.forEach((p, i) => {
        const nested = nestedRefs.current[i];
        const ring = ringRefs.current[i];
        const ringColor = RING_COLORS[i % RING_COLORS.length];

        setLabel(universes[i].label);
        setDot(i);
        tl.to(overviewPulseRef.current, { opacity: 0, duration: T.in * 0.5 }, '<');

        // Approach + ring fade-in.
        gsap.set(ring, { '--ring-color': ringColor });
        flyTo(p.x, p.y, ZOOM_1, T.in);
        tl.to(ring, { opacity: 1, duration: T.in * 0.6 }, '<');
        hold(T.zoom1Hold);

        // Deepen the zoom while the nested cards slide up to COVER the
        // front face — a hard reveal, not a crossfade, so nothing overlaps.
        flyTo(p.x, p.y, ZOOM_2, T.deepen);
        tl.to(nested, { yPercent: 0, duration: T.deepen }, '<');
        hold(T.zoom2Hold);

        // Surface: camera eases back from zoom-2 to zoom-1 while the
        // nested cards slide back down, revealing the (untouched) front face.
        flyTo(p.x, p.y, ZOOM_1, T.surface);
        tl.to(nested, { yPercent: 100, duration: T.surface }, '<');

        // Pull all the way back to the overview.
        flyTo(0, 0, OVERVIEW, T.out);
        tl.to(ring, { opacity: 0, duration: T.out * 0.5 }, '<');
        tl.to(overviewPulseRef.current, { opacity: 1, duration: T.out * 0.5 }, `>-${T.out * 0.4}`);
        setLabel('Vue d’ensemble');
        setDot(-1);
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
        {/* Brand-tinted ambient background (both orange and blue, per charter) */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-[#0F1E3D] to-ink-900" />
        <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-secondary/25 blur-3xl" />

        {/* HUD — always tells the user where they are */}
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-20 text-center px-4">
          <div ref={overviewPulseRef} className="mb-2">
            <span className="text-secondary-100 text-[10px] tracking-[0.3em] uppercase font-semibold">
              Vue d'ensemble
            </span>
          </div>
          <p ref={hudLabelRef} className="font-heading text-white text-lg sm:text-xl normal-case">
            L'univers Moledi Events
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {universes.map((_, i) => (
              <span
                key={i}
                ref={(el) => (hudDotsRef.current[i] = el)}
                className="w-1.5 h-1.5 rounded-full bg-white/25 transition-colors"
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pt-16 sm:pt-10">
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
        className="pointer-events-none absolute -inset-2 rounded-[36px]"
        style={{
          border: '4px solid var(--ring-color, #FF6A00)',
          boxShadow: '0 40px 100px -15px var(--ring-color, #FF6A00)',
        }}
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

        {/* Nested face — 3 cards (Zoom 2). Slides up from below to physically
            cover the front face (GSAP controls yPercent only — no inline
            opacity here, since a static React style + GSAP DOM mutation on
            the same property would fight each other on re-render). */}
        <div
          ref={nestedRef}
          className="absolute inset-0 bg-white flex flex-col"
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
