import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { universes } from '../../data/universes';
import { media } from '../../config/media';

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

// Relative weights for the sub-animations inside each transition (arbitrary
// units — the real on-screen speed of a step is set by STEP_DURATION below,
// GSAP just samples these proportionally within that window).
const T = { in: 1.0, deepen: 0.7, surface: 0.6, out: 0.8 };

// Real seconds for each kind of step — this is what actually gets scrubbed
// by a single wheel notch / swipe, not the scroll distance.
const STEP_DURATION = { in: 0.85, deepen: 0.75, out: 1.05, jump: 1.1 };
const STEP_EASE = 'power2.inOut';

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRefs = useRef([]);
  const descRefs = useRef([]);
  const ringRefs = useRef([]);
  const overlayRefs = useRef([]);
  const blockRefs = useRef([]);
  const titleRefs = useRef([]);
  const flashRefs = useRef([]);
  const logoRef = useRef(null);
  const tlRef = useRef(null);
  const stopsRef = useRef([]);
  const currentStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const [inSection, setInSection] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      const navHeight = viewportW < 1024 ? 64 : 80;
      const usableH = viewportH - navHeight;

      const maxX = Math.max(...positions.map((p) => Math.abs(p.x))) + BLOCK_W / 2;
      const maxY = Math.max(...positions.map((p) => Math.abs(p.y))) + BLOCK_H / 2;
      const OVERVIEW = Math.min(
        (viewportW * 0.94) / (maxX * 2),
        (usableH * 0.9) / (maxY * 2)
      );
      const mobile = viewportW < 768;
      const ZOOM_1 = mobile ? Math.min(1, (viewportW * 0.88) / BLOCK_W) : 1;
      const ZOOM_2 = ZOOM_1 * 1.4;
      // Push the whole scene down by half the navbar height so the fixed
      // header never overlaps blocks that sit near the top of the canvas.
      const yOffset = navHeight / 2;

      gsap.set(canvas, { x: 0, y: yOffset, scale: OVERVIEW, transformOrigin: '50% 50%' });
      gsap.set(imgRefs.current, { scale: 1, transformOrigin: '50% 50%' });
      gsap.set(descRefs.current, { opacity: 0, y: 12 });
      gsap.set(ringRefs.current, { opacity: 0, scale: 0.92 });
      gsap.set(overlayRefs.current, { opacity: 0, pointerEvents: 'none' });
      gsap.set(flashRefs.current, { opacity: 0 });
      gsap.set(blockRefs.current, { opacity: 1, filter: 'blur(0px)' });
      gsap.set(logoRef.current, { opacity: 1, filter: 'blur(0px)' });

      // This timeline is never scrubbed by raw scroll position. It's a fixed
      // score of camera moves, paused, that we scrub with tl.tweenTo() one
      // discrete step at a time — every wheel notch / swipe plays exactly
      // one of these pre-built transitions from start to finish.
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
      tlRef.current = tl;

      const flyTo = (dx, dy, S, dur, ease, pos) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S + yOffset, scale: S, duration: dur, ease: ease || 'power3.inOut' }, pos ?? '>');

      const stops = ['overview-0'];
      tl.addLabel('overview-0');

      positions.forEach((p, i) => {
        const img = imgRefs.current[i];
        const desc = descRefs.current[i];
        const ring = ringRefs.current[i];
        const overlay = overlayRefs.current[i];
        const title = titleRefs.current[i];
        const flash = flashRefs.current[i];
        const ringColor = RING_COLORS[i % RING_COLORS.length];
        const others = blockRefs.current.filter((_, idx) => idx !== i).concat([logoRef.current]);
        gsap.set(ring, { '--ring-color': ringColor });

        // 1. OVERVIEW → ZOOM-1  (spotlight this block, dim every other one)
        // Anchored explicitly on tl.duration() (the timeline's true furthest
        // point) rather than the implicit '>' shorthand — '>' resolves to
        // "end of the most recently *inserted* tween", which for i>0 is the
        // previous block's `others` dim-restore tween, not its actual (later)
        // ending flyTo. Without this, this block's camera flight used to
        // start early and visibly collide with the previous block's outro.
        let t0 = tl.duration();
        flyTo(p.x, p.y, ZOOM_1, T.in, 'power2.out', t0);
        tl.to(ring, { opacity: 1, scale: 1, duration: T.in * 0.6, ease: 'back.out(1.4)' }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.in * 0.45, ease: 'power2.out' }, `>-${T.in * 0.25}`);
        if (title) {
          tl.to(title, { scale: 1.05, duration: T.in * 0.5 }, '<');
        }
        // Anchored on the phase's own start time (not chained with '<') so it
        // never shifts the ring/desc/title relative-position sequence above.
        tl.to(others, { opacity: 0.15, filter: 'blur(10px)', duration: T.in, ease: 'power2.out' }, t0);
        tl.addLabel(`zoom1-${i}`);
        stops.push(`zoom1-${i}`);

        // 2. ZOOM-1 → ZOOM-2  (dive in with a quick colored flash)
        tl.to(ring, { opacity: 0, scale: 1.08, duration: T.deepen * 0.35, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, y: -6, duration: T.deepen * 0.3 }, '<');
        if (title) {
          tl.to(title, { scale: 1, duration: T.deepen * 0.3 }, '<');
        }
        t0 = tl.duration();
        flyTo(p.x, p.y, ZOOM_2, T.deepen, 'power2.in');
        tl.to(img, { scale: 1.2, duration: T.deepen, ease: 'power2.in' }, '<');
        tl.to(overlay, { opacity: 1, pointerEvents: 'auto', duration: T.deepen * 0.55, ease: 'power2.inOut' }, `>-${T.deepen * 0.45}`);
        if (flash) {
          tl.set(flash, { '--flash-color': ringColor }, t0);
          tl.to(flash, { opacity: 0.55, duration: T.deepen * 0.25, ease: 'power1.in' }, t0);
          tl.to(flash, { opacity: 0, duration: T.deepen * 0.5, ease: 'power1.out' }, t0 + T.deepen * 0.25);
        }
        tl.addLabel(`zoom2-${i}`);
        stops.push(`zoom2-${i}`);

        // 3+4. ZOOM-2 → OVERVIEW, one continuous dézoom with no stop at
        // zoom-1 on the way out — matches the "big dézoom" the story needs
        // between one universe's detail and the next universe's overview.
        tl.to(overlay, { opacity: 0, pointerEvents: 'none', duration: T.surface * 0.45, ease: 'power2.in' });
        flyTo(p.x, p.y, ZOOM_1, T.surface, 'power2.out');
        tl.to(img, { scale: 1, duration: T.surface, ease: 'power2.out' }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.surface * 0.5 }, `>-${T.surface * 0.35}`);
        tl.to(ring, { opacity: 1, scale: 1, duration: T.surface * 0.4 }, `>-${T.surface * 0.35}`);

        t0 = tl.duration();
        tl.to(ring, { opacity: 0, scale: 0.92, duration: T.out * 0.4, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, duration: T.out * 0.35 }, '<');
        flyTo(0, 0, OVERVIEW, T.out, 'power3.inOut');
        tl.to(others, { opacity: 1, filter: 'blur(0px)', duration: T.out, ease: 'power2.inOut' }, t0);
        tl.addLabel(`overview-${i + 1}`);
        stops.push(`overview-${i + 1}`);
      });

      stopsRef.current = stops;
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // -- Step engine: one discrete wheel notch / swipe = exactly one step ----

  const stepUniverseIndex = (stepIdx) => {
    const name = stopsRef.current[stepIdx] || '';
    return name.startsWith('overview') ? -1 : Number(name.split('-')[1]);
  };

  const durationFor = (fromIdx, toIdx) => {
    if (Math.abs(toIdx - fromIdx) > 1) return STEP_DURATION.jump;
    const fromName = stopsRef.current[fromIdx] || '';
    if (fromName.startsWith('overview')) return STEP_DURATION.in;
    if (fromName.startsWith('zoom1')) return STEP_DURATION.deepen;
    return STEP_DURATION.out;
  };

  const goToStep = (rawIndex) => {
    const stops = stopsRef.current;
    const tl = tlRef.current;
    if (!tl || !stops.length) return;
    const clamped = Math.max(0, Math.min(stops.length - 1, rawIndex));
    if (clamped === currentStepRef.current || isAnimatingRef.current) return;
    const duration = durationFor(currentStepRef.current, clamped);
    isAnimatingRef.current = true;
    currentStepRef.current = clamped;
    setActiveIndex(stepUniverseIndex(clamped));
    tl.tweenTo(stops[clamped], {
      duration,
      ease: STEP_EASE,
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });
  };

  // Keep the rail's visibility in sync with whether this section currently
  // fills the viewport (i.e. is the one the user is "inside" right now).
  useEffect(() => {
    let raf = null;
    const check = () => {
      raf = null;
      if (!rootRef.current) return;
      setInSection(Math.abs(rootRef.current.getBoundingClientRect().top) < 2);
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    check();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Wheel: while the section fills the viewport, every notch is intercepted
  // and advances/retreats exactly one step — except at the very first or
  // last step, where we let the browser scroll on to the previous/next
  // section instead of trapping the user inside the story.
  useEffect(() => {
    const onWheel = (e) => {
      const stops = stopsRef.current;
      if (!stops.length || !rootRef.current) return;
      if (Math.abs(rootRef.current.getBoundingClientRect().top) >= 2) return;
      const dir = e.deltaY > 4 ? 1 : e.deltaY < -4 ? -1 : 0;
      if (dir === 0) {
        e.preventDefault();
        return;
      }
      const atStart = currentStepRef.current === 0;
      const atEnd = currentStepRef.current === stops.length - 1;
      if ((dir === -1 && atStart) || (dir === 1 && atEnd)) return; // release to the next/previous section
      e.preventDefault();
      if (isAnimatingRef.current) return;
      goToStep(currentStepRef.current + dir);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  // Touch: same one-swipe-one-step rule, releasing to native scroll once a
  // swipe crosses the first/last step boundary.
  useEffect(() => {
    let lastY = 0;
    let released = false;
    const onTouchStart = (e) => {
      lastY = e.touches[0].clientY;
      released = false;
    };
    const onTouchMove = (e) => {
      const stops = stopsRef.current;
      if (!stops.length || !rootRef.current || released) return;
      if (Math.abs(rootRef.current.getBoundingClientRect().top) >= 2) return;
      const y = e.touches[0].clientY;
      const delta = lastY - y; // positive = finger moving up = scroll-down intent
      if (Math.abs(delta) < 28) {
        e.preventDefault();
        return;
      }
      const dir = delta > 0 ? 1 : -1;
      const atStart = currentStepRef.current === 0;
      const atEnd = currentStepRef.current === stops.length - 1;
      if ((dir === -1 && atStart) || (dir === 1 && atEnd)) {
        released = true;
        return;
      }
      e.preventDefault();
      lastY = y;
      if (isAnimatingRef.current) return;
      goToStep(currentStepRef.current + dir);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const goToLabel = (label) => {
    const idx = stopsRef.current.indexOf(label);
    if (idx !== -1) goToStep(idx);
  };

  return (
    <section
      ref={rootRef}
      data-navbar-theme="dark"
      className="relative bg-ink-900 h-[100svh] overflow-hidden"
      aria-label="Les 6 univers de Moledi Events"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-[#0F1E3D] to-ink-900" />
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-primary/15 blur-[120px] animate-pulse"
        style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-secondary/20 blur-[120px]"
        style={{ transform: 'translateZ(0)' }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] rounded-full bg-primary/[0.04] blur-[80px]"
        style={{ transform: 'translate(-50%, -50%) translateZ(0)' }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={canvasRef} data-testid="zui-canvas" className="absolute left-1/2 top-1/2" style={{ willChange: 'transform' }}>
          <CenterLogo logoRef={logoRef} />
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
        <div
          key={`${univ.id}-flash`}
          ref={(el) => (flashRefs.current[i] = el)}
          className="pointer-events-none fixed inset-0 z-20"
          style={{ background: 'radial-gradient(circle at 50% 50%, var(--flash-color, #FF6A00) 0%, transparent 65%)' }}
        />
      ))}

      {universes.map((univ, i) => (
        <ImmersiveOverlay
          key={`${univ.id}-overlay`}
          univ={univ}
          overlayRef={(el) => (overlayRefs.current[i] = el)}
        />
      ))}

      <ProgressRail
        universes={universes}
        visible={inSection}
        activeIndex={activeIndex}
        onSelect={(i) => goToLabel(`zoom1-${i}`)}
        onHome={() => goToLabel('overview-0')}
      />
    </section>
  );
}

function ProgressRail({ universes, visible, activeIndex, onSelect, onHome }) {
  return (
    <div
      className={`fixed z-40 right-3 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={onHome}
        aria-label="Vue d'ensemble"
        className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
          activeIndex === -1 ? 'bg-white border-white scale-125' : 'bg-transparent border-white/40 hover:border-white/80'
        }`}
      />
      <span className="w-px h-4 bg-white/20" />
      {universes.map((univ, i) => (
        <button
          key={univ.id}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={univ.label}
          className="group relative flex items-center justify-center w-4 h-4"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
              activeIndex === i ? 'scale-125' : 'bg-transparent border-white/40 group-hover:border-white/80'
            }`}
            style={activeIndex === i ? { backgroundColor: RING_COLORS[i % RING_COLORS.length], borderColor: RING_COLORS[i % RING_COLORS.length] } : undefined}
          />
          <span className="pointer-events-none absolute right-6 whitespace-nowrap text-[11px] font-semibold text-white/90 bg-ink-900/80 backdrop-blur-sm px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {univ.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function CenterLogo({ logoRef }) {
  const [src, setSrc] = useState(media.logoLight);
  return (
    <div ref={logoRef} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: 0, willChange: 'opacity, filter' }}>
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
        willChange: 'opacity, filter',
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
