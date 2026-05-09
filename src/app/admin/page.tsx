import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, Bot, FileText, GraduationCap, Lock, ShieldCheck, Users } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createCareerPath,
  createCategory,
  createCourse,
  createSkill,
  createUser,
  createUserCareerPath,
  createUserProgress,
  createUserSkill,
  deleteAiChat,
  deleteAiRecommendation,
  deleteCareerPath,
  deleteCategory,
  deleteCourse,
  deleteResume,
  deleteSkill,
  deleteUser,
  deleteUserCareerPath,
  deleteUserProgress,
  deleteUserSkill,
  sendUserPasswordReset,
  toggleUserLock,
  updateCareerPath,
  updateCategory,
  updateCourse,
  updateSkill,
  updateUser,
} from "./actions";

export const dynamic = "force-dynamic";

const statCards = [
  { key: "users", label: "Users", icon: Users, tone: "from-blue-600 to-cyan-500" },
  { key: "lockedUsers", label: "Locked", icon: Lock, tone: "from-red-600 to-orange-500" },
  { key: "skills", label: "Skills", icon: BarChart3, tone: "from-violet-600 to-fuchsia-500" },
  { key: "courses", label: "Courses", icon: BookOpen, tone: "from-emerald-600 to-teal-500" },
  { key: "careerPaths", label: "Career paths", icon: GraduationCap, tone: "from-amber-500 to-orange-500" },
  { key: "resumes", label: "Resumes", icon: FileText, tone: "from-rose-500 to-pink-500" },
  { key: "aiChats", label: "AI chats", icon: Bot, tone: "from-indigo-600 to-blue-500" },
] as const;

const inputClass = "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400";
const selectClass = `${inputClass} appearance-none`;
const buttonClass = "rounded-xl bg-blue-500 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-400";
const dangerClass = "rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100 transition hover:bg-red-500/20";

function jsonText(value: Prisma.JsonValue | null) {
  return value ? JSON.stringify(value, null, 2) : "";
}

async function getAdminDashboardData() {
  const [usersCount, lockedUsers, skillsCount, coursesCount, careerPathsCount, resumesCount, aiChatsCount, users, categories, skills, courses, careerPaths, resumes, aiChats, aiRecommendations, userSkills, userCareerPaths, userProgress] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isLocked: true } }),
    prisma.skill.count(),
    prisma.course.count(),
    prisma.careerPath.count(),
    prisma.resume.count(),
    prisma.aiChat.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { profile: true },
      take: 50,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { skills: true } } } }),
    prisma.skill.findMany({ orderBy: { name: "asc" }, include: { category: true, _count: { select: { courses: true, users: true } } } }),
    prisma.course.findMany({ orderBy: { title: "asc" }, include: { skill: true } }),
    prisma.careerPath.findMany({ orderBy: { title: "asc" }, include: { _count: { select: { users: true } } } }),
    prisma.resume.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { email: true, name: true } } }, take: 25 }),
    prisma.aiChat.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { email: true, name: true } } }, take: 25 }),
    prisma.aiRecommendation.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { email: true, name: true } } }, take: 25 }),
    prisma.userSkill.findMany({ orderBy: { updatedAt: "desc" }, include: { skill: true, user: { select: { email: true, name: true } } }, take: 50 }),
    prisma.userCareerPath.findMany({ orderBy: { updatedAt: "desc" }, include: { careerPath: true, user: { select: { email: true, name: true } } }, take: 50 }),
    prisma.userProgress.findMany({ orderBy: { updatedAt: "desc" }, include: { course: true, user: { select: { email: true, name: true } } }, take: 50 }),
  ]);

  return {
    aiChats,
    aiRecommendations,
    careerPaths,
    categories,
    courses,
    counts: {
      aiChats: aiChatsCount,
      careerPaths: careerPathsCount,
      courses: coursesCount,
      lockedUsers,
      resumes: resumesCount,
      skills: skillsCount,
      users: usersCount,
    },
    resumes,
    skills,
    userCareerPaths,
    userProgress,
    users,
    userSkills,
  };
}

