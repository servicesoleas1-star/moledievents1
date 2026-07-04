import { LanguageProvider } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ZUIHubStory from './components/sections/ZUIHubStory';
import PortalTransition from './components/sections/PortalTransition';
import FeaturedMarquee from './components/sections/FeaturedMarquee';
import HowTimeline from './components/sections/HowTimeline';
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
          <ZUIHubStory />
          <PortalTransition />
          <FeaturedMarquee />
          <HowTimeline />
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
