import dynamic from "next/dynamic";
import NavBar from "./Landing Page/NavBar";
import Hero from "./Landing Page/Hero";

const Features = dynamic(() => import("./Landing Page/Features"), {
  loading: () => <SectionPlaceholder title="Loading features..." />,
});
const AiDemoChat = dynamic(() => import("./Landing Page/AiDemoChat"), {
  loading: () => <SectionPlaceholder title="Loading AI demo..." />,
});
const ProductShowcase = dynamic(() => import("./Landing Page/ProductShowcase"), {
  loading: () => <SectionPlaceholder title="Loading product tour..." />,
});
const FakeDashboard = dynamic(() => import("./Landing Page/FakeDashboard"), {
  loading: () => <SectionPlaceholder title="Loading dashboard..." />,
});
const JobWebsites = dynamic(() => import("./Landing Page/JobWebsites"), {
  loading: () => <SectionPlaceholder title="Loading job websites..." />,
});
const Pricing = dynamic(() => import("./Landing Page/Pricing"), {
  loading: () => <SectionPlaceholder title="Loading pricing..." />,
});
const Testimonials = dynamic(() => import("./Landing Page/Testimonials"), {
  loading: () => <SectionPlaceholder title="Loading reviews..." />,
});
const Footer = dynamic(() => import("./Landing Page/Footer"));

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
      <NavBar />
      <Hero />
      <Features />
      <ProductShowcase />
      <AiDemoChat />
      <FakeDashboard />
      <JobWebsites />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}
