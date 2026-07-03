/**
 * Coverage. In production, countries + methods sync from the payment
 * aggregator module (UML DC-08: CountryConfig / Aggregator.payment_methods).
 * Local list for now.
 */
const countries = [
  { flag: '🇸🇳', name: 'Sénégal' },
  { flag: '🇨🇮', name: "Côte d'Ivoire" },
  { flag: '🇨🇲', name: 'Cameroun' },
  { flag: '🇲🇱', name: 'Mali' },
  { flag: '🇧🇯', name: 'Bénin' },
  { flag: '🇹🇬', name: 'Togo' },
  { flag: '🇧🇫', name: 'Burkina Faso' },
  { flag: '🇳🇪', name: 'Niger' },
  { flag: '🇬🇳', name: 'Guinée' },
  { flag: '🇬🇦', name: 'Gabon' },
  { flag: '🇨🇬', name: 'Congo' },
  { flag: '🇨🇩', name: 'RD Congo' },
  { flag: '🇹🇩', name: 'Tchad' },
  { flag: '🇲🇬', name: 'Madagascar' },
  { flag: '🇷🇼', name: 'Rwanda' },
  { flag: '🇲🇷', name: 'Mauritanie' },
];

// Branded payment chips (swap for real SVG logos later).
const methods = [
  { name: 'Orange Money', bg: '#FF7900', fg: '#000' },
  { name: 'Wave', bg: '#1DC4FF', fg: '#001B44' },
  { name: 'MTN MoMo', bg: '#FFCB05', fg: '#00256B' },
  { name: 'Moov Money', bg: '#F58220', fg: '#fff' },
  { name: 'Free Money', bg: '#E2001A', fg: '#fff' },
  { name: 'Airtel Money', bg: '#ED1C24', fg: '#fff' },
  { name: 'Visa', bg: '#1A1F71', fg: '#fff' },
  { name: 'Mastercard', bg: '#111', fg: '#FF5F00' },
];

function CountryChip({ c }) {
  return (
    <div className="shrink-0 flex items-center gap-2.5 rounded-full bg-white border border-ink-200 px-5 py-2.5 shadow-sm">
      <span className="text-xl leading-none">{c.flag}</span>
      <span className="text-sm font-medium text-ink-900 whitespace-nowrap">{c.name}</span>
    </div>
  );
}

function MethodChip({ m }) {
  return (
    <div
      className="shrink-0 flex items-center rounded-xl px-6 py-3 font-heading text-sm normal-case tracking-wide shadow-sm"
      style={{ backgroundColor: m.bg, color: m.fg }}
    >
      {m.name}
    </div>
  );
}

function Coverage() {
  return (
    <section id="couverture" className="relative bg-ink-100 py-20 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center mb-12">
        <p className="text-primary font-semibold tracking-[0.15em] uppercase text-xs mb-2">Couverture géographique</p>
        <h2 className="text-3xl sm:text-5xl text-ink-900">Toute l'Afrique francophone</h2>
        <p className="text-ink-700 normal-case mt-4 max-w-xl mx-auto">
          Des paiements locaux, dans la devise de vos participants, via les
          opérateurs qu'ils utilisent déjà au quotidien.
        </p>
      </div>

      {/* Countries — scroll right→left */}
      <div className="relative mb-6">
        <div className="flex gap-3 w-max animate-marquee">
          {[...countries, ...countries].map((c, i) => (
            <CountryChip key={`c-${i}`} c={c} />
          ))}
        </div>
      </div>

      {/* Payment methods — scroll right→left (slower) */}
      <div className="relative">
        <div className="flex gap-3 w-max animate-marquee-slow">
          {[...methods, ...methods].map((m, i) => (
            <MethodChip key={`m-${i}`} m={m} />
          ))}
        </div>
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-100 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-100 to-transparent" />
    </section>
  );
}

export default Coverage;
