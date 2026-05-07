import Link from "next/link";
import { BookOpen, Brain, FileText, Map, Milestone, Sparkles, User } from "lucide-react";

const cards = [
  {
    title: "Career Paths",
    description: "Browse 20 seeded career directions and save one as your starting roadmap.",
    href: "/dashboard/career-paths",
    icon: Milestone,
    tone: "from-indigo-500 to-blue-500",
  },
  {
    title: "AI Roadmap",
    description: "Generate a personalized plan from your profile, skills, courses, and progress.",
    href: "/dashboard/roadmap",
    icon: Map,
    tone: "from-blue-500 to-cyan-500",
  },
  {
    title: "Courses",
    description: "Track learning progress and prioritize courses aligned to your selected skills.",
    href: "/dashboard/courses",
    icon: BookOpen,
    tone: "from-emerald-500 to-teal-500",
  },

  {
    title: "Resume Checker",
    description: "Review your resume with AI feedback based on your profile, optional skills, and matching courses.",
    href: "/dashboard/resume-checker",
    icon: FileText,
    tone: "from-sky-500 to-blue-500",
  },
  {
    title: "Skills",
    description: "Keep your current skill levels updated so recommendations stay relevant.",
    href: "/dashboard/skills",
    icon: Brain,
    tone: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Profile",
    description: "Set your experience level and career goal before generating roadmap logic.",
    href: "/dashboard/profile",
    icon: User,
    tone: "from-orange-500 to-amber-500",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-xl md:p-8">
        <div className="relative">
          <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-blue-100">
              <Sparkles size={16} /> Career Mentor workspace
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Choose a path, build skills, and track progress.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
              Start with a seeded career path, then use AI roadmap generation, resume checking, and course progress tracking to turn your goal into a practical learning plan.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}>
                <Icon size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-950 transition group-hover:text-blue-700">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
              <span className="mt-5 inline-flex text-sm font-bold text-blue-700">Open {card.title} →</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
