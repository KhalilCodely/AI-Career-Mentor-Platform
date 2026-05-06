"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Layers3, Loader2, Search, Sparkles, X } from "lucide-react";

type Skill = {
  id: string;
  name: string;
  category?: {
    name: string;
  } | null;
};

type UserSkillSelection = {
  skillId: string;
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
} | null;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

async function parseJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [status, setStatus] = useState<StatusMessage>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skillsRes, userSkillsRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/user-skills", { credentials: "include" }),
        ]);

        const skillsData = await parseJson<Skill[] | { error?: string }>(skillsRes);
        const userSkillsData = await parseJson<UserSkillSelection[] | { error?: string }>(userSkillsRes);

        if (!skillsRes.ok || !Array.isArray(skillsData)) {
          throw new Error(Array.isArray(skillsData) ? "Failed to load skills" : skillsData.error || "Failed to load skills");
        }

        if (!userSkillsRes.ok || !Array.isArray(userSkillsData)) {
          throw new Error(Array.isArray(userSkillsData) ? "Failed to load your skills" : userSkillsData.error || "Failed to load your skills");
        }

        setSkills(skillsData);
        setSelected(userSkillsData.map((skill) => skill.skillId));
      } catch (err) {
        console.error(err);
        setStatus({ type: "error", text: getErrorMessage(err) });
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const categoryStats = useMemo(() => {
    const stats = new Map<string, { total: number; selected: number }>();

    skills.forEach((skill) => {
      const category = skill.category?.name || "Other";
      const current = stats.get(category) || { total: 0, selected: 0 };

      current.total += 1;
      if (selectedSet.has(skill.id)) current.selected += 1;

      stats.set(category, current);
    });

    return Array.from(stats.entries())
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedSet, skills]);

  const filteredGrouped = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result: Record<string, Skill[]> = {};

    skills.forEach((skill) => {
      const category = skill.category?.name || "Other";
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesSearch = !normalizedSearch || skill.name.toLowerCase().includes(normalizedSearch);

      if (!matchesCategory || !matchesSearch) return;

      if (!result[category]) result[category] = [];
      result[category].push(skill);
    });

    return result;
  }, [activeCategory, search, skills]);

  const selectedSkills = useMemo(
    () => skills.filter((skill) => selectedSet.has(skill.id)).sort((a, b) => a.name.localeCompare(b.name)),
    [selectedSet, skills]
  );

  const toggleSkill = (id: string) => {
    setStatus(null);
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((skillId) => skillId !== id)
        : [...prev, id]
    );
  };

  const selectCategory = (category: string) => {
    const categorySkillIds = skills
      .filter((skill) => (skill.category?.name || "Other") === category)
      .map((skill) => skill.id);

    setSelected((prev) => Array.from(new Set([...prev, ...categorySkillIds])));
    setStatus(null);
  };

  const clearCategory = (category: string) => {
    const categorySkillIds = new Set(
      skills
        .filter((skill) => (skill.category?.name || "Other") === category)
        .map((skill) => skill.id)
    );

    setSelected((prev) => prev.filter((skillId) => !categorySkillIds.has(skillId)));
    setStatus(null);
  };

  const saveSkills = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/user-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          skillIds: selected,
        }),
      });

      const data = await parseJson<{ error?: string; message?: string }>(res);

      if (!res.ok) throw new Error(data.error || "Failed to save skills");

      setStatus({ type: "success", text: data.message || "Skills saved successfully" });
    } catch (err: unknown) {
      console.error(err);
      setStatus({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Loading skills...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-emerald-100">
              <Sparkles size={16} />
              Personalized skill profile
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">Choose the skills you want to grow</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
              Your selected skills power course recommendations, progress tracking, and a more focused career mentor experience.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-80">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">{skills.length}</div>
              <div className="text-xs text-slate-300">Skills</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">{categoryStats.length}</div>
              <div className="text-xs text-slate-300">Categories</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">{selected.length}</div>
              <div className="text-xs text-slate-300">Selected</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-3xl border bg-white p-4 shadow-sm">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search skills..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
              />
            </label>

            <button
              onClick={saveSkills}
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Saving..." : "Save selected skills"}
            </button>

            {status && (
              <div className={`mt-3 rounded-2xl border p-3 text-sm ${status.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                {status.text}
              </div>
            )}
          </div>

          <div className="rounded-3xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-slate-950">
              <Layers3 size={18} /> Categories
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${activeCategory === "all" ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              >
                <span>All skills</span>
                <span>{skills.length}</span>
              </button>

              {categoryStats.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${activeCategory === category.name ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                >
                  <span>{category.name}</span>
                  <span>{category.selected}/{category.total}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedSkills.length > 0 && (
            <div className="rounded-3xl border bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-950">Selected skills</h2>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    {skill.name}
                    <X size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="space-y-5">
          {Object.entries(filteredGrouped).map(([category, categorySkills]) => {
            const selectedInCategory = categorySkills.filter((skill) => selectedSet.has(skill.id)).length;

            return (
              <section key={category} className="rounded-3xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">{category}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedInCategory} of {categorySkills.length} shown skills selected
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => selectCategory(category)}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                      Select category
                    </button>
                    <button
                      type="button"
                      onClick={() => clearCategory(category)}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-300 hover:text-red-600"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {categorySkills.map((skill) => {
                    const isSelected = selectedSet.has(skill.id);

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`group flex items-center justify-between rounded-2xl border p-4 text-left text-sm transition hover:-translate-y-0.5 hover:shadow-md ${isSelected ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-gray-200 bg-white text-slate-800 hover:border-gray-300"}`}
                      >
                        <span className="font-medium">{skill.name}</span>
                        <span className={`flex size-7 items-center justify-center rounded-full border transition ${isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 text-transparent group-hover:text-gray-300"}`}>
                          <Check size={15} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {Object.keys(filteredGrouped).length === 0 && (
            <div className="rounded-3xl border border-dashed bg-white p-10 text-center text-gray-500">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">🔎</div>
              <h2 className="text-lg font-semibold text-slate-950">No skills found</h2>
              <p className="mt-1 text-sm">Try a different search or switch to another category.</p>
            </div>
          )}

          {selected.length > 0 && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} />
              {selected.length} skills selected. Save when you are ready to update your recommendations.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
