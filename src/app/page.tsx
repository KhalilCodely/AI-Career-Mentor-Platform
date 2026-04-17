
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/NavBar';
import CTA from './components/landing/CTA';
import HowItWorks from './components/landing/HowItWorks';
import Reviews from './components/landing/Reviews';
import AIDemo from './components/landing/AIDemo';
import CareerPaths from './components/landing/CareerPath';
import SkillsProgress from './components/landing/SkillProgress';


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <CareerPaths />
      <SkillsProgress />
      <Features />
      <AIDemo/>
      <Reviews />
      <HowItWorks />
      
      <CTA />
      <Footer />
    </>
  );
}