import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';
import Tarifs from './pages/Tarifs';
import Confidentialite from './pages/Confidentialite';
import Connexion from './pages/Connexion';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/connexion" element={<Connexion />} />
        </Routes>
        <CookieBanner />
      </div>
    </LanguageProvider>
  );
}

export default App;
