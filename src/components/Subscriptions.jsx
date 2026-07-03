function Subscriptions() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <span className="text-primary font-semibold text-sm uppercase tracking-wide">
        Abonnements
      </span>
      <h2 className="text-3xl sm:text-4xl text-ink-900 mt-1 mb-4">
        Des offres pour tous les organisateurs
      </h2>
      <p className="text-ink-700 max-w-2xl mx-auto normal-case mb-8">
        Nos formules d'abonnement arrivent bientôt : commissions réduites,
        outils avancés de promotion et statistiques détaillées pour les
        organisateurs réguliers.
      </p>
      <a
        href="/tarifs"
        className="inline-block bg-gradient-blue text-white font-semibold rounded-full px-8 py-3.5 hover:opacity-90 transition-opacity"
      >
        Découvrir les tarifs
      </a>
    </section>
  );
}

export default Subscriptions;
