import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, Bot, FileText, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statCards = [
  { key: "users", label: "Users", icon: Users, tone: "from-blue-600 to-cyan-500" },
  { key: "skills", label: "Skills", icon: BarChart3, tone: "from-violet-600 to-fuchsia-500" },
  { key: "courses", label: "Courses", icon: BookOpen, tone: "from-emerald-600 to-teal-500" },
  { key: "careerPaths", label: "Career paths", icon: GraduationCap, tone: "from-amber-500 to-orange-500" },
  { key: "resumes", label: "Resumes", icon: FileText, tone: "from-rose-500 to-pink-500" },
  { key: "aiChats", label: "AI chats", icon: Bot, tone: "from-indigo-600 to-blue-500" },
] as const;

async function getAdminDashboardData() {
  const [users, skills, courses, careerPaths, resumes, aiChats, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.skill.count(),
    prisma.course.count(),
    prisma.careerPath.count(),
    prisma.resume.count(),
    prisma.aiChat.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        email: true,
        id: true,
        name: true,
        role: true,
      },
      take: 8,
    }),
  ]);

  return {
    counts: { aiChats, careerPaths, courses, resumes, skills, users },
    recentUsers,
  };
}

export default async function AdminPage() {
  const auth = await requireAdmin();

  if (auth.error) redirect("/login");

  const data = await getAdminDashboardData();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur md:p-8">
          <div className="relative">
            <div className="absolute -right-10 -top-14 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-100">
                  <ShieldCheck className="h-4 w-4" /> Admin access verified
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Career Mentor Admin</h1>
                <p className="mt-4 text-sm leading-6 text-slate-300 md:text-base">
                  Review platform totals, recent users, learning content, AI chat activity, and resume checker usage from one protected admin page.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/api/admin/summary"
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Open admin API
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.key} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-slate-950/20">
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                <p className="mt-2 text-4xl font-black tracking-tight">{data.counts[card.key].toLocaleString()}</p>
              </article>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-xl shadow-slate-950/20">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-bold">Recent users</h2>
            <p className="mt-1 text-sm text-slate-400">The latest accounts created in the platform database.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-bold">Name</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.recentUsers.map((user) => (
                  <tr key={user.id} className="text-slate-200">
                    <td className="whitespace-nowrap px-6 py-4 font-semibold">{user.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-100 ring-1 ring-blue-400/20">{user.role}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-300">{user.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
