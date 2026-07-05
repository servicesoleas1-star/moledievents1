import { flag } from '../../config/media';
import { countryConfigs, currencies, paymentMethodMeta } from '../../data/countryConfig';

/**
 * Coverage strip — driven by the aggregator module's CountryConfig records
 * (UML DC-08: country_code, country_name, currency, methods_available).
 * Each card shows the country flag, its name, its currency as a coloured
 * "logo" badge (symbol + code), and the payment methods available there.
 * The payment operator wordmarks scroll below.
 */

// Real payment-method wordmarks — official brand colours + typography,
// rendered as styled chips (no network image needed).
const operatorMarks = [
  { name: 'Orange Money', bg: '#FF7900', fg: '#000000' },
  { name: 'Wave',          bg: '#1DC4FF', fg: '#001B44' },
  { name: 'MTN MoMo',      bg: '#FFCB05', fg: '#00256B' },
  { name: 'Moov Money',    bg: '#F58220', fg: '#FFFFFF' },
  { name: 'Free Money',    bg: '#E2001A', fg: '#FFFFFF' },
  { name: 'Airtel Money',  bg: '#ED1C24', fg: '#FFFFFF' },
  { name: 'Wizall',        bg: '#0072BC', fg: '#FFFFFF' },
  { name: 'Visa',          bg: '#1A1F71', fg: '#F7B600' },
  { name: 'Mastercard',    bg: '#111111', fg: '#FF5F00' },
  { name: 'PayPal',        bg: '#003087', fg: '#009CDE' },
];

// Currency "logo" — a coloured coin-like badge carrying the symbol.
function CurrencyBadge({ code, size = 'md' }) {
  const cur = currencies[code];
  if (!cur) return null;
  const gradient =
    cur.tone === 'blue'
      ? 'linear-gradient(135deg, #2B6BFF, #6FA9FF)'
      : 'linear-gradient(135deg, #FF6A00, #FFB347)';
  return (
    <span className="inline-flex items-center gap-1.5" title={cur.name}>
      <span
        className={`inline-flex items-center justify-center rounded-full text-white font-bold shadow-sm ${
          size === 'md' ? 'w-7 h-7 text-[9px]' : 'w-5 h-5 text-[8px]'
        }`}
        style={{ background: gradient }}
      >
        {cur.symbol}
      </span>
      <span className="text-[10px] font-semibold text-ink-700">{code}</span>
    </span>
  );
}

function CountryCard({ c }) {
  return (
    <div className="shrink-0 flex flex-col items-center gap-2 rounded-2xl bg-white border border-ink-200 px-3.5 py-3.5 w-32 sm:w-36 shadow-[0_10px_28px_-18px_rgba(11,19,36,0.35)]">
      <img
        src={flag(c.country_code.toLowerCase(), 80)}
        alt={c.country_name}
        width="72"
        height="52"
        className="w-16 h-11 sm:w-20 sm:h-14 object-cover rounded-md shadow-sm"
        loading="lazy"
      />
      <span className="text-[11px] sm:text-xs font-semibold text-ink-900 text-center leading-tight">
        {c.country_name}
      </span>
      <CurrencyBadge code={c.currency} />
      <div className="flex gap-1">
        {c.methods_available.map((m) => (
          <span
            key={m}
            title={paymentMethodMeta[m].label}
            className={`inline-flex items-center justify-center w-6 h-5 rounded text-[8px] font-bold ${
              m === 'MOBILE_MONEY'
                ? 'bg-primary/10 text-primary'
                : m === 'CARD'
                ? 'bg-secondary/10 text-secondary'
                : 'bg-ink-100 text-ink-700'
            }`}
          >
            {paymentMethodMeta[m].short}
          </span>
        ))}
      </div>
    </div>
  );
}

function MethodChip({ m }) {
  return (
    <div
      className="shrink-0 flex items-center rounded-2xl px-6 py-3 font-heading text-sm sm:text-base normal-case tracking-wide shadow-md"
      style={{ backgroundColor: m.bg, color: m.fg }}
    >
      {m.name}
    </div>
  );
}

function Coverage() {
  const active = countryConfigs.filter((c) => c.active);

  return (
    <section id="couverture" className="relative bg-gradient-to-b from-white via-ink-100/70 to-white py-20 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
          Couverture géographique
        </p>
        <h2 className="text-3xl sm:text-5xl text-ink-900">Toute l'Afrique francophone</h2>
        <p className="text-ink-700 normal-case mt-4 max-w-xl mx-auto">
          Des paiements locaux, dans la devise de vos participants, via les
          opérateurs qu'ils utilisent déjà au quotidien.
        </p>
      </div>

      {/* Countries marquee — flag + name + currency badge + methods */}
      <div className="relative mb-6">
        <div className="flex gap-3 w-max animate-marquee">
          {[...active, ...active].map((c, i) => (
            <CountryCard key={`c-${i}`} c={c} />
          ))}
        </div>
      </div>

      {/* Payment operators marquee — brand wordmark chips */}
      <div className="relative">
        <div className="flex gap-3 w-max animate-marquee-slow">
          {[...operatorMarks, ...operatorMarks].map((m, i) => (
            <MethodChip key={`m-${i}`} m={m} />
          ))}
        </div>
      </div>

      {/* Currency legend — every currency covered, with its "logo" badge */}
      <div className="max-w-4xl mx-auto px-4 mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {Object.keys(currencies).map((code) => (
          <CurrencyBadge key={code} code={code} size="sm" />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />
    </section>
  );
}

export default Coverage;
