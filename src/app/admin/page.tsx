"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Brain, Copy, KeyRound, Loader2, ShieldCheck, Trash2, Users } from "lucide-react";

type Role = "USER" | "ADMIN";

type Category = { id: string; name: string };
type Skill = {
  id: string;
  name: string;
  categoryId: string | null;
  category: Category | null;
  _count: { users: number; courses: number };
};
type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skillId: string;
  skill: Skill;
  _count: { progress: number };
};
type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  profile: {
    bio: string | null;
    education: string | null;
    experienceLevel: string | null;
    careerGoal: string | null;
  } | null;
  _count: {
    skills: number;
    careerPaths: number;
    aiChats: number;
    progress: number;
    resumes: number;
  };
};
type AdminData = { users: ManagedUser[]; skills: Skill[]; categories: Category[]; courses: Course[] };
type Tab = "users" | "skills" | "courses";

const emptyData: AdminData = { users: [], skills: [], categories: [], courses: [] };

function stringValue(value: string | null | undefined) {
  return value || "";
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData>(emptyData);
  const [tab, setTab] = useState<Tab>("users");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as Role,
    bio: "",
    education: "",
    experienceLevel: "",
    careerGoal: "",
  });
  const [skillForm, setSkillForm] = useState({ name: "", categoryId: "", categoryName: "" });
  const [courseForm, setCourseForm] = useState({ title: "", provider: "", url: "", skillId: "" });

  const stats = useMemo(
    () => [
      { label: "Users", value: data.users.length, icon: Users },
      { label: "Skills", value: data.skills.length, icon: Brain },
      { label: "Courses", value: data.courses.length, icon: BookOpen },
      { label: "Admins", value: data.users.filter((user) => user.role === "ADMIN").length, icon: ShieldCheck },
    ],
    [data]
  );

  useEffect(() => {
    let ignore = false;

    async function loadAdminData() {
      try {
        const response = await fetch("/api/admin", { credentials: "include" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load admin data");
        }

        if (!ignore) setData(result.data);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to load admin data");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAdminData();

    return () => {
      ignore = true;
    };
  }, []);

  const request = async (method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    setMessage("");
    setResetLink("");
    setResetEmail("");

    try {
      const response = await fetch("/api/admin", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Admin request failed");
      }

      if (result.data) setData(result.data);
      if (result.message) setMessage(result.message);
      if (result.resetLink) setResetLink(result.resetLink);
      if (result.email) setResetEmail(result.email);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin request failed");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm({ name: "", email: "", password: "", role: "USER", bio: "", education: "", experienceLevel: "", careerGoal: "" });
  };

  const resetSkillForm = () => {
    setEditingSkillId(null);
    setSkillForm({ name: "", categoryId: "", categoryName: "" });
  };

  const resetCourseForm = () => {
    setEditingCourseId(null);
    setCourseForm({ title: "", provider: "", url: "", skillId: "" });
  };

  const submitUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await request(editingUserId ? "PATCH" : "POST", {
      action: editingUserId ? "updateUser" : "createUser",
      id: editingUserId,
      ...userForm,
    });
    if (saved) resetUserForm();
  };

  const submitSkill = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await request(editingSkillId ? "PATCH" : "POST", {
      action: editingSkillId ? "updateSkill" : "createSkill",
      id: editingSkillId,
      ...skillForm,
    });
    if (saved) resetSkillForm();
  };

  const submitCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await request(editingCourseId ? "PATCH" : "POST", {
      action: editingCourseId ? "updateCourse" : "createCourse",
      id: editingCourseId,
      ...courseForm,
    });
    if (saved) resetCourseForm();
  };

  const resetMailto = resetLink
    ? `mailto:${resetEmail}?subject=${encodeURIComponent("Career Mentor password reset")}&body=${encodeURIComponent(`Use this link to set a new password: ${resetLink}`)}`
    : "";

  const copyResetLink = async () => {
    await navigator.clipboard.writeText(resetLink);
    setMessage("Reset link copied to clipboard.");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_30%)]" />
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-6 text-white shadow-2xl shadow-slate-950/20 backdrop-blur md:flex-row md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-blue-100">
              <ShieldCheck className="h-4 w-4" /> Admin workspace
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Manage Career Mentor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Create, update, and remove users, skills, and courses. Generate password reset links for users who need a new password.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50">
            Back to dashboard
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-xl shadow-slate-950/10">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <p className="mt-3 text-3xl font-black text-slate-950">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
        {message ? <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}
        {resetLink ? (
          <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-bold">Password reset link</p>
            <div className="mt-2 flex flex-col gap-2 md:flex-row">
              <input readOnly value={resetLink} className="min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs" />
              <button onClick={copyResetLink} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
                <Copy className="h-4 w-4" /> Copy link
              </button>
              {resetMailto ? (
                <a href={resetMailto} className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 font-bold text-white hover:bg-slate-800">
                  Send email
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          {(["users", "skills", "courses"] as Tab[]).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-2xl px-5 py-3 text-sm font-bold capitalize transition ${tab === item ? "bg-white text-slate-950 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-[2rem] bg-white/95 p-16 text-slate-600">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading admin data...
          </div>
        ) : null}

        {!loading && tab === "users" ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form onSubmit={submitUser} className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-xl font-black">{editingUserId ? "Edit user" : "Create user"}</h2>
              <div className="mt-5 space-y-3">
                <input value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} placeholder="Name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <input value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} placeholder="Email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <input value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} placeholder={editingUserId ? "New password (optional)" : "Password"} type="password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value as Role })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <input value={userForm.education} onChange={(event) => setUserForm({ ...userForm, education: event.target.value })} placeholder="Education" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <input value={userForm.experienceLevel} onChange={(event) => setUserForm({ ...userForm, experienceLevel: event.target.value })} placeholder="Experience level" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <input value={userForm.careerGoal} onChange={(event) => setUserForm({ ...userForm, careerGoal: event.target.value })} placeholder="Career goal" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <textarea value={userForm.bio} onChange={(event) => setUserForm({ ...userForm, bio: event.target.value })} placeholder="Bio" className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </div>
              <div className="mt-4 flex gap-2">
                <button disabled={saving} className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{editingUserId ? "Save user" : "Add user"}</button>
                {editingUserId ? <button type="button" onClick={resetUserForm} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold">Cancel</button> : null}
              </div>
            </form>

            <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Profile</th><th className="px-5 py-4">Activity</th><th className="px-5 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.users.map((user) => (
                      <tr key={user.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-950">{user.name}</p>
                          <p className="text-slate-500">{user.email}</p>
                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{user.role}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <p>{stringValue(user.profile?.careerGoal) || "No career goal"}</p>
                          <p className="mt-1 text-xs">{stringValue(user.profile?.experienceLevel) || "No level"}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          <p>{user._count.skills} skills / {user._count.progress} course records</p>
                          <p>{user._count.careerPaths} paths / {user._count.resumes} resumes / {user._count.aiChats} chats</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setEditingUserId(user.id); setUserForm({ name: user.name, email: user.email, password: "", role: user.role, bio: stringValue(user.profile?.bio), education: stringValue(user.profile?.education), experienceLevel: stringValue(user.profile?.experienceLevel), careerGoal: stringValue(user.profile?.careerGoal) }); }} className="rounded-xl bg-slate-100 px-3 py-2 font-bold hover:bg-slate-200">Edit</button>
                            <button onClick={() => request("POST", { action: "sendPasswordReset", id: user.id })} className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 font-bold text-blue-700 hover:bg-blue-100"><KeyRound className="h-4 w-4" /> Reset</button>
                            <button onClick={() => request("DELETE", { action: "deleteUser", id: user.id })} className="rounded-xl bg-red-50 px-3 py-2 font-bold text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && tab === "skills" ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form onSubmit={submitSkill} className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-xl font-black">{editingSkillId ? "Edit skill" : "Create skill"}</h2>
              <div className="mt-5 space-y-3">
                <input value={skillForm.name} onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })} placeholder="Skill name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <select value={skillForm.categoryId} onChange={(event) => setSkillForm({ ...skillForm, categoryId: event.target.value, categoryName: "" })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <option value="">No category / new category below</option>
                  {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {!editingSkillId ? <input value={skillForm.categoryName} onChange={(event) => setSkillForm({ ...skillForm, categoryName: event.target.value, categoryId: "" })} placeholder="New category name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" /> : null}
              </div>
              <div className="mt-4 flex gap-2">
                <button disabled={saving} className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{editingSkillId ? "Save skill" : "Add skill"}</button>
                {editingSkillId ? <button type="button" onClick={resetSkillForm} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold">Cancel</button> : null}
              </div>
            </form>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.skills.map((skill) => (
                <div key={skill.id} className="rounded-3xl bg-white p-5 shadow-xl">
                  <p className="text-lg font-black">{skill.name}</p>
                  <p className="text-sm text-slate-500">{skill.category?.name || "No category"}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-400">{skill._count.users} users / {skill._count.courses} courses</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { setEditingSkillId(skill.id); setSkillForm({ name: skill.name, categoryId: skill.categoryId || "", categoryName: "" }); }} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold hover:bg-slate-200">Edit</button>
                    <button onClick={() => request("DELETE", { action: "deleteSkill", id: skill.id })} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && tab === "courses" ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form onSubmit={submitCourse} className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-xl font-black">{editingCourseId ? "Edit course" : "Create course"}</h2>
              <div className="mt-5 space-y-3">
                <input value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} placeholder="Course title" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <input value={courseForm.provider} onChange={(event) => setCourseForm({ ...courseForm, provider: event.target.value })} placeholder="Provider" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <input value={courseForm.url} onChange={(event) => setCourseForm({ ...courseForm, url: event.target.value })} placeholder="https://..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <select value={courseForm.skillId} onChange={(event) => setCourseForm({ ...courseForm, skillId: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <option value="">Select skill</option>
                  {data.skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
              </div>
              <div className="mt-4 flex gap-2">
                <button disabled={saving} className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{editingCourseId ? "Save course" : "Add course"}</button>
                {editingCourseId ? <button type="button" onClick={resetCourseForm} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold">Cancel</button> : null}
              </div>
            </form>
            <div className="grid gap-3 xl:grid-cols-2">
              {data.courses.map((course) => (
                <div key={course.id} className="rounded-3xl bg-white p-5 shadow-xl">
                  <p className="text-lg font-black">{course.title}</p>
                  <p className="text-sm text-slate-500">{course.provider} / {course.skill.name}</p>
                  <a href={course.url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-sm font-bold text-blue-600 hover:underline">{course.url}</a>
                  <p className="mt-3 text-xs font-semibold text-slate-400">{course._count.progress} user progress records</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { setEditingCourseId(course.id); setCourseForm({ title: course.title, provider: course.provider, url: course.url, skillId: course.skillId }); }} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold hover:bg-slate-200">Edit</button>
                    <button onClick={() => request("DELETE", { action: "deleteCourse", id: course.id })} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
