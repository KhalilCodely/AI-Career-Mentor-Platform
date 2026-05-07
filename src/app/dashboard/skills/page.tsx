"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  Layers3,
  Loader2,
  Save,
  Search,
  Sparkles,
} from "lucide-react";

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

type Notice = {
  type: "success" | "error";
  message: string;
};

const allCategoriesLabel = "All skills";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(allCategoriesLabel);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skillsRes, userSkillsRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/user-skills", { credentials: "include" }),
        ]);

        const skillsData = (await skillsRes.json()) as Skill[];
        const userSkillsData = (await userSkillsRes.json()) as UserSkillSelection[];

        setSkills(skillsData);
        setSelected(userSkillsData.map((skill) => skill.skillId));
      } catch (err) {
        console.error(err);
        setNotice({ type: "error", message: "Unable to load skills right now." });
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Skill[]> = {};

    skills.forEach((skill) => {
      const category = skill.category?.name || "Other";
      if (!map[category]) map[category] = [];
      map[category].push(skill);
    });

    return map;
  }, [skills]);

  const categories = useMemo(
    () => [allCategoriesLabel, ...Object.keys(grouped).sort()],
    [grouped]
  );

  const filteredGrouped = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result: typeof grouped = {};

    Object.entries(grouped).forEach(([category, categorySkills]) => {
      if (activeCategory !== allCategoriesLabel && category !== activeCategory) {
        return;
      }

      const filtered = normalizedSearch
        ? categorySkills.filter((skill) =>
            skill.name.toLowerCase().includes(normalizedSearch)
          )
        : categorySkills;

      if (filtered.length) result[category] = filtered;
    });

    return result;
  }, [activeCategory, search, grouped]);

  const filteredCount = useMemo(
    () => Object.values(filteredGrouped).reduce((total, items) => total + items.length, 0),
    [filteredGrouped]
  );

  const selectedSkills = useMemo(
    () => skills.filter((skill) => selected.includes(skill.id)),
    [selected, skills]
  );

  const toggleSkill = (id: string) => {
    setNotice(null);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((skillId) => skillId !== id) : [...prev, id]
    );
  };

  const saveSkills = async () => {
    setLoading(true);
    setNotice(null);

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

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error);

      setNotice({ type: "success", message: "Skills saved successfully." });
    } catch (err: unknown) {
      console.error(err);
      setNotice({ type: "error", message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
          <Loader2 className="h-5 w-5 animate-spin text-gray-950" />
          Loading skill library...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24 md:pb-0">
      <section className="overflow-hidden rounded-[2rem] bg-gray-950 text-white shadow-sm">
        <div className="relative px-6 py-8 md:px-8 lg:px-10">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 ring-1 ring-white/15">
                <Sparkles className="h-4 w-4" />
                Skills workspace
              </div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
                Shape recommendations around the skills you want to grow.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                Select your current strengths and target areas so Career Mentor can
                tailor courses, roadmap steps, and mentoring prompts to your goals.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={BadgeCheck} label="Selected" value={selected.length} />
              <StatCard icon={Layers3} label="Available" value={skills.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5 rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-gray-200 md:p-5">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Skill library</h2>
              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredCount} skills across {Object.keys(grouped).length} categories.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-4 focus:ring-gray-100"
                />
              </label>

              <button
                onClick={saveSkills}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Saving..." : "Save skills"}
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gray-950 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-950"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {notice ? (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                notice.type === "success"
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              {notice.message}
            </div>
          ) : null}

          {Object.keys(filteredGrouped).length ? (
            <div className="space-y-7">
              {Object.entries(filteredGrouped).map(([category, categorySkills]) => (
                <div key={category}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-gray-950">{category}</h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                      {categorySkills.length} skills
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {categorySkills.map((skill) => {
                      const isSelected = selected.includes(skill.id);

                      return (
                        <button
                          key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className={`group flex min-h-20 items-center justify-between gap-3 rounded-3xl border p-4 text-left transition ${
                            isSelected
                              ? "border-gray-950 bg-gray-950 text-white shadow-lg shadow-gray-950/10"
                              : "border-gray-200 bg-white text-gray-800 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                          }`}
                        >
                          <span className="text-sm font-bold leading-5">{skill.name}</span>
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl transition ${
                              isSelected
                                ? "bg-white text-gray-950"
                                : "bg-gray-100 text-transparent group-hover:text-gray-400"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
              <h3 className="text-lg font-bold text-gray-950">No skills found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try another search term or switch back to all categories.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-bold text-gray-950">Selected skills</h2>
            <p className="mt-1 text-sm text-gray-500">
              These skills will guide future recommendations.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedSkills.length ? (
                selectedSkills.slice(0, 18).map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className="rounded-full bg-gray-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-gray-700"
                  >
                    {skill.name}
                  </button>
                ))
              ) : (
                <div className="rounded-3xl bg-gray-50 p-5 text-sm leading-6 text-gray-500 ring-1 ring-gray-100">
                  Select a few skills to start building a personalized career map.
                </div>
              )}
            </div>

            {selectedSkills.length > 18 ? (
              <p className="mt-4 text-xs font-semibold text-gray-400">
                +{selectedSkills.length - 18} more selected
              </p>
            ) : null}
          </div>

          <div className="rounded-[2rem] bg-gray-950 p-5 text-white shadow-sm">
            <h2 className="text-lg font-bold">Pro tip</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Pick a mix of skills you already have and skills you want next. That
              balance helps recommendations stay practical and aspirational.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

type StatCardProps = {
  icon: typeof BadgeCheck;
  label: string;
  value: number;
};

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gray-950">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-medium text-white/65">{label}</p>
    </div>
  );
}
