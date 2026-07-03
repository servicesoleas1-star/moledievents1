function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-900 to-secondary-400/40" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
        <span className="inline-block bg-white/10 text-white text-xs font-semibold tracking-wider uppercase rounded-full px-4 py-1.5 mb-6 border border-white/20">
          Billetterie · Votes · Cagnottes · Crowdfunding · Concours
        </span>
        <h1 className="text-4xl sm:text-6xl text-white leading-tight max-w-4xl mx-auto">
          Créez et gérez vos événements en toute simplicité
        </h1>
        <p className="mt-6 text-lg text-ink-200/90 font-body max-w-2xl mx-auto normal-case">
          Moledi Events centralise billetterie, votes, cagnottes, crowdfunding et
          concours sur une seule plateforme, partout en Afrique de l'Ouest.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/inscription"
            className="w-full sm:w-auto bg-gradient-orange text-white font-semibold rounded-full px-8 py-3.5 shadow-lg hover:opacity-90 transition-opacity"
          >
            Créer mon événement
          </a>
          <a
            href="/evenements"
            className="w-full sm:w-auto bg-white/10 text-white font-semibold rounded-full px-8 py-3.5 border border-white/30 hover:bg-white/20 transition-colors"
          >
            Parcourir les événements
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
