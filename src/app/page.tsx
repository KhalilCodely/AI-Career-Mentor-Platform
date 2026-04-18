import Navbar from "./components/NavBar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import FakeDashboard from "./components/FakeDashboard";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import AiDemoChat from "./components/AiDemoChat";


export default function Home() {
  return (
    <main className="pt-20">
      <Navbar />
      <Hero />
      <Features />
      <AiDemoChat />
      <FakeDashboard />
      <Testimonials />
      <Footer />
    </main>
  );
}