import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  FileText,
  Map,
  Milestone,
  Sparkles,
  User,
} from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    title: "AI Chat Mentor",
    description: "Ask a mentor that uses your profile, skills, courses, progress, and chat history for tailored advice.",
    href: "/dashboard/ai-chat",
    icon: Bot,
    tone: "from-fuchsia-500 to-indigo-500",
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

const statusItems = ["Roadmap ready", "AI mentor online", "Skills syncing"];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export default async function Dashboard() {
  const { userId, error } = await requireUser();

  if (error) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      profile: {
        select: {
          profileImage: true,
        },
      },
    },
  });

  const displayName = user?.name?.trim() || "there";
  const profileImage = user?.profile?.profileImage?.trim() || "";
  const initials = getInitials(displayName);

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-[2rem] border border-blue-100/80 bg-white/85 p-4 shadow-sm shadow-blue-950/5 backdrop-blur md:p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-base font-extrabold text-white shadow-lg shadow-blue-500/20 ring-4 ring-white">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={`${displayName} profile picture`}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-tight text-slate-950 md:text-xl">
              Welcome back, {displayName}. Keep growing today.
            </p>
            <p className="truncate text-sm font-medium text-slate-500">
              Your career tools are ready in one focused workspace.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-5 text-white shadow-2xl shadow-blue-950/20 md:p-8">
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-end">
          <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-blue-100 shadow-lg shadow-black/10 backdrop-blur">
              <Sparkles size={16} /> Career Mentor workspace
            </div>
            <h1 className="max-w-3xl text-balance text-3xl font-extrabold tracking-tight md:text-5xl">
              Choose a path, build skills, and track progress.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 md:text-base md:leading-7">
              Start with a seeded career path, then use AI chat mentoring, roadmap generation, resume checking, and course progress tracking to turn your goal into a practical learning plan.
            </p>
          </div>
          <div className="relative grid gap-3 rounded-3xl border border-white/10 bg-white/10 p-3 text-sm shadow-xl shadow-black/10 backdrop-blur sm:p-4">
            {statusItems.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 font-semibold text-blue-50"
              >
                <span>{item}</span>
                <CheckCircle2 className="size-5 shrink-0 text-emerald-300 drop-shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group flex h-full flex-col rounded-3xl border border-blue-100/70 bg-white/95 p-5 shadow-sm shadow-blue-950/5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <div className={`mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg shadow-blue-500/20 transition group-hover:scale-105`}>
                <Icon size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-950 transition group-hover:text-blue-700">{card.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">{card.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
                Open {card.title}
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
