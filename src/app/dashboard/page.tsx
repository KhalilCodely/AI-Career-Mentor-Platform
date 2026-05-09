import Link from "next/link";
import {
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  CloudSun,
  FileText,
  Map,
  Milestone,
  Sparkles,
  Star,
  User,
} from "lucide-react";

const cards = [
  {
    title: "Career Paths",
    description: "Pick a direction from curated tech careers and turn it into a bright first quest.",
    href: "/dashboard/career-paths",
    icon: Milestone,
    accent: "bg-[#ffcf70] text-[#6b3b00]",
    border: "border-[#f6b84f]",
  },
  {
    title: "AI Roadmap",
    description: "Generate a step-by-step trail with weekly goals, checkpoints, and skill badges.",
    href: "/dashboard/roadmap",
    icon: Map,
    accent: "bg-[#9bd7ff] text-[#0f4b6e]",
    border: "border-[#73bee9]",
  },
  {
    title: "AI Chat Mentor",
    description: "Ask your friendly mentor for guidance that remembers your learning context.",
    href: "/dashboard/ai-chat",
    icon: Bot,
    accent: "bg-[#d7c5ff] text-[#4d2c82]",
    border: "border-[#b99df0]",
  },
  {
    title: "Courses",
    description: "Track lessons like cozy side quests and keep momentum visible at a glance.",
    href: "/dashboard/courses",
    icon: BookOpen,
    accent: "bg-[#bdecc7] text-[#1e6240]",
    border: "border-[#8bd39c]",
  },
  {
    title: "Resume Checker",
    description: "Polish your resume with clear feedback before sending it into the world.",
    href: "/dashboard/resume-checker",
    icon: FileText,
    accent: "bg-[#ffd1dc] text-[#8a3550]",
    border: "border-[#f4a9bb]",
  },
  {
    title: "Skills",
    description: "Update your powers so every recommendation stays personal and useful.",
    href: "/dashboard/skills",
    icon: Brain,
    accent: "bg-[#c8f5ee] text-[#1d6960]",
    border: "border-[#8bdcd1]",
  },
  {
    title: "Profile",
    description: "Set your story, experience, and target role before the next roadmap chapter.",
    href: "/dashboard/profile",
    icon: User,
    accent: "bg-[#ffc69f] text-[#7a3c18]",
    border: "border-[#efa876]",
  },
];

const journeySteps = ["Choose a career path", "Grow three focus skills", "Check your resume"];

export default function Dashboard() {
  return (
    <div className="space-y-6 text-[#2d2a24]">
      <section className="relative overflow-hidden rounded-[2rem] border-4 border-[#2d2a24] bg-[#f9e7b7] p-5 shadow-[10px_10px_0_#2d2a24] md:p-8">
        <div className="absolute left-8 top-8 h-16 w-24 rounded-full bg-white/80 shadow-[54px_12px_0_-10px_rgba(255,255,255,0.72),108px_-3px_0_-18px_rgba(255,255,255,0.7)]" />
        <div className="absolute -right-10 top-8 h-32 w-32 rounded-full border-4 border-[#2d2a24] bg-[#ffd86b] shadow-[0_0_0_12px_rgba(255,216,107,0.25)]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(135deg,#91d99b_25%,transparent_25%),linear-gradient(225deg,#91d99b_25%,transparent_25%)] bg-[length:64px_64px] bg-bottom opacity-70" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-[#2d2a24] bg-white/85 px-4 py-2 text-sm font-extrabold text-[#6b4a00] shadow-[4px_4px_0_#2d2a24]">
              <Sparkles size={16} /> Cozy Career Mentor workspace
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-[#2d2a24] md:text-6xl">
              Build your career like a cheerful adventure map.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#5b5142] md:text-lg">
              A softer, cartoon-inspired dashboard that brings your paths, roadmap, mentor, courses, and resume tools into one optimized command center.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/roadmap"
                className="rounded-full border-[3px] border-[#2d2a24] bg-[#ff8f70] px-5 py-3 text-sm font-black text-white shadow-[5px_5px_0_#2d2a24] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#2d2a24]"
              >
                Start roadmap →
              </Link>
              <Link
                href="/dashboard/ai-chat"
                className="rounded-full border-[3px] border-[#2d2a24] bg-white px-5 py-3 text-sm font-black text-[#2d2a24] shadow-[5px_5px_0_#2d2a24] transition hover:-translate-y-0.5 hover:bg-[#fff8df] hover:shadow-[7px_7px_0_#2d2a24]"
              >
                Ask mentor
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm rounded-[2rem] border-4 border-[#2d2a24] bg-[#fff8df] p-4 shadow-[8px_8px_0_#2d2a24]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7d6d52]">Today&apos;s quest</p>
                <h2 className="text-xl font-black text-[#2d2a24]">Mentor village</h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#2d2a24] bg-[#9bd7ff] shadow-[4px_4px_0_#2d2a24]">
                <CloudSun className="h-7 w-7 text-[#21506a]" />
              </div>
            </div>
            <div className="grid gap-3">
              {journeySteps.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border-2 border-[#2d2a24]/80 bg-white px-3 py-3 shadow-[3px_3px_0_rgba(45,42,36,0.75)]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#2d2a24] bg-[#bdecc7] text-xs font-black">
                    {index + 1}
                  </span>
                  <span className="text-sm font-black text-[#3f382e]">{item}</span>
                  <CheckCircle2 className="ml-auto h-5 w-5 text-[#4c9b60]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border-[3px] border-[#2d2a24] bg-white p-5 shadow-[6px_6px_0_#2d2a24] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7d6d52]">Quick launch</p>
              <h2 className="text-2xl font-black text-[#2d2a24]">Your toolkit</h2>
            </div>
            <Star className="h-7 w-7 fill-[#ffd86b] text-[#2d2a24]" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`group rounded-[1.5rem] border-[3px] ${card.border} bg-[#fffdf7] p-4 shadow-[4px_4px_0_rgba(45,42,36,0.85)] transition hover:-translate-y-1 hover:border-[#2d2a24] hover:shadow-[7px_7px_0_#2d2a24]`}
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#2d2a24] ${card.accent} shadow-[3px_3px_0_#2d2a24] transition group-hover:rotate-[-3deg]`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-black text-[#2d2a24]">{card.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#665d50]">{card.description}</p>
                  <span className="mt-4 inline-flex text-sm font-black text-[#2f6d9b]">Open {card.title} →</span>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[1.75rem] border-[3px] border-[#2d2a24] bg-[#dff5ff] p-5 shadow-[6px_6px_0_#2d2a24]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#4d7588]">Optimized flow</p>
          <h2 className="mt-1 text-2xl font-black text-[#2d2a24]">Focus board</h2>
          <div className="mt-5 space-y-4">
            {[
              ["01", "Pick one target role"],
              ["02", "Practice one core skill"],
              ["03", "Ship one portfolio proof"],
            ].map(([number, label]) => (
              <div key={number} className="rounded-2xl border-2 border-[#2d2a24] bg-white p-4 shadow-[4px_4px_0_rgba(45,42,36,0.8)]">
                <span className="text-xs font-black text-[#2f6d9b]">Chapter {number}</span>
                <p className="mt-1 font-black text-[#2d2a24]">{label}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
