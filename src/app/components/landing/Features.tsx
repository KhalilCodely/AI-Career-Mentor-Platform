// src/components/landing/Features.tsx
export default function Features() {
  const features = [
    { title: "AI Career Coach", desc: "Smart advice tailored to your goals" },
    { title: "Custom Roadmaps", desc: "Step-by-step learning plans" },
    { title: "Resume Analyzer", desc: "Improve your CV instantly" },
    { title: "Job Matching", desc: "Find jobs that fit your skills" },
    { title: "Interview Prep", desc: "Practice with AI questions" },
    { title: "Skill Tracking", desc: "Monitor your progress" },
  ];

  return (
    <section className="bg-gray-950 text-white py-24 px-8">
      <h2 className="text-4xl font-bold text-center mb-16">
        Everything You Need
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}