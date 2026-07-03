import { useEffect, useState } from 'react';

const CONSENT_KEY = 'moledi_cookie_consent';

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (value) => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-ink-900 text-white/90 px-4 py-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
        <p className="text-sm normal-case text-center sm:text-left">
          Nous utilisons des cookies pour améliorer votre expérience et
          analyser le trafic. Consultez notre{' '}
          <a href="/confidentialite" className="underline hover:text-primary">
            politique de confidentialité
          </a>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => handleChoice('rejected')}
            className="text-sm font-semibold border border-white/30 rounded-full px-5 py-2 hover:bg-white/10 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            className="text-sm font-semibold bg-gradient-orange rounded-full px-5 py-2 hover:opacity-90 transition-opacity"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
