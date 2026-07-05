import { motion } from 'framer-motion';
import { africanCountries } from '../../data/africanCountries';
import { useCountries } from '../../hooks/useCountries';
import CountryTile from './CountryTile';

/**
 * Continent coverage strip — active countries come from `/api/countries`
 * (the CountryConfig table, admin-configured). If the table is empty, every
 * tile renders as "Bientôt" — nothing here is a hardcoded fallback list.
 * Horizontal scroll keeps the full continent glanceable without a tall grid.
 */
function CountryCoverage() {
  const { countries } = useCountries();
  const activeCodes = new Set(
    countries.filter((c) => c.active).map((c) => String(c.country_code).toUpperCase())
  );

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
          <h2 className="text-3xl sm:text-5xl text-ink-900 mb-4">Une plateforme, tout un continent</h2>
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
          className="flex gap-2.5 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide"
        >
          {africanCountries.map((c) => (
            <div key={c.code} className="shrink-0 w-24 snap-start">
              <CountryTile code={c.code} name={c.name} active={activeCodes.has(c.code)} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default CountryCoverage;
