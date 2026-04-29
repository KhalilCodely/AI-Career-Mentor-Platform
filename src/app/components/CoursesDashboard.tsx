"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { getAuth } from "@/lib/auth-client";

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skillId: string;
  skill: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    } | null;
  };
  userProgress: {
    id: string;
    userId: string;
    courseId: string;
    completed: boolean;
    progress: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type CoursesResponse = {
  success: boolean;
  data: Course[];
  count?: number;
  error?: string;
};

export default function CoursesDashboard() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();

    if (!auth) {
      router.replace("/login");
      return;
    }

    const loadCourses = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/courses?userId=${encodeURIComponent(auth.user.id)}`
        );
        const data = (await res.json()) as CoursesResponse;

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load courses");
        }

        setCourses(data.data || []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to load courses right now."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, [router]);

  const skills = useMemo(() => {
    const unique = new Set<string>();
    courses.forEach((course) => unique.add(course.skill.name));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const providers = useMemo(() => {
    const unique = new Set<string>();
    courses.forEach((course) => unique.add(course.provider));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const visibleCourses = useMemo(() => {
    const lower = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !lower ||
        course.title.toLowerCase().includes(lower) ||
        course.provider.toLowerCase().includes(lower) ||
        course.skill.name.toLowerCase().includes(lower);

      const matchesSkill = !skillFilter || course.skill.name === skillFilter;
      const matchesProvider =
        !providerFilter || course.provider === providerFilter;

      return matchesSearch && matchesSkill && matchesProvider;
    });
  }, [courses, providerFilter, search, skillFilter]);

  const completedCount = useMemo(
    () => courses.filter((course) => course.userProgress?.completed).length,
    [courses]
  );

  const averageProgress = useMemo(() => {
    if (courses.length === 0) return 0;

    const total = courses.reduce(
      (sum, course) => sum + Number(course.userProgress?.progress || 0),
      0
    );

    return Math.round(total / courses.length);
  }, [courses]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-indigo-200 via-white to-blue-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <motion.div
        className="absolute w-[500px] h-[500px] bg-blue-500/30 blur-3xl rounded-full top-[-120px] left-[-120px]"
        animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] bg-purple-500/30 blur-3xl rounded-full bottom-[-120px] right-[-120px]"
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl rounded-3xl p-8 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border border-white/30 dark:border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Courses
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
              Browse recommended courses by provider, skill, and your current progress.
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-6 w-1/3 rounded-full bg-white/60 dark:bg-zinc-800 animate-pulse" />
            <div className="h-36 w-full rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
            <div className="h-36 w-full rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900/80">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Total courses
                </p>
                <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
                  {courses.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900/80">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Completed
                </p>
                <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
                  {completedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900/80">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Average progress
                </p>
                <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
                  {averageProgress}%
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${averageProgress}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
                  Search courses
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, provider, or skill..."
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
                  Skill
                </label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
                >
                  <option value="">All skills</option>
                  {skills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
                  Provider
                </label>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
                >
                  <option value="">All providers</option>
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {visibleCourses.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No courses found for the current filters.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {visibleCourses.map((course) => {
                  const progress = Math.min(
                    100,
                    Number(course.userProgress?.progress || 0)
                  );

                  return (
                    <motion.div
                      key={course.id}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-md dark:border-white/5 dark:bg-zinc-900/90"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                            {course.title}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {course.provider}
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                          {course.skill.name}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {course.skill.category?.name || "Uncategorized"}
                        </span>
                        {course.userProgress?.completed && (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <motion.a
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          href={course.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-md"
                        >
                          Open course
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </motion.a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
