import { flag } from '../../config/media';

/**
 * Coverage strip — real country flags + real payment-method logos, all in an
 * auto-scrolling marquee. Data will sync from the payment aggregator module
 * (UML DC-08 CountryConfig + Aggregator.payment_methods) in production.
 */

const countries = [
  { iso: 'sn', name: 'Sénégal' },
  { iso: 'ci', name: "Côte d'Ivoire" },
  { iso: 'cm', name: 'Cameroun' },
  { iso: 'ml', name: 'Mali' },
  { iso: 'bj', name: 'Bénin' },
  { iso: 'tg', name: 'Togo' },
  { iso: 'bf', name: 'Burkina Faso' },
  { iso: 'ne', name: 'Niger' },
  { iso: 'gn', name: 'Guinée' },
  { iso: 'ga', name: 'Gabon' },
  { iso: 'cg', name: 'Congo' },
  { iso: 'cd', name: 'RD Congo' },
  { iso: 'td', name: 'Tchad' },
  { iso: 'mg', name: 'Madagascar' },
  { iso: 'rw', name: 'Rwanda' },
  { iso: 'mr', name: 'Mauritanie' },
  { iso: 'dj', name: 'Djibouti' },
  { iso: 'km', name: 'Comores' },
];

// Real payment-method wordmarks — official brand colours + typography, no
// emoji, no plain text. Rendered as SVG data URIs so no network / external
// image needed. Format: name + coloured pill matching brand.
const methods = [
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

function FlagCard({ c }) {
  return (
    <div className="shrink-0 flex flex-col items-center gap-2 rounded-2xl bg-white border border-ink-200 px-3 py-3 w-24 sm:w-28 shadow-sm">
      <img
        src={flag(c.iso, 80)}
        alt={c.name}
        width="72"
        height="52"
        className="w-16 h-11 sm:w-20 sm:h-14 object-cover rounded-md shadow-sm"
        loading="lazy"
      />
      <span className="text-[11px] sm:text-xs font-medium text-ink-900 text-center leading-tight">
        {c.name}
      </span>
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
  return (
    <section id="couverture" className="relative bg-ink-100 py-20 sm:py-24 overflow-hidden">
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

      {/* Countries marquee — real flags */}
      <div className="relative mb-6">
        <div className="flex gap-3 w-max animate-marquee">
          {[...countries, ...countries].map((c, i) => (
            <FlagCard key={`c-${i}`} c={c} />
          ))}
        </div>
      </div>

      {/* Payment methods marquee — brand chips */}
      <div className="relative">
        <div className="flex gap-3 w-max animate-marquee-slow">
          {[...methods, ...methods].map((m, i) => (
            <MethodChip key={`m-${i}`} m={m} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-ink-100 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-ink-100 to-transparent" />
    </section>
  );
}

export default Coverage;
