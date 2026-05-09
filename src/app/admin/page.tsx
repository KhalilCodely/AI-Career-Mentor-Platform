"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Edit3,
  GraduationCap,
  LayoutDashboard,
  Link2,
  Loader2,
  Map,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

type Skill = {
  id: string;
  name: string;
  category?: { id: string; name: string } | null;
};

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skillId: string;
  skill: Skill;
};

type Roadmap = {
  id: string;
  title: string;
  description: string | null;
  roadmap: unknown;
  updatedAt: string;
};

type Overview = {
  users: number;
  courses: number;
  skills: number;
  roadmaps: number;
};

type Notice = { type: "success" | "error"; message: string } | null;
type Tab = "courses" | "skills" | "roadmaps";

const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "skills", label: "Skills", icon: Brain },
  { id: "roadmaps", label: "Roadmaps", icon: Map },
];

const emptyCourseForm = { id: "", title: "", provider: "", url: "", skillId: "" };
const emptySkillForm = { id: "", name: "", categoryName: "" };
const emptyRoadmapForm = { id: "", title: "", description: "", roadmapJson: "" };

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function formatJson(value: unknown) {
  if (!value) return "";
  return JSON.stringify(value, null, 2);
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [skillForm, setSkillForm] = useState(emptySkillForm);
  const [roadmapForm, setRoadmapForm] = useState(emptyRoadmapForm);

  const skillCategories = useMemo(
    () => Array.from(new Set(skills.map((skill) => skill.category?.name).filter(Boolean) as string[])).sort(),
    [skills]
  );

  const loadAdminData = async () => {
    setLoading(true);
    setNotice(null);

    try {
      const [overviewRes, coursesRes, skillsRes, roadmapsRes] = await Promise.all([
        fetch("/api/admin/overview", { credentials: "include" }),
        fetch("/api/admin/courses", { credentials: "include" }),
        fetch("/api/admin/skills", { credentials: "include" }),
        fetch("/api/admin/roadmaps", { credentials: "include" }),
      ]);

      const overviewData = await parseJson<Overview | { error?: string }>(overviewRes);
      const coursesData = await parseJson<{ courses?: Course[]; skills?: Skill[]; error?: string }>(coursesRes);
      const skillsData = await parseJson<{ skills?: Skill[]; error?: string }>(skillsRes);
      const roadmapsData = await parseJson<{ roadmaps?: Roadmap[]; error?: string }>(roadmapsRes);

      if (!overviewRes.ok) throw new Error("error" in overviewData ? overviewData.error : "Failed to load overview");
      if (!coursesRes.ok) throw new Error(coursesData.error || "Failed to load courses");
      if (!skillsRes.ok) throw new Error(skillsData.error || "Failed to load skills");
      if (!roadmapsRes.ok) throw new Error(roadmapsData.error || "Failed to load roadmaps");

      setOverview(overviewData as Overview);
      setCourses(coursesData.courses || []);
      setSkills(skillsData.skills || coursesData.skills || []);
      setRoadmaps(roadmapsData.roadmaps || []);
    } catch (error) {
      console.error("Admin data failed", error);
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadAdminData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const saveCourse = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const res = await fetch(courseForm.id ? `/api/admin/courses/${courseForm.id}` : "/api/admin/courses", {
        method: courseForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(courseForm),
      });
      const data = await parseJson<{ course?: Course; error?: string }>(res);

      if (!res.ok || !data.course) throw new Error(data.error || "Course save failed");

      setCourses((current) => courseForm.id ? current.map((course) => course.id === data.course?.id ? data.course : course) : [...current, data.course!]);
      setCourseForm(emptyCourseForm);
      setNotice({ type: "success", message: "Course saved successfully." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const saveSkill = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const res = await fetch(skillForm.id ? `/api/admin/skills/${skillForm.id}` : "/api/admin/skills", {
        method: skillForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(skillForm),
      });
      const data = await parseJson<{ skill?: Skill; error?: string }>(res);

      if (!res.ok || !data.skill) throw new Error(data.error || "Skill save failed");

      setSkills((current) => skillForm.id ? current.map((skill) => skill.id === data.skill?.id ? data.skill : skill) : [...current, data.skill!]);
      setSkillForm(emptySkillForm);
      setNotice({ type: "success", message: "Skill saved successfully." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const saveRoadmap = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const res = await fetch(roadmapForm.id ? `/api/admin/roadmaps/${roadmapForm.id}` : "/api/admin/roadmaps", {
        method: roadmapForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(roadmapForm),
      });
      const data = await parseJson<{ roadmap?: Roadmap; error?: string }>(res);

      if (!res.ok || !data.roadmap) throw new Error(data.error || "Roadmap save failed");

      setRoadmaps((current) => roadmapForm.id ? current.map((roadmap) => roadmap.id === data.roadmap?.id ? data.roadmap : roadmap) : [data.roadmap!, ...current]);
      setRoadmapForm(emptyRoadmapForm);
      setNotice({ type: "success", message: "Roadmap saved successfully." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (kind: Tab, id: string) => {
    const label = kind === "courses" ? "course" : kind === "skills" ? "skill" : "roadmap";
    if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) return;

    setNotice(null);

    try {
      const res = await fetch(`/api/admin/${kind}/${id}`, { method: "DELETE", credentials: "include" });
      const data = await parseJson<{ error?: string }>(res);

      if (!res.ok) throw new Error(data.error || `Failed to delete ${label}`);

      if (kind === "courses") setCourses((current) => current.filter((course) => course.id !== id));
      if (kind === "skills") setSkills((current) => current.filter((skill) => skill.id !== id));
      if (kind === "roadmaps") setRoadmaps((current) => current.filter((roadmap) => roadmap.id !== id));
      setNotice({ type: "success", message: `${label[0].toUpperCase()}${label.slice(1)} deleted.` });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="absolute right-16 top-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-blue-100">
                <Sparkles className="h-4 w-4" /> Admin command center
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Manage the learning catalog</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Add, update, and remove courses, skill taxonomy, and roadmap templates from one focused workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={loadAdminData}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              <LayoutDashboard className="h-4 w-4" /> Refresh data
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-4">
          <Stat icon={Users} label="Users" value={overview?.users ?? 0} />
          <Stat icon={BookOpen} label="Courses" value={overview?.courses ?? courses.length} />
          <Stat icon={Brain} label="Skills" value={overview?.skills ?? skills.length} />
          <Stat icon={Map} label="Roadmaps" value={overview?.roadmaps ?? roadmaps.length} />
        </section>

        {notice && (
          <div className={`rounded-2xl border p-4 text-sm font-semibold ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {notice.message}
          </div>
        )}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${activeTab === tab.id ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"}`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-96 items-center justify-center rounded-[2rem] bg-white shadow-sm">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading admin tools...
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
            {activeTab === "courses" && (
              <>
                <Panel title={courseForm.id ? "Edit course" : "Add course"} icon={GraduationCap}>
                  <form onSubmit={saveCourse} className="space-y-4">
                    <Field label="Course title" value={courseForm.title} onChange={(value) => setCourseForm({ ...courseForm, title: value })} />
                    <Field label="Provider" value={courseForm.provider} onChange={(value) => setCourseForm({ ...courseForm, provider: value })} />
                    <Field label="Course URL" value={courseForm.url} onChange={(value) => setCourseForm({ ...courseForm, url: value })} />
                    <label className="block text-sm font-semibold text-slate-700">
                      Skill
                      <select value={courseForm.skillId} onChange={(event) => setCourseForm({ ...courseForm, skillId: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-100">
                        <option value="">Choose skill</option>
                        {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                      </select>
                    </label>
                    <FormButtons saving={saving} isEditing={Boolean(courseForm.id)} onCancel={() => setCourseForm(emptyCourseForm)} />
                  </form>
                </Panel>
                <ListPanel title="Courses" count={courses.length}>
                  {courses.map((course) => (
                    <Row key={course.id} title={course.title} subtitle={`${course.provider} · ${course.skill.name}`} href={course.url} onEdit={() => setCourseForm({ id: course.id, title: course.title, provider: course.provider, url: course.url, skillId: course.skill.id })} onDelete={() => deleteItem("courses", course.id)} />
                  ))}
                </ListPanel>
              </>
            )}

            {activeTab === "skills" && (
              <>
                <Panel title={skillForm.id ? "Edit skill" : "Add skill"} icon={Brain}>
                  <form onSubmit={saveSkill} className="space-y-4">
                    <Field label="Skill name" value={skillForm.name} onChange={(value) => setSkillForm({ ...skillForm, name: value })} />
                    <label className="block text-sm font-semibold text-slate-700">
                      Category
                      <input list="skill-categories" value={skillForm.categoryName} onChange={(event) => setSkillForm({ ...skillForm, categoryName: event.target.value })} placeholder="Development" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-100" />
                      <datalist id="skill-categories">{skillCategories.map((category) => <option key={category} value={category} />)}</datalist>
                    </label>
                    <FormButtons saving={saving} isEditing={Boolean(skillForm.id)} onCancel={() => setSkillForm(emptySkillForm)} />
                  </form>
                </Panel>
                <ListPanel title="Skills" count={skills.length}>
                  {skills.map((skill) => (
                    <Row key={skill.id} title={skill.name} subtitle={skill.category?.name || "Uncategorized"} onEdit={() => setSkillForm({ id: skill.id, name: skill.name, categoryName: skill.category?.name || "" })} onDelete={() => deleteItem("skills", skill.id)} />
                  ))}
                </ListPanel>
              </>
            )}

            {activeTab === "roadmaps" && (
              <>
                <Panel title={roadmapForm.id ? "Edit roadmap" : "Add roadmap"} icon={Map}>
                  <form onSubmit={saveRoadmap} className="space-y-4">
                    <Field label="Roadmap title" value={roadmapForm.title} onChange={(value) => setRoadmapForm({ ...roadmapForm, title: value })} />
                    <label className="block text-sm font-semibold text-slate-700">
                      Description
                      <textarea value={roadmapForm.description} onChange={(event) => setRoadmapForm({ ...roadmapForm, description: event.target.value })} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-100" />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Roadmap JSON
                      <textarea value={roadmapForm.roadmapJson} onChange={(event) => setRoadmapForm({ ...roadmapForm, roadmapJson: event.target.value })} rows={10} placeholder='{"phases": []}' className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                    </label>
                    <FormButtons saving={saving} isEditing={Boolean(roadmapForm.id)} onCancel={() => setRoadmapForm(emptyRoadmapForm)} />
                  </form>
                </Panel>
                <ListPanel title="Roadmaps" count={roadmaps.length}>
                  {roadmaps.map((roadmap) => (
                    <Row key={roadmap.id} title={roadmap.title} subtitle={roadmap.description || "No description"} onEdit={() => setRoadmapForm({ id: roadmap.id, title: roadmap.title, description: roadmap.description || "", roadmapJson: formatJson(roadmap.roadmap) })} onDelete={() => deleteItem("roadmaps", roadmap.id)} />
                  ))}
                </ListPanel>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></div>
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof BookOpen; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-black"><Icon className="h-5 w-5 text-blue-600" /> {title}</h2>
      {children}
    </section>
  );
}

function ListPanel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black">{title}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{count} total</span></div>
      <div className="grid max-h-[42rem] gap-3 overflow-y-auto pr-1">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-100" />
    </label>
  );
}

function FormButtons({ saving, isEditing, onCancel }: { saving: boolean; isEditing: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-2">
      <button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {isEditing ? "Save changes" : "Create"}
      </button>
      {isEditing && <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>}
    </div>
  );
}

function Row({ title, subtitle, href, onEdit, onDelete }: { title: string; subtitle: string; href?: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="truncate font-bold text-slate-950">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{subtitle}</p>
        {href && <a href={href} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"><Link2 className="h-3 w-3" /> Open course</a>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"><Edit3 className="h-4 w-4" /> Edit</button>
        <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete</button>
      </div>
    </article>
  );
}
