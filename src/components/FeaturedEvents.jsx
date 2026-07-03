import { featuredEvents } from '../data/mockEvents';
import EventCard from './EventCard';

function FeaturedEvents() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-primary font-semibold text-sm uppercase tracking-wide">
            À la une
          </span>
          <h2 className="text-3xl sm:text-4xl text-ink-900 mt-1">Événements en vedette</h2>
        </div>
        <a
          href="/evenements"
          className="hidden sm:inline-block text-secondary font-semibold hover:underline"
        >
          Voir tous les événements →
        </a>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <div className="mt-10 text-center sm:hidden">
        <a href="/evenements" className="text-secondary font-semibold hover:underline">
          Voir tous les événements →
        </a>
      </div>
    </section>
  );
}

export default FeaturedEvents;
