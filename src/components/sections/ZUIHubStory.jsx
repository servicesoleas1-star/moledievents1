import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { universes } from '../../data/universes';
import { media } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

/**
 * ZUI Hub-and-Spoke — camera-driven scrollytelling, v5.
 *
 * Sequence (strict — this never changes):
 *   Overview → Zoom-1(A) → Zoom-2(A) → Zoom-1(A) → Overview
 *            → Zoom-1(B) → Zoom-2(B) → Zoom-1(B) → Overview → ...
 * The camera always returns to the full overview between two planets, and
 * every leg — both zoom-1 passes and the overview — gets an explicit
 * `hold()` so the stop is actually perceivable.
 *
 * Zoom-2 is a SEPARATE full-screen overlay, not a further-scaled block.
 *   Earlier attempts kept dilating the same fixed-size (460×600) block via
 *   the canvas transform until its edges fell outside the viewport. That
 *   technically hid the frame, but every child element scales with its
 *   parent under a CSS transform — so at the zoom factor required to push
 *   a 460px-wide card off a 390px-wide phone screen, a single line of text
 *   became wider than the phone itself and got clipped left/right. That
 *   was the real bug (not a timing/settle issue).
 *
 *   The fix: zoom-2 content now lives in a `position: fixed` overlay that
 *   is a SIBLING of the transformed canvas, not a child of it. It is laid
 *   out with normal responsive Tailwind classes at 1:1 scale, so it is
 *   trivially correct on any screen size — this is literally "on charge
 *   dynamiquement une autre section" from the brief. The camera still
 *   zooms the block further as it approaches (continuity), and the
 *   overlay fades to fully opaque exactly as that zoom peaks, so the
 *   hand-off reads as one continuous dive rather than a cut.
 *
 * Performance: scrub is near-immediate (0.35, was 1 — "téléguidé"). The
 * ring (border + box-shadow) is hidden before the dive so its shadow is
 * never scaled into an expensive, oversized halo — this was also making
 * previous passes feel laggy.
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

const T = {
  in: 1.2,           // approach: overview → zoom-1
  zoom1HoldIn: 0.8,  // stop at zoom-1 (arrival) — definition reads here
  deepen: 0.9,       // zoom-1 → zoom-2 (camera keeps closing in, overlay fades to opaque)
  zoom2Hold: 1.4,    // stop at zoom-2 — the full-screen overlay, 3 cards read here
  surface: 0.8,      // zoom-2 → zoom-1 (overlay fades out, camera pulls back)
  zoom1HoldOut: 0.5, // explicit stop at zoom-1 (return) before leaving
  out: 0.9,          // zoom-1 → overview
  overviewHold: 0.4, // explicit stop at overview before the next planet
};
const UNIT_VH = 48;

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRefs = useRef([]);
  const descRefs = useRef([]);
  const ringRefs = useRef([]);
  const overlayRefs = useRef([]);
  const [sectionVh, setSectionVh] = useState(600);

  useLayoutEffect(() => {
    const perBlock =
      T.in + T.zoom1HoldIn + T.deepen + T.zoom2Hold + T.surface + T.zoom1HoldOut + T.out;
    const totalUnits = T.overviewHold + (perBlock + T.overviewHold) * universes.length;
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
      // Moderate further zoom for continuity of motion — no longer needs to
      // reach an extreme value, since full coverage now comes from the
      // separate fixed overlay, not from over-scaling this same block.
      const ZOOM_2 = ZOOM_1 * 1.35;

      gsap.set(canvas, { x: 0, y: 0, scale: OVERVIEW, transformOrigin: '50% 50%' });
      gsap.set(imgRefs.current, { scale: 1, transformOrigin: '50% 50%' });
      gsap.set(descRefs.current, { opacity: 0, y: 10 });
      gsap.set(ringRefs.current, { opacity: 0 });
      gsap.set(overlayRefs.current, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });

      const flyTo = (dx, dy, S, dur, ease) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S, scale: S, duration: dur, ease }, '>');
      const hold = (dur) => tl.to({}, { duration: dur });

      hold(T.overviewHold);

      positions.forEach((p, i) => {
        const img = imgRefs.current[i];
        const desc = descRefs.current[i];
        const ring = ringRefs.current[i];
        const overlay = overlayRefs.current[i];
        const ringColor = RING_COLORS[i % RING_COLORS.length];
        gsap.set(ring, { '--ring-color': ringColor });

        // ═══ 1. OVERVIEW → ZOOM-1 (approach) ═══
        flyTo(p.x, p.y, ZOOM_1, T.in, 'power2.out');
        tl.to(ring, { opacity: 1, duration: T.in * 0.5 }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.in * 0.5 }, `>-${T.in * 0.3}`);
        hold(T.zoom1HoldIn); // ← explicit stop, definition is readable

        // ═══ 2. ZOOM-1 → ZOOM-2 (dive: camera keeps closing in, then the
        //         full-screen overlay takes over as it peaks) ═══
        tl.to(ring, { opacity: 0, duration: T.deepen * 0.3 });
        tl.to(desc, { opacity: 0, y: -8, duration: T.deepen * 0.3 }, '<');
        flyTo(p.x, p.y, ZOOM_2, T.deepen, 'power2.in');
        tl.to(img, { scale: 1.15, duration: T.deepen, ease: 'power2.in' }, '<');
        // Overlay fades to fully opaque right as the camera arrives — the
        // hand-off from "scaled block" to "real full-screen section".
        tl.to(overlay, { opacity: 1, duration: T.deepen * 0.6 }, `>-${T.deepen * 0.5}`);
        hold(T.zoom2Hold); // ← explicit stop, fully immersed, overlay content reads here

        // ═══ 3. ZOOM-2 → ZOOM-1 (surface: overlay fades out first, then
        //         the camera pulls back to the zoom-1 framing) ═══
        tl.to(overlay, { opacity: 0, duration: T.surface * 0.5 });
        flyTo(p.x, p.y, ZOOM_1, T.surface, 'power2.out');
        tl.to(img, { scale: 1, duration: T.surface }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.surface * 0.5 }, `>-${T.surface * 0.4}`);
        tl.to(ring, { opacity: 1, duration: T.surface * 0.4 }, `>-${T.surface * 0.4}`);
        hold(T.zoom1HoldOut); // ← explicit stop back at zoom-1, before leaving

        // ═══ 4. ZOOM-1 → OVERVIEW ═══
        tl.to(ring, { opacity: 0, duration: T.out * 0.4 });
        tl.to(desc, { opacity: 0, duration: T.out * 0.4 }, '<');
        flyTo(0, 0, OVERVIEW, T.out, 'power2.inOut');
        hold(T.overviewHold); // ← explicit stop at overview before the next planet
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
                descRef={(el) => (descRefs.current[i] = el)}
                ringRef={(el) => (ringRefs.current[i] = el)}
              />
            ))}
          </div>
        </div>

        {/* Zoom-2 overlays — one per universe, fixed full-screen siblings of
            the canvas so their layout is never affected by the camera's
            transform. Only ever one is opaque (+interactive) at a time. */}
        {universes.map((univ, i) => (
          <ImmersiveOverlay
            key={`${univ.id}-overlay`}
            univ={univ}
            overlayRef={(el) => (overlayRefs.current[i] = el)}
          />
        ))}
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

