import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { universes } from '../../data/universes';

/**
 * Univers Moledi Events — présentation en 6 panneaux.
 *
 * Choix d'architecture (après plusieurs itérations d'un système de caméra
 * virtuelle à base de transform CSS synthétique, qui s'est révélé fragile,
 * lent et instable sur mobile) : chaque univers est maintenant une section
 * normale, empilée dans le flux du document. L'animation d'apparition
 * (fade + léger slide + zoom d'image en Ken Burns) utilise `whileInView`,
 * exactement la même technique déjà utilisée avec succès ailleurs sur le
 * site (Comment ça marche, Témoignages) — donc nativement responsive,
 * rapide (pas de scroll-jacking), et impossible à faire "se toucher" ou
 * se chevaucher puisqu'il n'y a plus de positionnement absolu par
 * trigonométrie.
 *
 * Une bande "vue d'ensemble" (IndexStrip) s'intercale avant le premier
 * univers, entre chaque univers, et après le dernier — l'utilisateur
 * revoit systématiquement les 6 catégories et sa position dans le parcours.
 */

function ZUIHubStory() {
  return (
    <section aria-label="Les 6 univers de Moledi Events" className="relative bg-white">
      <IndexStrip
        eyebrow="Ce que vous pouvez créer"
        title="Un univers, six façons de faire vivre vos événements"
      />

      {universes.map((univ, i) => (
        <Fragment key={univ.id}>
          <UniversePanel univ={univ} index={i} />
          <IndexStrip
            compact
            activeId={univ.id}
            eyebrow={`Univers ${i + 1} sur ${universes.length}`}
            title={i === universes.length - 1 ? 'Vous avez fait le tour' : 'Retour à la vue d’ensemble'}
          />
        </Fragment>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  IndexStrip — the "back to overview" moment between each universe   */
/* ------------------------------------------------------------------ */

function IndexStrip({ eyebrow, title, activeId, compact }) {
  return (
    <div className={`bg-secondary-50 ${compact ? 'py-10 sm:py-12' : 'py-16 sm:py-20'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.5 }}
          className="text-secondary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className={`${compact ? 'text-lg sm:text-2xl' : 'text-2xl sm:text-4xl'} text-ink-900 mb-8`}
        >
          {title}
        </motion.h2>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {universes.map((u, i) => (
            <motion.span
              key={u.id}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                u.id === activeId
                  ? 'bg-primary text-white shadow-[0_10px_24px_-6px_rgba(255,106,0,0.5)]'
                  : 'bg-white text-ink-700 border border-ink-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${u.id === activeId ? 'bg-white' : 'bg-secondary'}`}
              />
              {u.label}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  UniversePanel — one universe, full content, always visible/fits    */
/* ------------------------------------------------------------------ */

function UniversePanel({ univ, index }) {
  const reversed = index % 2 === 1;

  return (
    <div className="relative bg-ink-900 overflow-hidden">
      {/* Ambient brand glow, alternating side */}
      <div
        className={`pointer-events-none absolute top-1/4 w-96 h-96 rounded-full blur-3xl ${
          reversed ? '-right-32 bg-secondary/25' : '-left-32 bg-primary/25'
        }`}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center ${
            reversed ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Image — Ken Burns reveal */}
          <motion.div
            initial={{ opacity: 0, scale: 1.08, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] lg:aspect-square"
          >
            <img src={univ.image} alt={univ.label} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 text-white text-xs font-semibold">
              {String(index + 1).padStart(2, '0')} / {String(universes.length).padStart(2, '0')}
            </span>
          </motion.div>

          {/* Title + definition + nested cards */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.5 }}
              className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-3"
            >
              Univers {index + 1}
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-white text-3xl sm:text-4xl normal-case mb-4 leading-tight"
            >
              {univ.label}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white/75 text-base sm:text-lg normal-case mb-8"
            >
              {univ.definition}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[univ.nested.how, univ.nested.who, univ.nested.trust].map((c, ci) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.5, delay: 0.15 + ci * 0.1 }}
                  className="rounded-2xl bg-white/5 border border-white/10 p-4"
                >
                  <p className="text-primary text-[10px] tracking-[0.2em] uppercase font-semibold mb-1.5">
                    {c.title}
                  </p>
                  <p className="text-white/70 text-xs sm:text-[13px] leading-snug normal-case">
                    {c.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ZUIHubStory;
