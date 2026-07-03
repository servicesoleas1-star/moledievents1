import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedEvents from './components/FeaturedEvents';
import Categories from './components/Categories';
import Testimonials from './components/Testimonials';
import PartnersAndCoverage from './components/PartnersAndCoverage';
import Subscriptions from './components/Subscriptions';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <FeaturedEvents />
        <Categories />
        <Testimonials />
        <PartnersAndCoverage />
        <Subscriptions />
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </div>
  );
}

export default App;
