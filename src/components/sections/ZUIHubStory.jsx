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

// Real seconds for each kind of step — a scroll is just the "play" trigger,
// not something the camera tracks 1:1. Each value is how long that whole
// pre-built camera move takes to play once fired, like starting a video
// clip. Slowed down further per feedback: the user wants each flight to
// genuinely read as "taking time" — the longer the trip through space, the
// stronger the sense of immersion. `outIn` is the merged "dézoom then
// re-zoom" clip that plays as ONE uninterrupted flight between two
// universes, so it gets the longest budget of all.
const STEP_DURATION = { in: 2.6, deepen: 2.3, outIn: 4.6, out: 2.9, jump: 2.5 };
const STEP_EASE = 'power2.inOut';

// One distinct "camera personality" per universe (6, not 3, so nothing
// repeats across a full pass) so the zooms/dézooms never feel monotone.
// Each style varies the ease curve, a touch of rotation on the flight, and
// how hard the image punches in — but never the tween count or position
// anchors, so this can't reintroduce timing conflicts between blocks.
const FLIGHT_STYLES = [
  { inEase: 'power2.out', deepenEase: 'power2.in', ringEase: 'back.out(1.4)', imgPunch: 1.2, rotate: 0 },
  { inEase: 'power1.inOut', deepenEase: 'power1.inOut', ringEase: 'elastic.out(1,0.65)', imgPunch: 1.14, rotate: -1.5 },
  { inEase: 'back.out(1.05)', deepenEase: 'power3.in', ringEase: 'back.out(2)', imgPunch: 1.28, rotate: 1.5 },
  { inEase: 'sine.inOut', deepenEase: 'sine.in', ringEase: 'power1.out', imgPunch: 1.1, rotate: 0 },
  { inEase: 'power4.out', deepenEase: 'power4.in', ringEase: 'back.out(1.8)', imgPunch: 1.32, rotate: -2 },
  { inEase: 'circ.out', deepenEase: 'circ.in', ringEase: 'elastic.out(1,0.5)', imgPunch: 1.18, rotate: 2 },
];

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

      gsap.set(canvas, { x: 0, y: yOffset, scale: OVERVIEW, rotate: 0, transformOrigin: '50% 50%' });
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

      const flyTo = (dx, dy, S, dur, ease, pos, rotate = 0) =>
        tl.to(
          canvas,
          { x: -dx * S, y: -dy * S + yOffset, scale: S, rotate, duration: dur, ease: ease || 'power3.inOut' },
          pos ?? '>'
        );

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
        const style = FLIGHT_STYLES[i % FLIGHT_STYLES.length];
        gsap.set(ring, { '--ring-color': ringColor });

        // 1. OVERVIEW → ZOOM-1  (spotlight this block, dim every other one)
        // Anchored explicitly on tl.duration() (the timeline's true furthest
        // point) rather than the implicit '>' shorthand — '>' resolves to
        // "end of the most recently *inserted* tween", which for i>0 is the
        // previous block's `others` dim-restore tween, not its actual (later)
        // ending flyTo. Without this, this block's camera flight used to
        // start early and visibly collide with the previous block's outro.
        let t0 = tl.duration();
        flyTo(p.x, p.y, ZOOM_1, T.in, style.inEase, t0, style.rotate);
        tl.to(ring, { opacity: 1, scale: 1, duration: T.in * 0.6, ease: style.ringEase }, '<');
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
          // Fully hidden (not just reset) once the immersive overlay takes
          // over — otherwise the block's own title, blown up underneath,
          // shows through as a stray duplicate of the overlay's big title.
          tl.to(title, { opacity: 0, scale: 1, duration: T.deepen * 0.3 }, '<');
        }
        t0 = tl.duration();
        flyTo(p.x, p.y, ZOOM_2, T.deepen, style.deepenEase, undefined, style.rotate);
        tl.to(img, { scale: style.imgPunch, duration: T.deepen, ease: style.deepenEase }, '<');
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
        flyTo(p.x, p.y, ZOOM_1, T.surface, 'power2.out', undefined, style.rotate);
        tl.to(img, { scale: 1, duration: T.surface, ease: 'power2.out' }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.surface * 0.5 }, `>-${T.surface * 0.35}`);
        if (title) {
          tl.to(title, { opacity: 1, duration: T.surface * 0.5 }, '<');
        }
        tl.to(ring, { opacity: 1, scale: 1, duration: T.surface * 0.4 }, `>-${T.surface * 0.35}`);

        t0 = tl.duration();
        tl.to(ring, { opacity: 0, scale: 0.92, duration: T.out * 0.4, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, duration: T.out * 0.35 }, '<');
        flyTo(0, 0, OVERVIEW, T.out, 'power3.inOut', undefined, 0);
        tl.to(others, { opacity: 1, filter: 'blur(0px)', duration: T.out, ease: 'power2.inOut' }, t0);
        tl.addLabel(`overview-${i + 1}`);
        // Every intermediate "back to overview" is NOT its own stop — it
        // plays straight through into the next universe's zoom-in as a
        // single uninterrupted clip (see durationFor's "outIn" case), so a
        // scroll never dead-ends on a bare overview between two universes.
        // Only the very first and very last overview are real resting stops.
        const isLast = i === positions.length - 1;
        if (isLast) stops.push(`overview-${i + 1}`);
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
    const stops = stopsRef.current;
    const a = stops[Math.min(fromIdx, toIdx)] || '';
    const b = stops[Math.max(fromIdx, toIdx)] || '';
    if (a.startsWith('overview')) return STEP_DURATION.in; // overview <-> zoom-1
    if (a.startsWith('zoom1') && b.startsWith('zoom2')) return STEP_DURATION.deepen; // zoom-1 <-> zoom-2
    if (b.startsWith('overview')) return STEP_DURATION.out; // last zoom-2 <-> final overview
    return STEP_DURATION.outIn; // zoom-2 of one universe <-> zoom-1 of the next (merged dézoom + re-zoom)
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
      {/* Organic blob shapes (asymmetric border-radius, not perfect circles)
          slowly drifting — reads as a soft curved backdrop rather than the
          flat gradient + circular glows it replaced. */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] bg-primary/15 blur-[120px] animate-[drift1_26s_ease-in-out_infinite]"
        style={{ borderRadius: '42% 58% 65% 35% / 45% 40% 60% 55%', willChange: 'opacity, transform', transform: 'translateZ(0)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-[36rem] h-[36rem] bg-secondary/20 blur-[120px] animate-[drift2_32s_ease-in-out_infinite]"
        style={{ borderRadius: '60% 40% 30% 70% / 55% 65% 35% 45%', transform: 'translateZ(0)' }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-primary/[0.04] blur-[80px]"
        style={{ borderRadius: '48% 52% 38% 62% / 52% 45% 55% 48%', transform: 'translate(-50%, -50%) translateZ(0)' }}
      />
      {/* Two large sweeping curves (SVG paths) that arc across the whole
          section, reinforcing the "curved canvas" feel the flat gradient
          alone couldn't give. */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.07]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path d="M -100 250 C 250 50, 650 550, 1100 300" stroke="#FF6A00" strokeWidth="2" fill="none" />
        <path d="M -100 800 C 300 950, 700 500, 1100 750" stroke="#2B6BFF" strokeWidth="2" fill="none" />
      </svg>

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
          index={i}
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
      className={`hidden sm:flex fixed z-40 right-3 sm:right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 transition-opacity duration-500 ${
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

function IconSteps({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <path d="M4 6h4M4 12h4M4 18h4" />
      <path d="M12 6h8M12 12h8M12 18h8" opacity="0.5" />
    </svg>
  );
}

function IconPeople({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 8.5a3 3 0 1 0 0-5.4" opacity="0.6" />
      <path d="M18 14.3c2.6.5 4.5 2.6 4.5 5.7" opacity="0.6" />
    </svg>
  );
}

function IconShield({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function StepsWidget({ steps, color, layout }) {
  if (layout === 'row') {
    return (
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex-1 flex sm:flex-col items-start gap-3 sm:gap-4">
            <span
              className="flex-none w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-ink-900"
              style={{ backgroundColor: color }}
            >
              {idx + 1}
            </span>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed normal-case pt-1 sm:pt-0">{step}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ol>
      {steps.map((step, idx) => (
        <li key={idx} className="flex gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <span
              className="flex-none w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-ink-900"
              style={{ backgroundColor: color }}
            >
              {idx + 1}
            </span>
            {idx < steps.length - 1 && <span className="w-px flex-1 min-h-[1.25rem] my-1 bg-white/15" />}
          </div>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed normal-case pb-4">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function TagsWidget({ tags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="text-xs sm:text-sm text-white/90 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.04] normal-case"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function Panel({ children, className = '' }) {
  return <div className={`rounded-3xl bg-white/[0.06] border border-white/10 p-5 sm:p-7 backdrop-blur-sm ${className}`}>{children}</div>;
}

function PanelHeading({ icon, color, children }) {
  return (
    <h4 className="flex items-center gap-2 text-white font-heading text-sm sm:text-base tracking-wide uppercase mb-5">
      {icon({ color })}
      {children}
    </h4>
  );
}

function ImmersiveOverlay({ univ, overlayRef, index }) {
  const color = RING_COLORS[index % RING_COLORS.length];
  const steps = univ.nested.how.text.split('→').map((s) => s.trim()).filter(Boolean);
  const tags = univ.nested.who.text.split(',').map((s) => s.trim()).filter(Boolean);
  const trust = univ.nested.trust;
  // Cycles through three genuinely different compositions (not just a
  // column/row swap) so the six detail screens read as a designed set
  // instead of the same rigid 3-box template repeated with a shuffle.
  const variant = index % 3;

  const stepsPanel = (
    <Panel className={variant === 0 ? 'lg:col-span-3' : variant === 2 ? 'lg:col-start-2 lg:col-span-8' : ''}>
      <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
      <StepsWidget steps={steps} color={color} layout={variant === 1 ? 'row' : 'column'} />
    </Panel>
  );

  const tagsPanel = (
    <Panel className={variant === 2 ? 'lg:col-start-1 lg:col-span-5 lg:mt-10' : ''}>
      <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
      <TagsWidget tags={tags} />
    </Panel>
  );

  const trustPanel = (
    <div
      className={`rounded-3xl p-5 sm:p-7 border backdrop-blur-sm ${variant === 2 ? 'lg:col-start-6 lg:col-span-5 lg:-mt-6' : ''}`}
      style={{ background: `${color}14`, borderColor: `${color}40` }}
    >
      <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
      <p className="text-white/90 text-sm sm:text-base leading-relaxed normal-case">{trust.text}</p>
    </div>
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-30 overflow-y-auto"
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0">
        <img src={univ.image} alt="" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-black/80" />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 0%, ${color}22, transparent 60%)` }}
        />
      </div>

      <div className="relative min-h-full flex items-center justify-center px-4 py-14 sm:py-20">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8 sm:mb-12">
            <span
              className="inline-block text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-semibold mb-3 px-3 py-1 rounded-full border"
              style={{ color, borderColor: `${color}66` }}
            >
              Univers Moledi Events
            </span>
            <h3 className="font-heading text-white text-3xl sm:text-5xl normal-case drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {univ.label}
            </h3>
            <p className="mt-4 max-w-2xl mx-auto text-white/70 text-sm sm:text-base leading-relaxed normal-case">
              {univ.definition}
            </p>
          </div>

          {variant === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              {stepsPanel}
              <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
                {tagsPanel}
                {trustPanel}
              </div>
            </div>
          )}
          {variant === 1 && (
            <div className="flex flex-col gap-4 sm:gap-6">
              {stepsPanel}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {tagsPanel}
                {trustPanel}
              </div>
            </div>
          )}
          {variant === 2 && (
            // Diagonal, offset composition: the three panels sit on a wide
            // 12-col grid with staggered vertical offsets instead of stacked
            // rows, so the reading path zig-zags left→right→left.
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {stepsPanel}
              {tagsPanel}
              {trustPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ZUIHubStory;
