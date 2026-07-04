import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { universes } from '../../data/universes';
import { media } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

const BLOCK_W = 460;
const BLOCK_H = 600;
const ORBIT_R = 900;
const ANGLES = [-90, -30, 30, 90, 150, 210];
const RING_COLORS = ['#FF6A00', '#2B6BFF', '#FF6A00', '#2B6BFF', '#FF6A00', '#2B6BFF'];

function positionsFor(count) {
  return ANGLES.slice(0, count).map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.cos(rad) * ORBIT_R), y: Math.round(Math.sin(rad) * ORBIT_R) };
  });
}

const positions = positionsFor(universes.length);

const T = {
  in: 1.0,
  zoom1HoldIn: 0.6,
  deepen: 0.7,
  zoom2Hold: 1.2,
  surface: 0.6,
  zoom1HoldOut: 0.35,
  out: 0.8,
  overviewHold: 0.3,
};
const UNIT_VH = 44;

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRefs = useRef([]);
  const descRefs = useRef([]);
  const ringRefs = useRef([]);
  const overlayRefs = useRef([]);
  const blockRefs = useRef([]);
  const titleRefs = useRef([]);
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
      const ZOOM_1 = mobile ? Math.min(1, (viewportW * 0.88) / BLOCK_W) : 1;
      const ZOOM_2 = ZOOM_1 * 1.4;

      gsap.set(canvas, { x: 0, y: 0, scale: OVERVIEW, transformOrigin: '50% 50%' });
      gsap.set(imgRefs.current, { scale: 1, transformOrigin: '50% 50%' });
      gsap.set(descRefs.current, { opacity: 0, y: 12 });
      gsap.set(ringRefs.current, { opacity: 0, scale: 0.92 });
      gsap.set(overlayRefs.current, { opacity: 0 });

      // Subtle idle pulse on blocks at overview
      blockRefs.current.forEach((block) => {
        if (block) {
          gsap.to(block, {
            y: -6,
            duration: 2.5 + Math.random() * 1.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            delay: Math.random() * 2,
          });
        }
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.15,
          invalidateOnRefresh: true,
        },
      });

      const flyTo = (dx, dy, S, dur, ease) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S, scale: S, duration: dur, ease: ease || 'power3.inOut' }, '>');
      const hold = (dur) => tl.to({}, { duration: dur });

      hold(T.overviewHold);

      positions.forEach((p, i) => {
        const img = imgRefs.current[i];
        const desc = descRefs.current[i];
        const ring = ringRefs.current[i];
        const overlay = overlayRefs.current[i];
        const title = titleRefs.current[i];
        const ringColor = RING_COLORS[i % RING_COLORS.length];
        gsap.set(ring, { '--ring-color': ringColor });

        // 1. OVERVIEW → ZOOM-1
        flyTo(p.x, p.y, ZOOM_1, T.in, 'power2.out');
        tl.to(ring, { opacity: 1, scale: 1, duration: T.in * 0.6, ease: 'back.out(1.4)' }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.in * 0.45, ease: 'power2.out' }, `>-${T.in * 0.25}`);
        if (title) {
          tl.to(title, { scale: 1.05, duration: T.in * 0.5 }, '<');
        }
        hold(T.zoom1HoldIn);

        // 2. ZOOM-1 → ZOOM-2
        tl.to(ring, { opacity: 0, scale: 1.08, duration: T.deepen * 0.35, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, y: -6, duration: T.deepen * 0.3 }, '<');
        if (title) {
          tl.to(title, { scale: 1, duration: T.deepen * 0.3 }, '<');
        }
        flyTo(p.x, p.y, ZOOM_2, T.deepen, 'power2.in');
        tl.to(img, { scale: 1.2, duration: T.deepen, ease: 'power2.in' }, '<');
        tl.to(overlay, { opacity: 1, duration: T.deepen * 0.55, ease: 'power2.inOut' }, `>-${T.deepen * 0.45}`);
        hold(T.zoom2Hold);

        // 3. ZOOM-2 → ZOOM-1
        tl.to(overlay, { opacity: 0, duration: T.surface * 0.45, ease: 'power2.in' });
        flyTo(p.x, p.y, ZOOM_1, T.surface, 'power2.out');
        tl.to(img, { scale: 1, duration: T.surface, ease: 'power2.out' }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.surface * 0.5 }, `>-${T.surface * 0.35}`);
        tl.to(ring, { opacity: 1, scale: 1, duration: T.surface * 0.4 }, `>-${T.surface * 0.35}`);
        hold(T.zoom1HoldOut);

        // 4. ZOOM-1 → OVERVIEW
        tl.to(ring, { opacity: 0, scale: 0.92, duration: T.out * 0.4, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, duration: T.out * 0.35 }, '<');
        flyTo(0, 0, OVERVIEW, T.out, 'power3.inOut');
        hold(T.overviewHold);
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
        <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-primary/15 blur-[120px] animate-pulse" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-secondary/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] rounded-full bg-primary/[0.04] blur-[80px]" />

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
                blockRef={(el) => (blockRefs.current[i] = el)}
                titleRef={(el) => (titleRefs.current[i] = el)}
              />
            ))}
          </div>
        </div>

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

function CenterLogo() {
  const [src, setSrc] = useState(media.logoLight);
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: 0 }}>
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
        <div className="absolute inset-[-20px] rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute inset-[-8px] rounded-full border border-primary/20 animate-[spin_20s_linear_infinite]" />
        <img
          src={src}
          alt="Moledi Events"
          onError={() => setSrc(media.logoFallback)}
          className="relative w-20 h-20 sm:w-26 sm:h-26 object-contain drop-shadow-[0_8px_24px_rgba(255,106,0,0.5)]"
        />
      </div>
    </div>
  );
}

function Block({ univ, pos, imgRef, descRef, ringRef, blockRef, titleRef }) {
  return (
    <div
      ref={blockRef}
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
        className="pointer-events-none absolute -inset-2.5 rounded-[36px]"
        style={{
          border: '3px solid var(--ring-color, #FF6A00)',
          boxShadow: '0 0 60px -10px var(--ring-color, #FF6A00), inset 0 0 30px -15px var(--ring-color, #FF6A00)',
        }}
      />
      <div
        className="relative rounded-[28px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
        style={{ height: BLOCK_H }}
      >
        <img
          ref={imgRef}
          src={univ.image}
          alt={univ.label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <h3
            ref={titleRef}
            className="font-heading text-white text-2xl sm:text-3xl leading-tight normal-case"
            style={{ willChange: 'transform' }}
          >
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

function ImmersiveOverlay({ univ, overlayRef }) {
  const cards = [univ.nested.how, univ.nested.who, univ.nested.trust];
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-30 overflow-y-auto"
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0">
        <img src={univ.image} alt="" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative min-h-full flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-5xl">
          <h3 className="font-heading text-white text-3xl sm:text-5xl normal-case text-center mb-8 sm:mb-12 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {univ.label}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {cards.map((c, idx) => (
              <div
                key={c.title}
                className="group rounded-2xl bg-white/[0.08] border border-white/[0.12] overflow-hidden transition-transform duration-300"
              >
                <div className="relative h-32 sm:h-36 overflow-hidden">
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div
                    className="absolute bottom-3 left-4 text-[10px] tracking-[0.2em] uppercase font-semibold"
                    style={{ color: RING_COLORS[0] }}
                  >
                    {c.title}
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-white/90 text-sm leading-relaxed">{c.text}</p>
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
