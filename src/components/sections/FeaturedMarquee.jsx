import { featuredCards } from '../../data/catalog';

/**
 * Featured events — auto-scrolling marquee. Cards follow the charter's
 * "Carte événement" component: photo card, category badge top-left, title
 * over a bottom gradient, "date • ville" meta line, and the orange round
 * arrow button in the bottom-right corner.
 *
 * Data comes from src/data/catalog.js, whose records are shaped exactly on
 * the UML tables (Event/EventVenue/TicketType, Poll, Fundraiser, CFProject,
 * Lottery) — production swaps that module for Supabase queries.
 */

function FeaturedMarquee() {
  const cards = featuredCards();
  if (!cards.length) return null;

  // Duplicate the list so the CSS marquee can loop seamlessly.
  const loop = [...cards, ...cards];

  return (
    <section className="relative bg-gradient-to-b from-white via-ink-100/50 to-white py-14 sm:py-20 overflow-hidden">
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
          {loop.map((c, i) => (
            <Card key={`${c.key}-${i}`} c={c} />
          ))}
          <EndCard />
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

// Charter "Carte événement": full-photo card, badge, gradient, meta, arrow.
function Card({ c }) {
  return (
    <a
      href={c.href}
      className="group relative shrink-0 w-[280px] sm:w-[320px] h-[380px] rounded-3xl overflow-hidden shadow-[0_20px_45px_-18px_rgba(11,19,36,0.4)] hover:shadow-[0_26px_55px_-18px_rgba(11,19,36,0.55)] transition-shadow"
    >
      <img
        src={c.image}
        alt={c.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-ink-900/5" />

      {/* Category badge */}
      <span
        className={`absolute top-4 left-4 text-[10px] font-semibold uppercase tracking-wide rounded-full px-3 py-1.5 text-white shadow-md ${
          c.tone === 'blue' ? 'bg-secondary' : 'bg-gradient-to-r from-primary to-primary-300'
        }`}
      >
        {c.badge}
      </span>
      {c.live && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase rounded-full px-2.5 py-1.5 bg-white/90 text-ink-900">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Live
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-heading text-white text-xl normal-case leading-tight mb-1.5 pr-12">
          {c.title}
        </h3>
        <p className="text-white/80 text-xs mb-2">{c.meta}</p>

        {c.progress != null ? (
          <div className="pr-12">
            <div className="w-full bg-white/20 rounded-full h-1.5 mb-1.5">
              <div
                className={`h-1.5 rounded-full ${c.tone === 'blue' ? 'bg-secondary-100' : 'bg-gradient-to-r from-primary to-primary-300'}`}
                style={{ width: `${Math.min(c.progress, 100)}%` }}
              />
            </div>
            <p className="text-white/90 text-xs font-semibold">{c.stat} · {c.progress}%</p>
          </div>
        ) : (
          <p className="text-white/90 text-xs font-semibold">{c.stat}</p>
        )}

        {/* Orange round arrow — charter's card action */}
        <span className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-300 flex items-center justify-center shadow-lg shadow-primary/40 group-hover:scale-110 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </a>
  );
}

function EndCard() {
  return (
    <a
      href="/evenements"
      className="shrink-0 w-[280px] sm:w-[320px] h-[380px] rounded-3xl overflow-hidden text-white p-6 flex flex-col justify-between bg-gradient-to-br from-secondary to-secondary-400 shadow-[0_20px_45px_-18px_rgba(43,107,255,0.5)] hover:shadow-[0_26px_55px_-18px_rgba(43,107,255,0.65)] transition-shadow"
    >
      <div>
        <p className="text-white/80 text-[10px] tracking-[0.3em] uppercase mb-2 font-semibold">
          Bien plus encore
        </p>
        <h3 className="font-heading text-2xl normal-case leading-tight mb-2">
          Découvrez tous les événements
        </h3>
        <p className="text-white/75 text-sm normal-case">
          L'annuaire complet de Moledi Event vous attend.
        </p>
      </div>
      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-300 rounded-full px-5 py-2.5 self-start font-semibold text-sm shadow-lg shadow-primary/40">
        Explorer
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </a>
  );
}

export default FeaturedMarquee;