function UserSelect({ users }: { users: { id: string; email: string; name: string }[] }) {
  return (
    <select name="userId" className={selectClass} required>
      <option value="">Choose user</option>
      {users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
    </select>
  );
}

export default async function AdminPage() {
  const auth = await requireAdmin();

  if (auth.error) redirect("/login");

  const data = await getAdminDashboardData();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur md:p-8">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-100">
                <ShieldCheck className="h-4 w-4" /> Admin access verified
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Career Mentor Admin</h1>
              <p className="mt-4 text-sm leading-6 text-slate-300 md:text-base">
                Create, read, update, and delete users, learning content, assignments, progress records, resumes, recommendations, and chat history. Lock accounts to block logins and active API use immediately. Send professional one-time password reset links directly to users by email.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/api/admin/summary" className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15">Open admin API</Link>
              <Link href="/dashboard" className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50">Go to dashboard</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.key} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-slate-950/20">
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}><Icon className="h-6 w-6" /></div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                <p className="mt-2 text-4xl font-black tracking-tight">{data.counts[card.key].toLocaleString()}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black">Users</h2>
          <form action={createUser} className="mt-5 grid gap-3 lg:grid-cols-6">
            <input name="name" className={inputClass} placeholder="Name" required />
            <input name="email" type="email" className={inputClass} placeholder="Email" required />
            <input name="password" type="password" className={inputClass} placeholder="Password" required />
            <select name="role" className={selectClass}><option>USER</option><option>ADMIN</option></select>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input name="isLocked" type="checkbox" /> Locked</label>
            <button className={buttonClass}>Create user</button>
          </form>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="py-3">Account</th><th>Role</th><th>Locked</th><th>Password</th><th>Reset</th><th>Actions</th></tr></thead>
              <tbody className="divide-y divide-white/10">
                {data.users.map((user) => (
                  <tr key={user.id} className="align-top">
                    <td className="py-3">
                      <form id={`user-${user.id}`} action={updateUser} className="grid gap-2">
                        <input type="hidden" name="id" value={user.id} />
                        <input name="name" defaultValue={user.name} className={inputClass} required />
                        <input name="email" type="email" defaultValue={user.email} className={inputClass} required />
                      </form>
                    </td>
                    <td className="py-3"><select form={`user-${user.id}`} name="role" defaultValue={user.role} className={selectClass}><option>USER</option><option>ADMIN</option></select></td>
                    <td className="py-3"><input form={`user-${user.id}`} name="isLocked" type="checkbox" defaultChecked={user.isLocked} /></td>
                    <td className="py-3"><input form={`user-${user.id}`} name="password" type="password" className={inputClass} placeholder="Leave unchanged" /></td>
                    <td className="py-3">
                      <form action={sendUserPasswordReset}>
                        <input type="hidden" name="id" value={user.id} />
                        <button className="rounded-xl border border-blue-300/30 bg-blue-400/10 px-3 py-2 text-xs font-black text-blue-100 transition hover:bg-blue-400/20">Email reset link</button>
                      </form>
                    </td>
                    <td className="flex flex-wrap gap-2 py-3">
                      <button form={`user-${user.id}`} className={buttonClass}>Save</button>
                      <form action={toggleUserLock}><input type="hidden" name="id" value={user.id} /><input type="hidden" name="isLocked" value={String(!user.isLocked)} /><button className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-100">{user.isLocked ? "Unlock" : "Lock"}</button></form>
                      <form action={deleteUser}><input type="hidden" name="id" value={user.id} /><button className={dangerClass}>Delete</button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
            <h2 className="text-2xl font-black">Categories</h2>
            <form action={createCategory} className="mt-5 flex gap-3"><input name="name" className={inputClass} placeholder="Category name" required /><button className={buttonClass}>Create</button></form>
            <div className="mt-5 space-y-3">{data.categories.map((category) => <form key={category.id} action={updateCategory} className="grid gap-2 md:grid-cols-[1fr_auto_auto]"><input type="hidden" name="id" value={category.id} /><input name="name" defaultValue={category.name} className={inputClass} /><button className={buttonClass}>Save</button><button formAction={deleteCategory} className={dangerClass}>Delete</button></form>)}</div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
            <h2 className="text-2xl font-black">Skills</h2>
            <form action={createSkill} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input name="name" className={inputClass} placeholder="Skill name" required /><select name="categoryId" className={selectClass}><option value="">No category</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><button className={buttonClass}>Create</button></form>
            <div className="mt-5 space-y-3">{data.skills.map((skill) => <form key={skill.id} action={updateSkill} className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]"><input type="hidden" name="id" value={skill.id} /><input name="name" defaultValue={skill.name} className={inputClass} /><select name="categoryId" defaultValue={skill.categoryId ?? ""} className={selectClass}><option value="">No category</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><button className={buttonClass}>Save</button><button formAction={deleteSkill} className={dangerClass}>Delete</button></form>)}</div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black">Courses</h2>
          <form action={createCourse} className="mt-5 grid gap-3 lg:grid-cols-5"><input name="title" className={inputClass} placeholder="Title" required /><input name="provider" className={inputClass} placeholder="Provider" required /><input name="url" className={inputClass} placeholder="URL" required /><select name="skillId" className={selectClass} required><option value="">Skill</option>{data.skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select><button className={buttonClass}>Create course</button></form>
          <div className="mt-5 space-y-3">{data.courses.map((course) => <form key={course.id} action={updateCourse} className="grid gap-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]"><input type="hidden" name="id" value={course.id} /><input name="title" defaultValue={course.title} className={inputClass} /><input name="provider" defaultValue={course.provider} className={inputClass} /><input name="url" defaultValue={course.url} className={inputClass} /><select name="skillId" defaultValue={course.skillId} className={selectClass}>{data.skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select><button className={buttonClass}>Save</button><button formAction={deleteCourse} className={dangerClass}>Delete</button></form>)}</div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-2xl font-black">Career paths</h2>
          <form action={createCareerPath} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_2fr_auto]"><input name="title" className={inputClass} placeholder="Title" required /><input name="description" className={inputClass} placeholder="Description" /><textarea name="roadmap" className={inputClass} placeholder='{"category":"Engineering"}' /><button className={buttonClass}>Create path</button></form>
          <div className="mt-5 space-y-3">{data.careerPaths.map((path) => <form key={path.id} action={updateCareerPath} className="grid gap-2 lg:grid-cols-[1fr_1fr_2fr_auto_auto]"><input type="hidden" name="id" value={path.id} /><input name="title" defaultValue={path.title} className={inputClass} /><input name="description" defaultValue={path.description ?? ""} className={inputClass} /><textarea name="roadmap" defaultValue={jsonText(path.roadmap)} className={inputClass} /><button className={buttonClass}>Save</button><button formAction={deleteCareerPath} className={dangerClass}>Delete</button></form>)}</div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"><h2 className="text-xl font-black">User skills</h2><form action={createUserSkill} className="mt-4 grid gap-3"><UserSelect users={data.users} /><select name="skillId" className={selectClass} required><option value="">Skill</option>{data.skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select><input name="level" type="number" min="1" max="5" className={inputClass} placeholder="Level" required /><button className={buttonClass}>Assign</button></form><div className="mt-4 space-y-2">{data.userSkills.map((item) => <form key={item.id} action={deleteUserSkill} className="flex items-center justify-between gap-3 text-sm"><span>{item.user.email} → {item.skill.name} ({item.level})</span><input type="hidden" name="id" value={item.id} /><button className={dangerClass}>Delete</button></form>)}</div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"><h2 className="text-xl font-black">User career paths</h2><form action={createUserCareerPath} className="mt-4 grid gap-3"><UserSelect users={data.users} /><select name="careerPathId" className={selectClass} required><option value="">Career path</option>{data.careerPaths.map((path) => <option key={path.id} value={path.id}>{path.title}</option>)}</select><input name="progress" type="number" min="0" max="100" className={inputClass} placeholder="Progress" /><button className={buttonClass}>Assign</button></form><div className="mt-4 space-y-2">{data.userCareerPaths.map((item) => <form key={item.id} action={deleteUserCareerPath} className="flex items-center justify-between gap-3 text-sm"><span>{item.user.email} → {item.careerPath.title} ({Number(item.progress)}%)</span><input type="hidden" name="id" value={item.id} /><button className={dangerClass}>Delete</button></form>)}</div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"><h2 className="text-xl font-black">Course progress</h2><form action={createUserProgress} className="mt-4 grid gap-3"><UserSelect users={data.users} /><select name="courseId" className={selectClass} required><option value="">Course</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><input name="progress" type="number" min="0" max="100" className={inputClass} placeholder="Progress" /><label className="text-sm text-slate-300"><input name="completed" type="checkbox" /> Completed</label><button className={buttonClass}>Track</button></form><div className="mt-4 space-y-2">{data.userProgress.map((item) => <form key={item.id} action={deleteUserProgress} className="flex items-center justify-between gap-3 text-sm"><span>{item.user.email} → {item.course.title} ({Number(item.progress)}%)</span><input type="hidden" name="id" value={item.id} /><button className={dangerClass}>Delete</button></form>)}</div></div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"><h2 className="text-xl font-black">Resumes</h2><div className="mt-4 space-y-3">{data.resumes.map((resume) => <form key={resume.id} action={deleteResume} className="rounded-2xl bg-slate-950/60 p-3 text-sm"><p className="font-bold">{resume.user.email}</p><p className="truncate text-slate-400">{resume.fileUrl}</p><input type="hidden" name="id" value={resume.id} /><button className={`${dangerClass} mt-3`}>Delete</button></form>)}</div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"><h2 className="text-xl font-black">AI chats</h2><div className="mt-4 space-y-3">{data.aiChats.map((chat) => <form key={chat.id} action={deleteAiChat} className="rounded-2xl bg-slate-950/60 p-3 text-sm"><p className="font-bold">{chat.user.email}</p><p className="line-clamp-2 text-slate-400">{chat.message}</p><input type="hidden" name="id" value={chat.id} /><button className={`${dangerClass} mt-3`}>Delete</button></form>)}</div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"><h2 className="text-xl font-black">AI recommendations</h2><div className="mt-4 space-y-3">{data.aiRecommendations.map((recommendation) => <form key={recommendation.id} action={deleteAiRecommendation} className="rounded-2xl bg-slate-950/60 p-3 text-sm"><p className="font-bold">{recommendation.user.email}</p><p className="text-slate-400">{recommendation.type}</p><input type="hidden" name="id" value={recommendation.id} /><button className={`${dangerClass} mt-3`}>Delete</button></form>)}</div></div>
        </section>
      </div>
    </main>
  );
}
