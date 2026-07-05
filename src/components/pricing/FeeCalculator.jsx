import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { campaignTypes, getCommissionRate } from '../../data/commissionConfig';
import { countryConfigs } from '../../data/countryConfig';
import { paymentMethodMeta } from '../../data/paymentMethods';
import CountryTile from './CountryTile';

const activeCountries = countryConfigs.filter((c) => c.active);

const formatAmount = (n) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n));

/**
 * Interactive simulator — reads its rate straight from `commissionConfig.js`
 * (the CommissionConfig table stand-in) and its country/currency/methods
 * straight from `countryConfig.js` (the CountryConfig table stand-in). If
 * either "table" were empty, the relevant control would render nothing —
 * there is no fallback number invented client-side.
 */
function FeeCalculator() {
  const [amount, setAmount] = useState('10000');
  const [campaignType, setCampaignType] = useState(campaignTypes[0].key);
  const [countryCode, setCountryCode] = useState(activeCountries[0]?.country_code || '');

  const country = activeCountries.find((c) => c.country_code === countryCode);
  const rate = getCommissionRate(campaignType);

  const { gross, commission, net } = useMemo(() => {
    const g = Number(amount) || 0;
    const c = rate != null ? (g * rate) / 100 : 0;
    return { gross: g, commission: c, net: g - c };
  }, [amount, rate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white rounded-3xl border border-ink-200 shadow-[0_30px_70px_-30px_rgba(11,19,36,0.25)] p-6 sm:p-10"
    >
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Inputs */}
        <div>
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
            Simulateur
          </p>
          <h3 className="text-2xl sm:text-3xl text-ink-900 mb-6">Calculez vos frais</h3>

          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700 mb-2">
            Montant de la transaction
          </label>
          <div className="relative mb-6">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-14 rounded-xl border border-ink-200 pl-5 pr-16 text-lg font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              placeholder="10000"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-700">
              {country?.currency || ''}
            </span>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700 mb-2">
            Type d'événement
          </label>
          <div className="flex flex-wrap gap-2 mb-6">
            {campaignTypes.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setCampaignType(t.key)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  campaignType === t.key
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-ink-700 border-ink-200 hover:border-ink-900/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700 mb-2">
            Pays
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
            {activeCountries.map((c) => (
              <CountryTile
                key={c.country_code}
                code={c.country_code}
                name={c.country_name}
                selected={countryCode === c.country_code}
                onClick={() => setCountryCode(c.country_code)}
              />
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="rounded-2xl bg-ink-100/70 border border-ink-200 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between py-3 border-b border-ink-200">
              <span className="text-sm text-ink-700">Montant brut</span>
              <span className="font-semibold text-ink-900">
                {formatAmount(gross)} {country?.currency}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-ink-200">
              <span className="text-sm text-ink-700">
                Commission Moledi {rate != null ? `(${rate}%)` : ''}
              </span>
              <span className="font-semibold text-primary-600">
                − {formatAmount(commission)} {country?.currency}
              </span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-sm font-semibold text-ink-900">Net organisateur</span>
              <span className="text-2xl font-heading normal-case text-ink-900">
                {formatAmount(net)} {country?.currency}
              </span>
            </div>
          </div>

          {country && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-ink-700 mb-2">
                Moyens de paiement disponibles en {country.country_name}
              </p>
              <div className="flex flex-wrap gap-2">
                {country.methods_available.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 rounded-lg bg-white border border-ink-200 text-xs font-semibold text-ink-900"
                  >
                    {paymentMethodMeta[m]?.label || m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default FeeCalculator;
