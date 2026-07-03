import { partners, coverage } from '../data/mockEvents';

function PartnersAndCoverage() {
  return (
    <section id="couverture" className="bg-ink-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wide">
            Partenaires &amp; couverture
          </span>
          <h2 className="text-3xl sm:text-4xl text-white mt-1">
            Disponible dans toute la région
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mb-14">
          {partners.map((p) => (
            <span
              key={p.id}
              className="text-white/70 font-heading text-lg normal-case tracking-wide"
            >
              {p.name}
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-heading text-white normal-case text-lg mb-4">
              Pays couverts
            </h3>
            <div className="flex flex-wrap gap-2">
              {coverage.countries.map((c) => (
                <span
                  key={c}
                  className="text-sm text-white/80 bg-white/10 rounded-full px-3 py-1"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-heading text-white normal-case text-lg mb-4">
              Moyens de paiement
            </h3>
            <div className="flex flex-wrap gap-2">
              {coverage.paymentMethods.map((m) => (
                <span
                  key={m}
                  className="text-sm text-white/80 bg-white/10 rounded-full px-3 py-1"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PartnersAndCoverage;
