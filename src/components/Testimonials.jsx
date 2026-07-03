import { testimonials } from '../data/mockEvents';

function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-12">
        <span className="text-primary font-semibold text-sm uppercase tracking-wide">
          Ils nous font confiance
        </span>
        <h2 className="text-3xl sm:text-4xl text-ink-900 mt-1">Témoignages</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <blockquote
            key={t.id}
            className="bg-white rounded-2xl border border-ink-200 p-6 flex flex-col justify-between"
          >
            <p className="text-ink-700 mb-6">&ldquo;{t.quote}&rdquo;</p>
            <footer>
              <p className="font-semibold text-ink-900">{t.name}</p>
              <p className="text-sm text-ink-700">{t.role}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
