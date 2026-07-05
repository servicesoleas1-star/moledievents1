import { motion } from 'framer-motion';
import { africanCountries } from '../../data/africanCountries';
import { countryConfigs } from '../../data/countryConfig';
import CountryTile from './CountryTile';

/**
 * Full continent grid — every one of the 54 African countries is shown so
 * the roadmap is visible at a glance, but only the rows that actually exist
 * in `countryConfig.js` (the CountryConfig table stand-in) render as
 * "active". Everything else renders greyed out with a "Bientôt" tag —
 * exactly what happens if the real table has no row for that country yet.
 */
function CountryCoverage() {
  const activeCodes = new Set(countryConfigs.filter((c) => c.active).map((c) => c.country_code));

  return (
    <section id="couverture-pays" className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
            Couverture géographique
          </p>
          <h2 className="text-3xl sm:text-5xl text-ink-900 mb-4">Un continent, une plateforme</h2>
          <p className="text-ink-700 normal-case max-w-xl mx-auto">
            {activeCodes.size} pays sont d'ores et déjà actifs. Le déploiement se poursuit sur
            le reste du continent.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-2.5"
        >
          {africanCountries.map((c) => (
            <CountryTile key={c.code} code={c.code} name={c.name} active={activeCodes.has(c.code)} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default CountryCoverage;
