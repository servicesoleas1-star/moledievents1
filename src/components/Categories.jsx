import { eventTypes } from '../data/mockEvents';

function Categories() {
  return (
    <section className="bg-ink-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wide">
            Ce que vous pouvez créer
          </span>
          <h2 className="text-3xl sm:text-4xl text-ink-900 mt-1">Types d'événements</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {eventTypes.map((type) => (
            <a
              key={type.id}
              href={type.available ? `/evenements?type=${type.id}` : '#'}
              className={`relative bg-white rounded-2xl border border-ink-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all ${
                !type.available && 'opacity-60'
              }`}
            >
              {!type.available && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase bg-secondary text-white rounded-full px-2 py-0.5">
                  Bientôt
                </span>
              )}
              <div className="text-4xl mb-4">{type.icon}</div>
              <h3 className="font-heading text-lg text-ink-900 normal-case mb-2">{type.label}</h3>
              <p className="text-sm text-ink-700">{type.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
