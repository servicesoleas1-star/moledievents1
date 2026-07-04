import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { universes } from '../../data/universes';
import { media } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

/**
 * ZUI Hub-and-Spoke — camera-driven scrollytelling, v3.
 *
 * Solar-system metaphor (per client brief):
 *   Level 1 — whole system: logo (sun) at the centre, 6 blocks (planets)
 *             orbiting around it. Each block shows ONLY its cover image +
 *             title — nothing else, so the overview stays uncluttered.
 *   Level 2 — approach one planet: the camera flies toward it (canvas
 *             translate+scale — this is a "getting closer" zoom). Once
 *             arrived, the block's definition text fades in.
 *   Level 3 — dive INSIDE the planet: a qualitatively different zoom. The
 *             block's own image keeps scaling up (its atmosphere rushing
 *             past), darkens, and the title/definition dissolve away while
 *             the 3 inner cards (Comment ça marche / Pour qui / Confiance)
 *             fade in as an overlay on top of that immersive backdrop —
 *             not a card sliding over from outside, but content appearing
 *             "from within" the same image, which is what actually reads
 *             as diving in rather than another panel arriving.
 *   Return  — reverse Level 3, reverse Level 2, all the way back to the
 *             Level-1 overview before the next planet is approached.
 *
 * Responsiveness / performance:
 *   - scrub is now near-immediate (0.35) instead of 1s-smoothed — the
 *     previous value made the camera visibly lag behind the scrollbar
 *     ("téléguidé" was the ask: the zoom must track the scroll directly).
 *   - Nested cards no longer carry their own images (was 6 × 4 = 24
 *     decoded images composited inside a constantly-transformed canvas —
 *     the likely cause of the reported lag on mobile). They're now plain
 *     glass panels over the same already-loaded cover image, which is
 *     both cheaper and better sells "still inside the same place, just
 *     deeper".
 *   - Logo is shown directly, no white card behind it.
 *   - The position/progress HUD has been removed entirely (asked for).
 *
 * Camera math (transform-origin 50% 50%, canvas centred on the viewport):
 *   to bring canvas point (dx,dy) to the viewport centre at scale S:
 *     transform: translate(-dx*S, -dy*S) scale(S)
 */

const BLOCK_W = 460;
const BLOCK_H = 600;
const ORBIT_R = 900;
const ANGLES = [-90, -30, 30, 90, 150, 210];
const RING_COLORS = ['#FF6A00', '#2B6BFF'];

function positionsFor(count) {
  return ANGLES.slice(0, count).map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.cos(rad) * ORBIT_R), y: Math.round(Math.sin(rad) * ORBIT_R) };
  });
}

const positions = positionsFor(universes.length);

