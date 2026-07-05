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
// Only the ease curve varies — no rotation, no independent image scale-up,
// no title bump. Those extra transforms on the blocks themselves read as
// unwanted "movement" layered on top of the camera's own zoom, per
// feedback that it looked messy — the camera move alone (in position and
// scale) is the entire effect now.
const FLIGHT_STYLES = [
  { inEase: 'power2.out', deepenEase: 'power2.in', ringEase: 'back.out(1.4)' },
  { inEase: 'power1.inOut', deepenEase: 'power1.inOut', ringEase: 'elastic.out(1,0.65)' },
  { inEase: 'back.out(1.05)', deepenEase: 'power3.in', ringEase: 'back.out(2)' },
  { inEase: 'sine.inOut', deepenEase: 'sine.in', ringEase: 'power1.out' },
  { inEase: 'power4.out', deepenEase: 'power4.in', ringEase: 'back.out(1.8)' },
  { inEase: 'circ.out', deepenEase: 'circ.in', ringEase: 'elastic.out(1,0.5)' },
];

function ZUIHubStory() {
  const wrapperRef = useRef(null);
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
  const pendingDirRef = useRef(0);
  const accumRef = useRef(0);
  const lastGestureTimeRef = useRef(0);
  const anchorYRef = useRef(0);
  const bufferRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const programmaticScrollRef = useRef(false);
  const didInitialSnapRef = useRef(false);
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
        flyTo(p.x, p.y, ZOOM_1, T.in, style.inEase, t0);
        tl.to(ring, { opacity: 1, scale: 1, duration: T.in * 0.6, ease: style.ringEase }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.in * 0.45, ease: 'power2.out' }, `>-${T.in * 0.25}`);
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
        flyTo(p.x, p.y, ZOOM_2, T.deepen, style.deepenEase);
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
        tl.to(desc, { opacity: 1, y: 0, duration: T.surface * 0.5 }, `>-${T.surface * 0.35}`);
        if (title) {
          tl.to(title, { opacity: 1, duration: T.surface * 0.5 }, '<');
        }
        tl.to(ring, { opacity: 1, scale: 1, duration: T.surface * 0.4 }, `>-${T.surface * 0.35}`);

        t0 = tl.duration();
        tl.to(ring, { opacity: 0, scale: 0.92, duration: T.out * 0.4, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, duration: T.out * 0.35 }, '<');
        flyTo(0, 0, OVERVIEW, T.out, 'power3.inOut');
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

  // A scroll intent that arrives while a transition is still playing isn't
  // dropped — it's banked in pendingDirRef and fired the instant the current
  // clip finishes, like a queued video. That's what makes "scroll again
  // while it's mid-flight" actually count instead of silently doing
  // nothing (which read as "I have to scroll it so many times").
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
        const dir = pendingDirRef.current;
        if (dir) {
          pendingDirRef.current = 0;
          goToStep(currentStepRef.current + dir);
        }
      },
    });
  };

  // Keep the anchor (the document scrollY at which the sticky section sits
  // pinned at top:0) and the buffer size (how much extra scroll room the
  // wrapper gives us) up to date. Recomputed on mount and on resize, since
  // layout above this section can shift either value.
  useEffect(() => {
    const measure = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      anchorYRef.current = rect.top + window.scrollY;
      bufferRef.current = Math.max(window.innerHeight, 600);

      // If the page loads (or reloads) already scrolled into the middle of
      // this section's buffer zone — e.g. a mobile browser restoring the
      // previous scroll position — our internal step state (always starts
      // at step 0 / overview) would be out of sync with where the page
      // actually is. Snap back to the entry point once so the two always
      // agree; this is what previously let the story get permanently stuck
      // "used up" after a reload.
      if (!didInitialSnapRef.current) {
        didInitialSnapRef.current = true;
        const y = window.scrollY;
        if (y > anchorYRef.current - 4 && y < anchorYRef.current + bufferRef.current) {
          window.scrollTo(0, anchorYRef.current);
        }
      }
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('load', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, []);

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

  // The whole step engine, driven off the document's actual scroll position
  // instead of separate wheel/touch listeners. Rationale for the rewrite:
  //
  // - `wheel` and `touchmove` can be preventDefault()'d while the finger/
  //   wheel is actively moving, but a mobile browser's post-release
  //   momentum scroll fires NO further touch events at all — there's
  //   nothing to preventDefault, so a fast flick could sail straight past
  //   the whole section before any JS ran. `scroll` events, in contrast,
  //   keep firing throughout native momentum, so this is the only event
  //   that can reliably catch a fast fling on mobile.
  // - Because the section is `sticky` inside a wrapper taller than the
  //   viewport (see the JSX below), it renders pinned at top:0 for *any*
  //   scrollY between the anchor and anchor+buffer — so nudging scrollY
  //   back to the anchor every captured event is 100% invisible (nothing
  //   moves on screen) while guaranteeing the buffer never gets consumed
  //   by legitimate story progress, only reserved for absorbing whatever a
  //   single scroll/fling event's overshoot is.
  // - A scroll intent that lands while a clip is still playing is banked
  //   (see goToStep's onComplete) instead of silently discarded, so
  //   "scrolling again mid-animation" always counts.
  useEffect(() => {
    const THRESHOLD = 60;
    const GESTURE_TIMEOUT = 400;

    const onScroll = () => {
      if (programmaticScrollRef.current) {
        programmaticScrollRef.current = false;
        lastScrollYRef.current = window.scrollY;
        return;
      }
      const stops = stopsRef.current;
      if (!stops.length) return;

      const scrollY = window.scrollY;
      const anchor = anchorYRef.current;
      const delta = scrollY - lastScrollYRef.current;
      lastScrollYRef.current = scrollY;
      if (!delta) return;

      const atStart = currentStepRef.current === 0;
      const atEnd = currentStepRef.current === stops.length - 1;
      // Release to native scroll: at the very first stop, still above the
      // section (haven't arrived yet, or scrolling back up past it); at the
      // very last stop, already below it (finished, or scrolling on past).
      // No magnitude check here on purpose — a scroll/fling of *any* size
      // that lands past the anchor while at the first/last stop must still
      // be captured and corrected below, otherwise a big enough single jump
      // (exactly what mobile momentum can produce) would skip the section
      // outright instead of being reeled back in.
      if (atStart && scrollY < anchor) return;
      if (atEnd && scrollY > anchor) return;

      // Captured: hold the page at the anchor (invisible, thanks to
      // sticky) and turn the raw scroll delta into step-advance intent.
      programmaticScrollRef.current = true;
      window.scrollTo(0, anchor);
      lastScrollYRef.current = anchor;

      const now = performance.now();
      if (now - lastGestureTimeRef.current > GESTURE_TIMEOUT || Math.sign(accumRef.current) === -Math.sign(delta)) {
        accumRef.current = 0;
      }
      lastGestureTimeRef.current = now;
      accumRef.current += delta;

      if (Math.abs(accumRef.current) >= THRESHOLD) {
        const dir = accumRef.current > 0 ? 1 : -1;
        accumRef.current = 0;
        if (isAnimatingRef.current) {
          pendingDirRef.current = dir;
        } else {
          goToStep(currentStepRef.current + dir);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToLabel = (label) => {
    const idx = stopsRef.current.indexOf(label);
    if (idx !== -1) goToStep(idx);
  };

  return (
    // Outer buffer: the section itself is `sticky`, pinned inside a wrapper
    // taller than the viewport. Without this, the section was a normal
    // in-flow 100svh block whose "am I at the top of the viewport" check
    // only held true for a single pixel of scroll — any regular wheel
    // notch (~100px+) jumped straight past that pixel in one event, so the
    // step-jacking logic never engaged and the whole story was skipped
    // entirely on a normal scroll. Sticky + a generous buffer keeps the
    // section pinned at top:0 across a wide scroll range, so entry is
    // caught reliably no matter how large a single scroll/swipe delta is.
    <div ref={wrapperRef} className="relative" style={{ height: 'calc(100svh + 100vh)' }}>
      <section
        ref={rootRef}
        data-navbar-theme="dark"
        className="sticky top-0 bg-ink-900 h-[100svh] overflow-hidden"
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
    </div>
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

// Each universe gets its own genuinely different way of presenting the
// same three pieces of data (steps / who / trust) — not a shared template
// reshuffled, but a distinct visual metaphor picked to fit that universe:
// a timeline for a vote's stages, a ticket stub for an event, a radial
// dial for a donation goal, a progress bar for crowdfunding milestones, a
// matchmaking split for sponsoring, and a scattered ticket grid for a raffle.
const DETAIL_LAYOUTS = [TimelineDetail, TicketDetail, RadialDetail, ProgressDetail, SplitDetail, RaffleDetail];

function ImmersiveOverlay({ univ, overlayRef, index }) {
  const color = RING_COLORS[index % RING_COLORS.length];
  const steps = univ.nested.how.text.split('→').map((s) => s.trim()).filter(Boolean);
  const tags = univ.nested.who.text.split(',').map((s) => s.trim()).filter(Boolean);
  const trust = univ.nested.trust;
  const Layout = DETAIL_LAYOUTS[index % DETAIL_LAYOUTS.length];

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

          <Layout steps={steps} tags={tags} trust={trust} color={color} />
        </div>
      </div>
    </div>
  );
}

// Votes & Scrutins — a connected vertical timeline: fits a scrutiny's
// sequential, procedural feel (create → vote → certify).
function TimelineDetail({ steps, tags, trust, color }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
      <Panel className="lg:col-span-3">
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <StepsWidget steps={steps} color={color} layout="column" />
      </Panel>
      <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <div className="rounded-3xl p-5 sm:p-7 border backdrop-blur-sm" style={{ background: `${color}14`, borderColor: `${color}40` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Billetterie & Événementiel — a horizontal boarding-pass / ticket stub:
// steps run left-to-right like stages printed on a ticket, with a
// perforated dashed divider before the "stub" (who/trust) half.
function TicketDetail({ steps, tags, trust, color }) {
  return (
    <div className="rounded-[28px] bg-white/[0.06] border border-white/10 backdrop-blur-sm overflow-hidden">
      <div className="p-6 sm:p-8">
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-6 sm:gap-0">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 flex sm:flex-col items-center gap-3 sm:gap-4 relative">
              <span
                className="flex-none w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-ink-900"
                style={{ backgroundColor: color }}
              >
                {idx + 1}
              </span>
              <p className="text-white/85 text-sm leading-snug normal-case text-left sm:text-center">{step}</p>
              {idx < steps.length - 1 && (
                <span
                  className="hidden sm:block absolute top-5 left-[calc(50%+28px)] right-[calc(-50%+28px)] border-t-2 border-dashed"
                  style={{ borderColor: `${color}55` }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="relative border-t-2 border-dashed border-white/15 mx-6 sm:mx-10">
        <span className="absolute -left-[38px] -top-3 w-6 h-6 rounded-full bg-ink-900" />
        <span className="absolute -right-[38px] -top-3 w-6 h-6 rounded-full bg-ink-900" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-6 sm:p-8">
        <div>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </div>
        <div className="rounded-2xl p-5 border" style={{ background: `${color}14`, borderColor: `${color}40` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-white/90 text-sm leading-relaxed normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Système de Dons & Cagnottes — a radial dial: the trust statement sits at
// the center like a goal, with the steps orbiting it as satellites, echoing
// a fundraising meter rather than a plain list.
function RadialDetail({ steps, tags, trust, color }) {
  return (
    <div className="flex flex-col items-center gap-8 sm:gap-12">
      <div className="relative w-full max-w-md aspect-square mx-auto hidden sm:flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
          <circle cx="100" cy="100" r="88" fill="none" stroke={`${color}33`} strokeWidth="2" />
          <circle cx="100" cy="100" r="88" fill="none" stroke={color} strokeWidth="3" strokeDasharray="180 400" strokeLinecap="round" />
        </svg>
        <div
          className="relative z-10 w-[58%] aspect-square rounded-full flex flex-col items-center justify-center text-center px-6"
          style={{ background: `${color}14`, border: `1px solid ${color}40` }}
        >
          {IconShield({ color })}
          <p className="mt-2 text-white/90 text-xs leading-relaxed normal-case">{trust.text}</p>
        </div>
        {steps.map((step, idx) => {
          const angle = (360 / steps.length) * idx - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 46 * Math.cos(rad);
          const y = 50 + 46 * Math.sin(rad);
          return (
            <div
              key={idx}
              className="absolute w-[34%] rounded-2xl p-3 text-center bg-white/[0.07] border border-white/15 backdrop-blur-sm"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span
                className="inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold text-ink-900 mb-1.5"
                style={{ backgroundColor: color }}
              >
                {idx + 1}
              </span>
              <p className="text-white/85 text-xs leading-snug normal-case">{step}</p>
            </div>
          );
        })}
      </div>
      {/* Mobile: the orbit doesn't fit comfortably, so the same content
          becomes a simple stacked read instead of a cramped circle. */}
      <div className="sm:hidden w-full flex flex-col gap-4">
        <div className="rounded-3xl p-5 border backdrop-blur-sm text-center" style={{ background: `${color}14`, borderColor: `${color}40` }}>
          {IconShield({ color })}
          <p className="mt-2 text-white/90 text-sm leading-relaxed normal-case">{trust.text}</p>
        </div>
        <StepsWidget steps={steps} color={color} layout="column" />
      </div>
      <Panel className="w-full">
        <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
        <TagsWidget tags={tags} />
      </Panel>
    </div>
  );
}

// Crowdfunding — a thick horizontal progress bar with the steps as labeled
// milestones along it, echoing a funding goal filling up.
function ProgressDetail({ steps, tags, trust, color }) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Panel>
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <div className="pt-1 pb-2">
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '72%', background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
          </div>
          <div className="flex justify-between mt-5 gap-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center text-center">
                <span className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: color }} />
                <p className="text-white/85 text-xs sm:text-sm leading-snug normal-case">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <div className="rounded-3xl p-5 sm:p-7 border backdrop-blur-sm" style={{ background: `${color}14`, borderColor: `${color}40` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Sponsoring — a split-screen "matchmaking" layout: organizer's steps on
// one side, the brand-facing value prop (who/trust) tinted on the other.
function SplitDetail({ steps, tags, trust, color }) {
  return (
    <div className="rounded-[28px] bg-white/[0.06] border border-white/10 backdrop-blur-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 sm:p-8 lg:border-r border-white/10 border-b lg:border-b-0">
          <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
          <StepsWidget steps={steps} color={color} layout="column" />
        </div>
        <div className="p-6 sm:p-8 flex flex-col gap-6 sm:gap-8" style={{ background: `${color}0d` }}>
          <div>
            <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
            <TagsWidget tags={tags} />
          </div>
          <div className="rounded-2xl p-5 border" style={{ background: `${color}14`, borderColor: `${color}40` }}>
            <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
            <p className="text-white/90 text-sm leading-relaxed normal-case">{trust.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Jeux-Concours & Tombolas — a scattered grid of raffle-ticket cards
// (dashed borders, slight alternating tilt) instead of a tidy list.
function RaffleDetail({ steps, tags, trust, color }) {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <div>
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <div className="flex flex-wrap gap-5 sm:gap-6 justify-center">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative w-full sm:w-56 rounded-2xl bg-white/[0.06] border-2 border-dashed p-4 sm:p-5"
              style={{ borderColor: `${color}55`, transform: `rotate(${(idx % 2 === 0 ? -1 : 1) * (2 + idx)}deg)` }}
            >
              <span
                className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-ink-900"
                style={{ backgroundColor: color }}
              >
                {idx + 1}
              </span>
              <p className="text-white/85 text-sm leading-snug normal-case">{step}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-3xl p-5 sm:p-7 border-2" style={{ background: `${color}14`, borderColor: color }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed normal-case">{trust.text}</p>
        </div>
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
      </div>
    </div>
  );
}

export default ZUIHubStory;
