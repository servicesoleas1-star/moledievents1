import { LanguageProvider } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollStory from './components/sections/ScrollStory';
import PortalTransition from './components/sections/PortalTransition';
import FeaturedRow from './components/sections/FeaturedRow';
import HowItWorks from './components/sections/HowItWorks';
import Testimonials from './components/sections/Testimonials';
import Coverage from './components/sections/Coverage';
import PricingTeaser from './components/sections/PricingTeaser';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Hero />
          <ScrollStory />
          <PortalTransition />
          <FeaturedRow />
          <HowItWorks />
          <Testimonials />
          <Coverage />
          <PricingTeaser />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </LanguageProvider>
  );
}

export default App;
