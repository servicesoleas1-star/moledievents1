import { useRef } from 'react';
import { motion } from 'framer-motion';
import { featuredEvents } from '../../data/mockEvents';

const badgeStyles = {
  Épinglé: 'bg-secondary text-white',
  Premium: 'bg-ink-900 text-white',
  'En Live': 'bg-red-500 text-white',
  Nouveau: 'bg-primary text-white',
  Urgent: 'bg-red-600 text-white',
};

function Meta({ e }) {
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

function FeaturedRow() {
  const scroller = useRef(null);
  const scrollBy = (dir) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary font-semibold tracking-[0.15em] uppercase text-xs mb-1">À la une</p>
            <h2 className="text-3xl sm:text-4xl text-ink-900">Événements en vedette</h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scrollBy(-1)} aria-label="Précédent" className="w-11 h-11 rounded-full border border-ink-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Suivant" className="w-11 h-11 rounded-full border border-ink-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide"
        >
          {featuredEvents.map((e, i) => (
            <motion.a
              key={e.id}
              href={`/evenements/${e.id}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group shrink-0 w-[300px] sm:w-[340px] snap-start bg-white rounded-2xl border border-ink-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-52 overflow-hidden">
                <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {e.badge && (
                  <span className={`absolute top-3 left-3 text-[11px] font-semibold uppercase rounded-full px-3 py-1 ${badgeStyles[e.badge] || 'bg-primary text-white'} ${e.badge === 'En Live' ? 'animate-pulse' : ''}`}>
                    {e.badge}
                  </span>
                )}
                <span className="absolute top-3 right-3 text-[11px] font-semibold bg-white/90 text-ink-900 rounded-full px-3 py-1">{e.status}</span>
              </div>
              <div className="p-4">
                <h3 className="font-heading text-lg text-ink-900 normal-case mb-2">{e.title}</h3>
                <Meta e={e} />
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="/evenements" className="inline-flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all">
            Voir tous les événements
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default FeaturedRow;
