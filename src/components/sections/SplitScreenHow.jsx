import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { illustration } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

/**
 * Split-Screen ZUI (video 2 approach) — "Comment ça marche".
 *
 * Layout: fixed presenter/context on the LEFT (40%), zoomable canvas on the
 * RIGHT (60%) with overflow:hidden. Scroll pans + zooms the right canvas
 * through 4 step-cards. The left panel stays put and the caption updates in
 * sync with the camera focus.
 */

const STEPS = [
  {
    n: '01',
    title: 'Créez',
    tag: 'Choisissez votre type',
    text: 'Billetterie, vote, cagnotte, crowdfunding ou concours — votre page est prête en quelques minutes.',
    img: illustration.create,
    // canvas coordinates
    x: 0,   y: 0,
  },
  {
    n: '02',
    title: 'Configurez',
    tag: 'Réglez le moindre détail',
    text: 'Tarifs, billets, options de vote, paliers, dates, personnalisation : vous gardez le contrôle.',
    img: illustration.configure,
    x: 780, y: 0,
  },
  {
    n: '03',
    title: 'Partagez',
    tag: 'Un lien, un QR, une communauté',
    text: 'Lien unique, QR code, partage WhatsApp et réseaux sociaux — la diffusion est native.',
    img: illustration.share,
    x: 1560, y: 0,
  },
  {
    n: '04',
    title: 'Encaissez',
    tag: 'Mobile Money, temps réel',
    text: 'Chaque paiement confirmé en temps réel, reçu automatique, reversements fiables.',
    img: illustration.cashout,
    x: 2340, y: 0,
  },
];

const CARD_W = 520;
const OVERVIEW = 0.28; // wide view — see all four cards
const FOCUS = 0.85;    // zoom onto a single card

function SplitScreenHow() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const activeRef = useRef(0); // index of active step
  const stepLabelsRef = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      // Center canvas horizontally on the RIGHT viewport (60% of window).
      gsap.set(canvas, {
        x: 0, y: 0, scale: OVERVIEW, transformOrigin: '50% 50%',
      });

      const st = {
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      };

      // Drive active-step highlight from scroll progress directly.
      // This works reliably in both scroll directions (unlike timeline.call()
      // which fires inconsistently when scrubbing backward).
      ScrollTrigger.create({
        ...st,
        onUpdate: ({ progress }) => {
          // Steps occupy [0.1, 0.9] of the timeline (0.4 head + 1.2 tail).
          const p = Math.max(0, Math.min(1, (progress - 0.08) / 0.82));
          const idx = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
          setActiveStep(idx);
        },
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: st,
      });

      // Camera helper — same math as ZUIHubStory (translate by -dx*S, -dy*S).
      const flyTo = (dx, dy, S, dur = 1) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S, scale: S, duration: dur });
      const hold = (t = 0.6) => tl.to({}, { duration: t });
// Start with a brief overview so viewer sees all 4 cards
      hold(0.4);

      STEPS.forEach((s, i) => {
        // Fly directly from previous focus to this step's focus, staying at
        // FOCUS scale — feels like a smooth lateral camera pan, no re-zooming.
        flyTo(s.x, s.y, FOCUS, i === 0 ? 1.3 : 1.1);
        hold(1.0);
      });

      // Final wide reveal — pull back to see the whole journey
      flyTo((STEPS[0].x + STEPS.at(-1).x) / 2, 0, OVERVIEW, 1.2);
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const setActiveStep = (i) => {
    activeRef.current = i;
    stepLabelsRef.current.forEach((el, k) => {
      if (!el) return;
      el.classList.toggle('text-white', k === i);
      el.classList.toggle('text-white/40', k !== i);
      el.style.transform = k === i ? 'translateX(8px)' : 'translateX(0)';
    });
  };

  return (
    <section
      ref={rootRef}
      className="relative bg-white"
      style={{ height: '500vh' }}
      aria-label="Comment ça marche"
    >
      <div className="sticky top-0 h-screen flex overflow-hidden">
        {/* LEFT panel — fixed context (presenter/menu) */}
        <aside className="hidden md:flex md:w-2/5 flex-col justify-center px-10 lg:px-16 bg-ink-900 text-white relative overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-primary text-xs tracking-[0.3em] uppercase mb-3">Comment ça marche</p>
            <h2 className="text-4xl lg:text-5xl leading-[1.05] mb-8">
              Quatre étapes,<br /><span className="text-transparent bg-clip-text bg-gradient-orange">zéro friction</span>
            </h2>
            <p className="text-white/70 normal-case text-base mb-10 max-w-md">
              Défilez pour explorer chaque étape — de la création de votre événement à l'encaissement.
            </p>
            <ol className="space-y-4">
              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  ref={(el) => (stepLabelsRef.current[i] = el)}
                  className="flex items-center gap-4 text-white/40 transition-all duration-500 will-change-transform"
                >
                  <span className="font-heading text-2xl normal-case w-10">{s.n}</span>
                  <span className="font-heading text-xl normal-case">{s.title}</span>
                </li>
              ))}
            </ol>
            <a
              href="/inscription"
              className="inline-block mt-10 bg-gradient-orange text-white font-semibold rounded-full px-7 py-3 shadow-lg shadow-primary/25"
            >
              Créer mon événement
            </a>
          </div>
        </aside>

        {/* RIGHT panel — the camera viewport with the canvas of steps */}
        <div className="relative flex-1 bg-ink-100 overflow-hidden">
          {/* subtle grid backdrop */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(11,19,36,0.06) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={canvasRef}
              className="absolute left-1/2 top-1/2"
              style={{ willChange: 'transform' }}
            >
              {STEPS.map((s) => (
                <StepCard key={s.n} step={s} width={CARD_W} />
              ))}
            </div>
          </div>

          {/* Mobile version of the step ladder (visible when left panel is hidden) */}
          <div className="md:hidden absolute top-4 left-4 right-4 flex items-center gap-2 z-30">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="flex-1 h-1 rounded-full bg-white/40 overflow-hidden"
              >
                <div id={`mobstep-${i}`} className="h-full bg-primary origin-left scale-x-0 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, width }) {
  return (
    <div
      className="absolute"
      style={{
        left: 0, top: 0,
        transform: `translate(calc(-50% + ${step.x}px), calc(-50% + ${step.y}px))`,
        width,
      }}
    >
      <div className="rounded-3xl overflow-hidden border border-ink-200 bg-white shadow-[0_30px_80px_-20px_rgba(11,19,36,0.25)]">
        <div className="relative h-56">
          <img src={step.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 font-heading text-white text-6xl drop-shadow-lg">
            {step.n}
          </span>
        </div>
        <div className="p-6">
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-1">{step.tag}</p>
          <h3 className="font-heading text-ink-900 text-3xl normal-case mb-3">{step.title}</h3>
          <p className="text-ink-700 text-sm leading-relaxed normal-case">{step.text}</p>
        </div>
      </div>
    </div>
  );
}

export default SplitScreenHow;