// Per-block scroll budget, in arbitrary timeline units.
const T = {
  in: 1.2,        // approach: fly from overview to zoom-1
  zoom1Hold: 0.9, // reading time for title + definition
  deepen: 1.0,    // dive inside: image dilates, content dissolves in/out
  zoom2Hold: 1.3, // reading time for the 3 inner cards
  surface: 0.8,   // reverse the dive
  out: 0.8,       // fly back out to overview
};
const INTRO_HOLD = 0.4;
const UNIT_VH = 48;

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRefs = useRef([]);
  const darkRefs = useRef([]);
  const descRefs = useRef([]);
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

      const maxX = Math.max(...positions.map((p) => Math.abs(p.x))) + BLOCK_W / 2;
      const maxY = Math.max(...positions.map((p) => Math.abs(p.y))) + BLOCK_H / 2;
      const OVERVIEW = Math.min(
        (viewportW * 0.94) / (maxX * 2),
        (viewportH * 0.9) / (maxY * 2)
      );
      const mobile = viewportW < 768;
      const ZOOM_1 = mobile ? Math.min(1, (viewportW * 0.86) / BLOCK_W) : 1;
      const ZOOM_2 = ZOOM_1 * 1.1; // camera pushes a bit further for the dive

      gsap.set(canvas, { x: 0, y: 0, scale: OVERVIEW, transformOrigin: '50% 50%' });
      gsap.set(imgRefs.current, { scale: 1, transformOrigin: '50% 50%' });
      gsap.set(darkRefs.current, { opacity: 0 });
      gsap.set(descRefs.current, { opacity: 0, y: 10 });
      gsap.set(nestedRefs.current, { opacity: 0, y: 16 });
      gsap.set(ringRefs.current, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35, // near-immediate — the camera must track the scrollbar directly
          invalidateOnRefresh: true,
        },
      });

      const flyTo = (dx, dy, S, dur, ease) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S, scale: S, duration: dur, ease }, '>');
      const hold = (dur) => tl.to({}, { duration: dur });

      hold(INTRO_HOLD);

      positions.forEach((p, i) => {
        const img = imgRefs.current[i];
        const dark = darkRefs.current[i];
        const desc = descRefs.current[i];
        const nested = nestedRefs.current[i];
        const ring = ringRefs.current[i];
        const ringColor = RING_COLORS[i % RING_COLORS.length];

        // --- Level 1 → 2: approach the planet ---
        gsap.set(ring, { '--ring-color': ringColor });
        flyTo(p.x, p.y, ZOOM_1, T.in, 'power2.out');
        tl.to(ring, { opacity: 1, duration: T.in * 0.6 }, '<');
        // Definition text arrives once the camera has landed.
        tl.to(desc, { opacity: 1, y: 0, duration: T.in * 0.5 }, `>-${T.in * 0.3}`);
        hold(T.zoom1Hold);

        // --- Level 2 → 3: DIVE INSIDE — a different kind of zoom.
        // The block's own image keeps dilating (its own local scale, not
        // just the camera), the frame darkens like entering an atmosphere,
        // title/description dissolve away, and the inner cards appear as
        // if surfacing from within the same image — not a panel sliding
        // in from outside.
        flyTo(p.x, p.y, ZOOM_2, T.deepen, 'power3.in');
        tl.to(img, { scale: 1.35, duration: T.deepen, ease: 'power2.in' }, '<');
        tl.to(dark, { opacity: 0.75, duration: T.deepen }, '<');
        tl.to(desc, { opacity: 0, y: -8, duration: T.deepen * 0.6 }, '<');
        tl.to(nested, { opacity: 1, y: 0, duration: T.deepen * 0.7 }, `>-${T.deepen * 0.5}`);
        hold(T.zoom2Hold);

        // --- Surface: reverse the dive ---
        flyTo(p.x, p.y, ZOOM_1, T.surface, 'power2.out');
        tl.to(img, { scale: 1, duration: T.surface }, '<');
        tl.to(dark, { opacity: 0, duration: T.surface }, '<');
        tl.to(nested, { opacity: 0, y: 16, duration: T.surface * 0.5 }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.surface * 0.6 }, `>-${T.surface * 0.4}`);

        // --- Back out to the overview before the next planet ---
        flyTo(0, 0, OVERVIEW, T.out, 'power2.inOut');
        tl.to(ring, { opacity: 0, duration: T.out * 0.5 }, '<');
        tl.to(desc, { opacity: 0, duration: T.out * 0.4 }, '<');
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
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-[#0F1E3D] to-ink-900" />
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
                imgRef={(el) => (imgRefs.current[i] = el)}
                darkRef={(el) => (darkRefs.current[i] = el)}
                descRef={(el) => (descRefs.current[i] = el)}
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
  const [src, setSrc] = useState(media.logoLight);
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: 0 }}>
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl" />
        <img
          src={src}
          alt="Moledi Events"
          onError={() => setSrc(media.logoFallback)}
          className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-[0_10px_30px_rgba(255,106,0,0.5)]"
        />
      </div>
    </div>
  );
}

function Block({ univ, pos, imgRef, darkRef, descRef, nestedRef, ringRef }) {
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
        className="relative rounded-[28px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]"
        style={{ height: BLOCK_H }}
      >
        {/* Cover image — always present; this SAME image dilates for the
            Level-3 dive, so the inner cards read as "still here, just
            deeper" rather than a new screen replacing this one. */}
        <img
          ref={imgRef}
          src={univ.image}
          alt={univ.label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
        {/* Extra darkening for the dive — atmosphere getting thicker */}
        <div ref={darkRef} className="absolute inset-0 bg-black" />

        {/* Title — visible at every level (overview included); it's the
            one constant landmark as the camera moves. */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <h3 className="font-heading text-white text-2xl sm:text-3xl leading-tight normal-case">
            {univ.label}
          </h3>
          {/* Definition — hidden at overview, fades in once the camera lands (Level 2) */}
          <p ref={descRef} className="text-white/85 text-sm sm:text-base leading-relaxed normal-case mt-3">
            {univ.definition}
          </p>
        </div>

        {/* Inner cards — Level 3, surfacing over the (now dilated, dark)
            image rather than sliding in as a separate panel. */}
        <div
          ref={nestedRef}
          className="absolute inset-0 flex flex-col justify-center gap-3 p-6 sm:p-8"
        >
          {[univ.nested.how, univ.nested.who, univ.nested.trust].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4"
            >
              <p className="text-primary text-[10px] tracking-[0.25em] uppercase font-semibold mb-1.5">
                {c.title}
              </p>
              <p className="text-white/90 text-xs sm:text-sm leading-snug">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ZUIHubStory;
