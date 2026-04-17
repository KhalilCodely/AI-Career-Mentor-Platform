// src/components/landing/HowItWorks.tsx
export default function HowItWorks() {
  const steps = [
    "Sign up and set your goals",
    "Get AI-generated career roadmap",
    "Learn and track progress",
    "Apply to matched jobs",
  ];

  return (
    <section className="py-24 text-center bg-black text-white">
      <h2 className="text-4xl font-bold mb-12">How It Works</h2>

      <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="p-4">
            <div className="text-blue-500 text-2xl font-bold mb-2">
              {i + 1}
            </div>
            <p className="text-gray-300">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}