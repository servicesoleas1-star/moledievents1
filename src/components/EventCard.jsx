const badgeStyles = {
  Épinglé: 'bg-secondary text-white',
  Premium: 'bg-ink-900 text-white',
  'En Live': 'bg-red-500 text-white animate-pulse',
  Nouveau: 'bg-primary text-white',
  Urgent: 'bg-red-600 text-white',
};

function EventMeta({ event }) {
  switch (event.type) {
    case 'scrutin':
      return (
        <p className="text-sm text-ink-700">
          {event.votes} · Tête de liste : <span className="font-semibold">{event.topCandidate}</span>
        </p>
      );
    case 'don':
    case 'crowdfunding':
      return (
        <div>
          <div className="w-full bg-ink-100 rounded-full h-2 mb-1.5">
            <div
              className="bg-gradient-orange h-2 rounded-full"
              style={{ width: `${event.percentage}%` }}
            />
          </div>
          <p className="text-sm text-ink-700">
            {event.raised} sur {event.goal} ({event.percentage}%)
          </p>
        </div>
      );
    case 'concours':
      return (
        <p className="text-sm text-ink-700">
          🏆 {event.prize} · {event.drawDate}
        </p>
      );
    default:
      return (
        <p className="text-sm text-ink-700">
          📅 {event.date} · 📍 {event.location}
          <br />
          {event.price}
        </p>
      );
  }
}

function EventCard({ event }) {
  return (
    <a
      href={`/evenements/${event.id}`}
      className="group block bg-white rounded-2xl border border-ink-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {event.badge && (
          <span
            className={`absolute top-3 left-3 text-xs font-semibold uppercase rounded-full px-3 py-1 ${
              badgeStyles[event.badge] || 'bg-primary text-white'
            }`}
          >
            {event.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 text-xs font-semibold bg-white/90 text-ink-900 rounded-full px-3 py-1">
          {event.status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg text-ink-900 normal-case mb-2">{event.title}</h3>
        <EventMeta event={event} />
      </div>
    </a>
  );
}

export default EventCard;
