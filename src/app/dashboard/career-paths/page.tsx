"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, Filter, Loader2, Route, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type CareerPath = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  durationWeeks: number | null;
  coreSkills: string[];
  weeklyCommitment: string | null;
  phases: { title: string; focus: string; outcome: string }[];
};

type CareerPathsResponse = {
  success?: boolean;
  data?: CareerPath[];
  error?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Career path request failed";
}

async function parseJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

export default function CareerPathsPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let ignore = false;

    const fetchPaths = async () => {
      try {
        const res = await fetch("/api/career-paths", { credentials: "include" });
        const data = await parseJson<CareerPathsResponse>(res);

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load career paths");
        }

        if (!ignore) {
          setPaths(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load career paths", err);

        if (!ignore) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPaths();

    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(paths.map((path) => path.category))).sort((a, b) => a.localeCompare(b));
  }, [paths]);

  const filteredPaths = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return paths.filter((path) => {
      const matchesCategory = category === "all" || path.category === category;
      const matchesSearch = !normalizedSearch || [
        path.title,
        path.description || "",
        path.category,
        ...path.coreSkills,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [category, paths, search]);

  const featuredPath = filteredPaths[0];

  const startPath = async (careerPathId: string) => {
    setSavingId(careerPathId);
    setError("");

    try {
      const res = await fetch("/api/career-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ careerPathId }),
      });
      const data = await parseJson<{ success?: boolean; error?: string }>(res);

      if (!res.ok || !data.success) {
        throw new Error(res.status === 401 ? "Log in to save a career path" : data.error || "Failed to save career path");
      }

      setSavedId(careerPathId);
      router.refresh();
    } catch (err) {
      console.error("Failed to save career path", err);
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white shadow-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Loading career paths...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl">
        <div className="relative p-6 md:p-8">
          <div className="absolute -right-8 top-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-blue-100 backdrop-blur">
                <Sparkles size={16} /> Seeded role paths · choose your direction
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Explore 20 career paths</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                Browse practical career directions seeded into the platform. Each path includes focus skills, phase outcomes, and a weekly commitment so you can pick a direction before generating a personalized roadmap.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-bold">{paths.length}</div>
                <div className="text-xs text-slate-300">Paths</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-xs text-slate-300">Tracks</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs text-slate-300">Phases each</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, category, or skill..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            />
          </label>

          <label className="relative block">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-9 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 lg:w-64"
            >
              <option value="all">All career tracks</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {featuredPath && (
        <section className="grid gap-4 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-4 shadow-sm lg:grid-cols-[0.85fr_1.15fr] lg:p-5">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
              <BriefcaseBusiness size={14} /> Featured match
            </div>
            <h2 className="text-2xl font-bold text-slate-950">{featuredPath.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{featuredPath.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredPath.coreSkills.slice(0, 5).map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{skill}</span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {featuredPath.phases.map((phase, index) => (
              <div key={`${phase.title}-${index}`} className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="font-bold text-slate-950">{phase.title}</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-600">{phase.focus}</p>
                <p className="mt-2 text-sm leading-5 text-slate-600">{phase.outcome}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPaths.map((path) => {
          const isSaving = savingId === path.id;
          const isSaved = savedId === path.id;

          return (
            <article key={path.id} className="group flex min-h-96 flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-950">
                  <Route size={24} />
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">{path.category}</span>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-950 transition group-hover:text-blue-700">{path.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{path.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {path.coreSkills.slice(0, 4).map((skill) => (
                    <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-gray-50 p-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock3 size={16} />
                  <span>{path.durationWeeks ? `${path.durationWeeks} weeks` : "Flexible"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 size={16} />
                  <span>{path.phases.length} phases</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => startPath(path.id)}
                disabled={isSaving}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : isSaved ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                {isSaving ? "Saving..." : isSaved ? "Saved to roadmap" : "Start this path"}
              </button>
            </article>
          );
        })}
      </section>

      {filteredPaths.length === 0 && (
        <div className="rounded-3xl border border-dashed bg-white p-10 text-center text-gray-500">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">🔎</div>
          <h2 className="text-lg font-semibold text-slate-950">No career paths found</h2>
          <p className="mt-1 text-sm">Try clearing search or choosing a different track.</p>
        </div>
      )}
    </div>
  );
}
