import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { featuredEvents } from '../../data/mockEvents';

gsap.registerPlugin(ScrollTrigger);

/**
 * Panning ZUI (video 1 approach) — Featured events.
 *
 * Vertical scroll drives a HORIZONTAL pan across a wide canvas of event cards.
 * The camera slows down and briefly zooms in as each card centers in the
 * viewport, creating the "flying over a plane" effect from video 1.
 *
 * At the end, a big "Voir tous les événements" CTA slides in.
 */

const CARD_W = 380;
const GAP = 60;

const badgeStyles = {
  Épinglé: 'bg-secondary text-white',
  Premium: 'bg-ink-900 text-white',
  'En Live': 'bg-red-500 text-white animate-pulse',
  Nouveau: 'bg-primary text-white',
  Urgent: 'bg-red-600 text-white',
};

function EventMeta({ e }) {
  switch (e.type) {
    case 'scrutin':
      return <p className="text-sm text-ink-700">{e.votes} · En tête : <span className="font-semibold">{e.topCandidate}</span></p>;
    case 'don':
    case 'crowdfunding':
      return (
        <div>
          <div className="w-full bg-ink-100 rounded-full h-1.5 mb-1.5">
            <div className="bg-gradient-orange h-1.5 rounded-full" style={{ width: `${e.percentage}%` }} />
          </div>
          <p className="text-sm text-ink-700">{e.raised} · {e.percentage}%</p>
        </div>
      );
    case 'concours':
      return <p className="text-sm text-ink-700">🏆 {e.prize} · {e.drawDate}</p>;
    default:
      return <p className="text-sm text-ink-700">📅 {e.date} · 📍 {e.location}</p>;
  }
}

function PanningFeatured() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      // Total horizontal distance = (n cards - 1) * (card width + gap)
      const distance = (featuredEvents.length - 1) * (CARD_W + GAP);

      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-white"
      style={{ height: `${featuredEvents.length * 80}vh` }}
      aria-label="Événements en vedette"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        <div className="pt-24 px-6 sm:px-10 max-w-7xl mx-auto w-full">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-1">À la une</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl sm:text-5xl text-ink-900">Événements en vedette</h2>
            <a
              href="/evenements"
              className="hidden sm:inline-flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all"
            >
              Voir tous les événements
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Camera viewport — horizontal track pans left as user scrolls */}
        <div className="flex-1 relative flex items-center overflow-hidden">
          <div
            ref={trackRef}
            className="flex items-center gap-[60px] pl-[calc(50vw-190px)] pr-16 will-change-transform"
          >
            {featuredEvents.map((e) => (
              <PanCard key={e.id} e={e} width={CARD_W} />
            ))}
            {/* End card */}
            <a
              href="/evenements"
              className="shrink-0 rounded-3xl bg-ink-900 text-white p-8 flex flex-col justify-between shadow-2xl"
              style={{ width: CARD_W, height: 460 }}
            >
              <div>
                <p className="text-primary text-xs tracking-[0.3em] uppercase mb-3">Bien plus encore</p>
                <h3 className="font-heading text-3xl normal-case mb-4">
                  Découvrez tous les événements
                </h3>
                <p className="text-white/70 normal-case">
                  Scrutins, billetteries, cagnottes, crowdfunding, concours — l'annuaire complet vous attend.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 bg-gradient-orange rounded-full px-5 py-2.5 self-start font-semibold shadow-lg shadow-primary/25">
                Explorer
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Scroll rail hint */}
        <div className="pb-8 pt-4 px-6 sm:px-10 max-w-7xl mx-auto w-full flex items-center gap-3 text-ink-700">
          <span className="text-xs tracking-[0.25em] uppercase">Défilez</span>
          <div className="flex-1 h-px bg-ink-200 relative">
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-orange" />
          </div>
          <span className="text-xs tracking-[0.25em] uppercase text-ink-700/60">Explorez</span>
        </div>
      </div>
    </section>
  );
}

function PanCard({ e, width }) {
  return (
    <a
      href={`/evenements/${e.id}`}
      className="group shrink-0 block rounded-3xl overflow-hidden border border-ink-200 bg-white shadow-[0_30px_80px_-25px_rgba(11,19,36,0.25)] hover:shadow-[0_40px_100px_-25px_rgba(255,106,0,0.35)] transition-shadow"
      style={{ width }}
    >
      <div className="relative h-64 overflow-hidden">
        <img src={e.image} alt={e.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {e.badge && (
          <span className={`absolute top-4 left-4 text-[11px] font-semibold uppercase rounded-full px-3 py-1 ${badgeStyles[e.badge] || 'bg-primary text-white'}`}>
            {e.badge}
          </span>
        )}
        <span className="absolute top-4 right-4 text-[11px] font-semibold bg-white/90 text-ink-900 rounded-full px-3 py-1">
          {e.status}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-heading text-xl text-ink-900 normal-case mb-2">{e.title}</h3>
        <EventMeta e={e} />
      </div>
    </a>
  );
}

export default PanningFeatured;
