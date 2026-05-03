"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAuth } from "@/lib/auth-client";

type Skill = {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
};

type SkillsResponse = {
  success: boolean;
  data: Skill[];
  count?: number;
  error?: string;
};

type CreateSkillResponse = {
  success: boolean;
  data?: Skill;
  message?: string;
  error?: string;
};

const buildSkillLearnInfo = (skill: Skill) => {
  const fallbackDescription = `Build practical knowledge in ${skill.name} with beginner-friendly tutorials and projects.`;
  const slug = encodeURIComponent(skill.name);

  const curatedByCategory: Record<string, { description: string; link: string; label: string }> = {
    frontend: {
      description: "Learn to build interactive UI with modern HTML, CSS, JavaScript, and frameworks.",
      link: `https://www.freecodecamp.org/news/search/?query=${slug}`,
      label: "Frontend guide",
    },
    backend: {
      description: "Understand APIs, databases, authentication, and server-side architecture.",
      link: `https://roadmap.sh/backend`,
      label: "Backend roadmap",
    },
    devops: {
      description: "Master CI/CD, containers, cloud deployment, and monitoring fundamentals.",
      link: `https://roadmap.sh/devops`,
      label: "DevOps roadmap",
    },
    data: {
      description: "Practice data cleaning, visualization, SQL, and analytical storytelling.",
      link: `https://www.kaggle.com/learn`,
      label: "Kaggle learning",
    },
  };

  const categoryKey = (skill.category || "").toLowerCase();
  const matchedCategory = Object.keys(curatedByCategory).find((key) => categoryKey.includes(key));
  if (matchedCategory) {
    return curatedByCategory[matchedCategory];
  }

  return {
    description: fallbackDescription,
    link: `https://www.coursera.org/search?query=${slug}`,
    label: `Learn ${skill.name}`,
  };
};

export default function SkillsDashboard() {
  const router = useRouter();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [createName, setCreateName] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    if (!auth) {
      router.replace("/login");
      return;
    }

    setIsAdmin(auth.user.role === "ADMIN");

    const loadSkills = async (category?: string) => {
      setLoading(true);
      setError("");

      try {
        const url = category
          ? `/api/skills?category=${encodeURIComponent(category)}`
          : "/api/skills";

        const res = await fetch(url);
        const data = (await res.json()) as SkillsResponse;

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load skills");
        }

        setSkills(data.data || []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to load skills right now."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadSkills();
  }, [router]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    skills.forEach((s) => {
      if (s.category) {
        unique.add(s.category);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [skills]);

  const visibleSkills = useMemo(() => {
    const lower = search.trim().toLowerCase();
    if (!lower) return skills;
    return skills.filter((s) =>
      s.name.toLowerCase().includes(lower)
    );
  }, [skills, search]);

  const handleCategoryChange = async (value: string) => {
    setFilterCategory(value);
    setError("");
    setSuccess("");

    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    setLoading(true);

    try {
      const url = value
        ? `/api/skills?category=${encodeURIComponent(value)}`
        : "/api/skills";

      const res = await fetch(url);
      const data = (await res.json()) as SkillsResponse;

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load skills");
      }

      setSkills(data.data || []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to change category filter."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    if (!createName.trim()) {
      setError("Skill name is required.");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: createName.trim(),
          category: createCategory.trim() || undefined,
        }),
      });

      const data = (await res.json()) as CreateSkillResponse;

      if (!res.ok || !data.success || !data.data) {
        throw new Error(
          data.error ||
            "Failed to create skill. Only admins can create new skills."
        );
      }

      if (!filterCategory || data.data.category === filterCategory) {
        setSkills((prev) => [...prev, data.data as Skill].sort((a, b) =>
          a.name.localeCompare(b.name)
        ));
      }

      setCreateName("");
      setCreateCategory("");
      setSuccess(data.message || "Skill created successfully");
      setShowCreateModal(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to create skill right now."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-100 via-white to-zinc-100 p-4 dark:from-zinc-900 dark:via-zinc-950 dark:to-black md:p-6">
      {/* Background blobs */}
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

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto w-full max-w-6xl rounded-3xl border border-white/30 bg-white/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70 md:p-8"
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-zinc-900 via-blue-700 to-purple-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:via-blue-300 dark:to-purple-300">
              Skills Management
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
              Browse your skill library, hover for learning guidance, and curate your growth path.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:items-center">
            <div className="rounded-xl border border-white/40 bg-white/70 px-3 py-2 font-medium text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-200">
              Total Skills: <span className="text-blue-600 dark:text-blue-300">{skills.length}</span>
            </div>
            <div className="rounded-xl border border-white/40 bg-white/70 px-3 py-2 font-medium text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-200">
              Categories: <span className="text-purple-600 dark:text-purple-300">{categories.length}</span>
            </div>
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

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            {success}
          </motion.div>
        )}

        {/* Controls */}
        <div className="mb-6 grid gap-4 md:grid-cols-[2fr,1.5fr,auto] items-end">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
              Search skills
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to filter by name..."
              className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-md"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-sm">
                  +
                </span>
                Add new skill
              </motion.button>
            </div>
          )}
        </div>

        {/* Skills grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-28 rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
            <div className="h-28 rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
            <div className="h-28 rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
            <div className="h-28 rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
          </div>
        ) : visibleSkills.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No skills found for the current filters.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleSkills.map((skill) => (
              <motion.div
                key={skill.id}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-5 shadow-md transition-all duration-300 hover:shadow-xl dark:border-white/5 dark:bg-zinc-900/90"
              >
                {(() => {
                  const learnInfo = buildSkillLearnInfo(skill);
                  return (
                    <>
                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-blue-400/20 blur-2xl dark:bg-blue-500/20" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                      {skill.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Created{" "}
                      {new Date(skill.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {skill.category || "Uncategorized"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">✨ Guided</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">🎯 Practical</span>
                </div>
                <div className="mt-3 hidden rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-3 text-xs text-zinc-700 transition group-hover:block dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200">
                  <p className="mb-2">{learnInfo.description}</p>
                  <a
                    href={learnInfo.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 font-medium text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span aria-hidden>📘</span>
                    <span>{learnInfo.label}</span>
                    <span aria-hidden>↗</span>
                  </a>
                </div>
                    </>
                  );
                })()}
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Skill Modal */}
        {isAdmin && showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="w-full max-w-md rounded-3xl border border-white/30 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-950/90"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Add new skill
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCreateSkill} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Skill name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, TypeScript, Product Management"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend, Backend, Soft Skills"
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={creating}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md disabled:opacity-60"
                >
                  {creating ? "Creating skill..." : "Create skill"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
