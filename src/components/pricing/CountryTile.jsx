import { flag } from '../../config/media';

/**
 * A single country tile — real flag image on top (flagcdn, never an emoji),
 * country name underneath. Shared between the fee calculator's country
 * picker and the coverage grid so both read the exact same visual language.
 */
function CountryTile({ code, name, active = true, selected = false, onClick, disabled = false }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary-50 shadow-[0_8px_20px_-12px_rgba(255,106,0,0.5)]'
          : active
          ? 'border-ink-200 bg-white hover:border-primary/40 hover:-translate-y-0.5'
          : 'border-ink-200 bg-ink-100/60 opacity-60 cursor-not-allowed'
      }`}
    >
      <img
        src={flag(code.toLowerCase(), 80)}
        alt=""
        width="36"
        height="26"
        className={`w-9 h-6 object-cover rounded shadow-sm ${!active ? 'grayscale' : ''}`}
        loading="lazy"
      />
      <span className={`text-xs font-semibold text-center leading-tight ${active ? 'text-ink-900' : 'text-ink-700'}`}>
        {name}
      </span>
      {!active && (
        <span className="text-[9px] uppercase tracking-wide text-ink-700/70 font-semibold">Bientôt</span>
      )}
    </Tag>
  );
}

export default CountryTile;
