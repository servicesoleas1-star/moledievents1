import { motion } from 'framer-motion';
import { illustration } from '../../config/media';

const steps = [
  {
    n: '01',
    key: 'create',
    title: 'Créez votre événement',
    text: "Choisissez un type — billetterie, vote, cagnotte, crowdfunding ou concours — et lancez votre page en quelques minutes.",
  },
  {
    n: '02',
    key: 'configure',
    title: 'Configurez tout',
    text: 'Tarifs, billets, options de vote, paliers, dates, personnalisation de la page : vous gardez le contrôle sur chaque détail.',
  },
  {
    n: '03',
    key: 'share',
    title: 'Partagez largement',
    text: 'Un lien unique, un QR code, et le partage WhatsApp / réseaux sociaux intégré pour mobiliser votre communauté.',
  },
  {
    n: '04',
    key: 'cashout',
    title: 'Encaissez en toute confiance',
    text: 'Paiements Mobile Money confirmés en temps réel, suivi transparent et reversements fiables sur votre compte.',
  },
];

function Step({ step, index }) {
  const reversed = index % 2 === 1;
  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
      {/* Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`relative ${reversed ? 'md:order-2' : ''}`}
      >
        <div className="relative aspect-square rounded-3xl overflow-hidden border border-ink-200 shadow-xl">
          <img src={illustration[step.key]} alt={step.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
          <span className="absolute top-4 left-4 font-heading text-white text-5xl sm:text-6xl drop-shadow-lg">{step.n}</span>
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={reversed ? 'md:order-1' : ''}
      >
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
          Étape {step.n}
        </span>
        <h3 className="text-2xl sm:text-4xl text-ink-900 mb-4">{step.title}</h3>
        <p className="text-ink-700 text-base sm:text-lg normal-case max-w-md">{step.text}</p>
      </motion.div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="bg-ink-100 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold tracking-[0.15em] uppercase text-xs mb-2">Comment ça marche</p>
          <h2 className="text-3xl sm:text-5xl text-ink-900">Quatre étapes, zéro friction</h2>
          <p className="text-ink-700 normal-case mt-4 max-w-xl mx-auto">
            De l'idée à l'encaissement, Moledi vous accompagne à chaque étape —
            pour les dons, la billetterie, le crowdfunding, le sponsoring et plus.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-24">
          {steps.map((s, i) => (
            <Step key={s.n} step={s} index={i} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <a href="/inscription" className="inline-block bg-gradient-orange text-white font-semibold rounded-full px-8 py-3.5 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
            Créer mon premier événement
          </a>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
