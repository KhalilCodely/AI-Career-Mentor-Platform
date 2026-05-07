"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Filter, Loader2, Search, Sparkles } from "lucide-react";

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  icon?: string | null;
  imageUrl?: string | null;
  skill: {
    id: string;
    name: string;
    category?: {
      name: string;
    } | null;
  };
};

type ProgressRecord = {
  courseId: string;
  progress: number;
  completed: boolean;
};

type ProgressResponse = {
  success?: boolean;
  data?: ProgressRecord[];
  error?: string;
};

type UserSkillSelection = {
  skillId: string;
};

type CourseFilter = "all" | "recommended";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Progress update failed";
}

async function parseJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CourseFilter>("all");
  const [skillFilter, setSkillFilter] = useState("all");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [coursesRes, progressRes, userSkillsRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/progress", { credentials: "include" }),
          fetch("/api/user-skills", { credentials: "include" }),
        ]);

        const coursesData = await parseJson<Course[] | { error?: string }>(coursesRes);

        if (!coursesRes.ok || !Array.isArray(coursesData)) {
          throw new Error(Array.isArray(coursesData) ? "Failed to load courses" : coursesData.error || "Failed to load courses");
        }

        setCourses(coursesData);

        if (progressRes.status !== 401) {
          const progressData = await parseJson<ProgressResponse>(progressRes);

          if (!progressRes.ok) {
            throw new Error(progressData.error || "Failed to load progress");
          }

          const savedProgress = Object.fromEntries(
            (progressData.data || []).map((record) => [record.courseId, record.progress])
          );

          setProgressMap(savedProgress);
        }

        if (userSkillsRes.status !== 401) {
          const userSkillsData = await parseJson<UserSkillSelection[] | { error?: string }>(userSkillsRes);

          if (!userSkillsRes.ok || !Array.isArray(userSkillsData)) {
            throw new Error(Array.isArray(userSkillsData) ? "Failed to load your skills" : userSkillsData.error || "Failed to load your skills");
          }

          setSelectedSkillIds(userSkillsData.map((skill) => skill.skillId));
        }
      } catch (err) {
        console.error("Failed to load courses", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const skillOptions = useMemo(() => {
    const uniqueSkills = new Map<string, string>();

    courses.forEach((course) => {
      uniqueSkills.set(course.skill.id, course.skill.name);
    });

    return Array.from(uniqueSkills.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch = !normalizedSearch || [
        course.title,
        course.provider,
        course.skill.name,
        course.skill.category?.name || "",
      ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesSkillFilter = skillFilter === "all" || course.skill.id === skillFilter;
      const matchesUserSkills = filter === "all" || selectedSkillIds.includes(course.skill.id);

      return matchesSearch && matchesSkillFilter && matchesUserSkills;
    });
  }, [courses, filter, search, selectedSkillIds, skillFilter]);

  const recommendedCount = useMemo(
    () => courses.filter((course) => selectedSkillIds.includes(course.skill.id)).length,
    [courses, selectedSkillIds]
  );

  const updateProgress = async (courseId: string, value: number) => {
    const previousProgress = progressMap[courseId] || 0;

    setProgressMap((prev) => ({
      ...prev,
      [courseId]: value,
    }));
    setError("");

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          courseId,
          progress: value,
        }),
      });

      const data = await parseJson<{ error?: string }>(res);

      if (!res.ok) {
        throw new Error(res.status === 401 ? "Log in to save course progress" : data.error || "Progress update failed");
      }
    } catch (err) {
      console.error("Progress update failed", err);
      setProgressMap((prev) => ({
        ...prev,
        [courseId]: previousProgress,
      }));
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Loading courses...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-blue-100">
              <Sparkles size={16} />
              Personalized course library
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">Explore courses for every skill</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
              View the full catalog, then switch to recommended courses that match the skills you selected in your profile.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-80">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">{courses.length}</div>
              <div className="text-xs text-slate-300">All courses</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">{recommendedCount}</div>
              <div className="text-xs text-slate-300">For your skills</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">{selectedSkillIds.length}</div>
              <div className="text-xs text-slate-300">Skills selected</div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by course, provider, or skill..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            />
          </label>

          <label className="relative block">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={skillFilter}
              onChange={(event) => setSkillFilter(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-9 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 lg:w-56"
            >
              <option value="all">All skills</option>
              {skillOptions.map((skill) => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-xl px-4 py-2 transition ${filter === "all" ? "bg-white text-slate-950 shadow-sm" : "text-gray-500 hover:text-slate-950"}`}
            >
              All courses
            </button>
            <button
              type="button"
              onClick={() => setFilter("recommended")}
              className={`rounded-xl px-4 py-2 transition ${filter === "recommended" ? "bg-white text-slate-950 shadow-sm" : "text-gray-500 hover:text-slate-950"}`}
            >
              My skills
            </button>
          </div>
        </div>
      </section>

      {filter === "recommended" && selectedSkillIds.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Select your skills on the Skills page to see personalized course recommendations. You can still switch back to All courses to browse the full catalog.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => {
          const progress = progressMap[course.id] || 0;
          const isRecommended = selectedSkillIds.includes(course.skill.id);

          return (
            <article
              key={course.id}
              className="group flex min-h-80 flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    {course.icon || "📘"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{course.provider}</p>
                    <p className="text-sm text-gray-500">{course.skill.category?.name || "Career skill"}</p>
                  </div>
                </div>

                {isRecommended && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <Sparkles size={13} /> Match
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-950 transition group-hover:text-blue-700">{course.title}</h2>
                <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  {course.skill.name}
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>

                <input
                  aria-label={`Update progress for ${course.title}`}
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  className="w-full accent-slate-950"
                  onChange={(event) => updateProgress(course.id, Number(event.target.value))}
                />

                {progress === 100 && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
                    <CheckCircle2 size={14} /> Completed
                  </p>
                )}
              </div>

              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <BookOpen size={16} /> Start course
              </a>
            </article>
          );
        })}
      </section>

      {filteredCourses.length === 0 && (
        <div className="rounded-3xl border border-dashed bg-white p-10 text-center text-gray-500">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">🔎</div>
          <h2 className="text-lg font-semibold text-slate-950">No courses found</h2>
          <p className="mt-1 text-sm">Try clearing search, choosing All skills, or switching to All courses.</p>
        </div>
      )}
    </div>
  );
}
