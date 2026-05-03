"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type RoadmapStep = {
  phase: string;
  focus: string;
  skills: string[];
};

type CareerPath = {
  id?: string;
  title: string;
  description: string | null;
  roadmap: RoadmapStep[];
};

type CareerPathResponse = {
  success: boolean;
  data: CareerPath[];
  error?: string;
};

export default function CareerPathDashboard() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [selected, setSelected] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPaths = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/career_path");
        const data = (await res.json()) as CareerPathResponse;

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load career paths");
        }

        setPaths(data.data ?? []);
        setSelected((data.data ?? [])[0] ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load career paths right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadPaths();
  }, []);

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-blue-100 p-6 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">Career Roadmap Preview</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">Pick a career path to preview the roadmap phases and key skills.</p>

      {error && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-white/60 dark:bg-zinc-900/70" />
      ) : paths.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          No career paths found yet. Ask an admin to seed career paths so roadmap previews can appear.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          <aside className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            {paths.map((path) => (
              <button
                key={path.id ?? path.title}
                type="button"
                onClick={() => setSelected(path)}
                className={`mb-2 w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  selected?.title === path.title
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {path.title}
              </button>
            ))}
          </aside>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">{selected?.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{selected?.description ?? "No description available."}</p>

            {selected?.roadmap?.length ? (
              <div className="mt-6 space-y-4">
                {selected.roadmap.map((step) => (
                  <motion.div key={step.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{step.phase}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{step.focus}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">{skill}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-zinc-500">This path does not include roadmap steps yet.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