function Block({ univ, pos, imgRef, descRef, ringRef }) {
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
      {/* Ring — visible only at zoom-1 (approach / return); hidden before
          the dive so no frame is ever visible while immersed. */}
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
        <img
          ref={imgRef}
          src={univ.image}
          alt={univ.label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

        {/* Title — constant landmark; definition fades in only at zoom-1 */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <h3 className="font-heading text-white text-2xl sm:text-3xl leading-tight normal-case">
            {univ.label}
          </h3>
          <p ref={descRef} className="text-white/85 text-sm sm:text-base leading-relaxed normal-case mt-3">
            {univ.definition}
          </p>
        </div>
      </div>
    </div>
  );
}

// Zoom-2 content — a real, independent full-screen section (not scaled by
// the canvas), so it is correctly responsive on any device by construction.
function ImmersiveOverlay({ univ, overlayRef }) {
  const cards = [univ.nested.how, univ.nested.who, univ.nested.trust];
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-30 overflow-y-auto"
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0">
        <img src={univ.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/72" />
      </div>

      <div className="relative min-h-full flex items-center justify-center px-4 py-20 sm:py-16">
        <div className="w-full max-w-4xl">
          <p className="text-primary font-semibold tracking-[0.25em] uppercase text-[10px] sm:text-xs mb-3 text-center">
            À l'intérieur
          </p>
          <h3 className="font-heading text-white text-3xl sm:text-5xl normal-case text-center mb-10">
            {univ.label}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 overflow-hidden"
              >
                <div className="relative h-28 sm:h-32">
                  <img src={c.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-4">
                  <p className="text-primary text-[10px] tracking-[0.2em] uppercase font-semibold mb-1.5">
                    {c.title}
                  </p>
                  <p className="text-white/90 text-sm leading-snug">{c.text}</p>
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
