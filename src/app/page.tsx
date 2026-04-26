import dynamic from "next/dynamic";
import Navbar from "./components/NavBar";
import Hero from "./components/Hero";

const Features = dynamic(() => import("./components/Features"), {
  loading: () => <SectionPlaceholder title="Loading features..." />,
});
const AiDemoChat = dynamic(() => import("./components/AiDemoChat"), {
  loading: () => <SectionPlaceholder title="Loading AI demo..." />,
});
const FakeDashboard = dynamic(() => import("./components/FakeDashboard"), {
  loading: () => <SectionPlaceholder title="Loading dashboard..." />,
});
const Testimonials = dynamic(() => import("./components/Testimonials"), {
  loading: () => <SectionPlaceholder title="Loading reviews..." />,
});
const Footer = dynamic(() => import("./components/Footer"));

function SectionPlaceholder({ title }: { title: string }) {
  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-5xl animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
      </div>
    </section>
  );
}

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
