import { useEffect, useState } from 'react';

/**
 * Featured events — auto-scrolling marquee (right → left), 5 events + a
 * closing CTA card. In production the fetch below hits the Supabase Events
 * table (ordered pinned → premium → live → most recent, limit 5) — same
 * ranking as the Featured Events section in the functional spec.
 *
 * For now we use the mock array for local development; swap `fetchFeatured`
 * to a real Supabase call when the DB is wired up.
 */

import { featuredEvents as mock } from '../../data/mockEvents';

const badgeStyles = {
  Épinglé: 'bg-secondary text-white',
  Premium: 'bg-ink-900 text-white',
  'En Live': 'bg-red-500 text-white',
  Nouveau: 'bg-primary text-white',
  Urgent: 'bg-red-600 text-white',
};

// Same interface as the eventual Supabase call:
//   supabase.from('event').select('...').order(...).limit(5)
async function fetchFeatured() {
  // return supabase.from('event').select().order(...).limit(5);
  return mock.slice(0, 5);
}

function Meta({ e }) {
  switch (e.type) {
    case 'scrutin':
      return <p className="text-sm text-ink-700">{e.votes}</p>;
    case 'don':
    case 'crowdfunding':
      return (
        <div>
          <div className="w-full bg-ink-100 rounded-full h-1.5 mb-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${e.percentage}%` }} />
          </div>
          <p className="text-xs text-ink-700">{e.raised} · {e.percentage}%</p>
        </div>
      );
    case 'concours':
      return <p className="text-sm text-ink-700">{e.drawDate}</p>;
    default:
      return <p className="text-sm text-ink-700">{e.date} · {e.location}</p>;
  }
}

function FeaturedMarquee() {
  const [events, setEvents] = useState([]);
  useEffect(() => { fetchFeatured().then(setEvents); }, []);

  if (!events.length) return null;

  // Duplicate the list so the CSS marquee can loop seamlessly.
  const loop = [...events, ...events];

  return (
    <section className="relative bg-white py-14 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex items-end justify-between">
        <div>
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-1">
            En ce moment
          </p>
          <h2 className="text-3xl sm:text-4xl text-ink-900">Événements en vedette</h2>
        </div>
        <a href="/evenements" className="hidden sm:inline-flex items-center gap-2 text-secondary font-semibold text-sm hover:gap-3 transition-all">
          Tous les événements
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      {/* Marquee track */}
      <div className="relative">
        <div className="flex gap-5 animate-marquee-featured w-max px-4">
          {loop.map((e, i) => (
            <Card key={`${e.id}-${i}`} e={e} />
          ))}
          <EndCard />
          {/* mirror end card so the loop always shows one */}
          <EndCard />
        </div>

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
      </div>

      <div className="mt-6 text-center sm:hidden">
        <a href="/evenements" className="inline-flex items-center gap-2 text-secondary font-semibold text-sm">
          Tous les événements
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}

function Card({ e }) {
  return (
    <a
      href={`/evenements/${e.id}`}
      className="group shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl border border-ink-200 overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={e.image}
          alt={e.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {e.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-semibold uppercase rounded-full px-2.5 py-1 ${badgeStyles[e.badge] || 'bg-primary text-white'} ${e.badge === 'En Live' ? 'animate-pulse' : ''}`}>
            {e.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-base text-ink-900 normal-case mb-1.5 line-clamp-1">
          {e.title}
        </h3>
        <Meta e={e} />
      </div>
    </a>
  );
}

function EndCard() {
  return (
    <a
      href="/evenements"
      className="shrink-0 w-[280px] sm:w-[320px] bg-ink-900 rounded-2xl overflow-hidden text-white p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow"
    >
      <div>
        <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-2 font-semibold">
          Bien plus encore
        </p>
        <h3 className="font-heading text-xl normal-case leading-tight mb-2">
          Découvrez tous les événements
        </h3>
        <p className="text-white/70 text-sm normal-case">
          L'annuaire complet vous attend.
        </p>
      </div>
      <span className="inline-flex items-center gap-2 bg-primary rounded-full px-4 py-2 mt-4 self-start font-semibold text-sm shadow-lg shadow-primary/40">
        Explorer
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </a>
  );
}

export default FeaturedMarquee;
