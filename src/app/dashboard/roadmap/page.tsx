"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  Map,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

type RoadmapCourse = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: string;
  category: string;
  progress: number;
  completed: boolean;
};

type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  focus: string;
  courses: RoadmapCourse[];
  progress: number;
};

type Roadmap = {
  title: string;
  description: string;
  careerGoal: string;
  experienceLevel: string;
  selectedSkills: { id: string; name: string; level: number; category: string }[];
  phases: RoadmapPhase[];
  overallProgress: number;
  generatedAt: string;
};

type RoadmapResponse = {
  success?: boolean;
  data?: {
    id: string;
    progress: number;
    updatedAt: string;
    careerPath: {
      id: string;
      title: string;
      description: string | null;
      roadmap: Roadmap | null;
    };
  } | null;
  error?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Roadmap request failed";
}

async function parseJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

function ProgressBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "emerald" | "violet" }) {
  const tones = {
    blue: "from-blue-500 to-cyan-400",
    emerald: "from-emerald-500 to-teal-400",
    violet: "from-violet-500 to-fuchsia-400",
  };

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${tones[tone]} transition-all duration-500`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const totalCourses = useMemo(
    () => roadmap?.phases.reduce((sum, phase) => sum + phase.courses.length, 0) || 0,
    [roadmap]
  );
  const completedCourses = useMemo(
    () => roadmap?.phases.reduce((sum, phase) => sum + phase.courses.filter((course) => course.completed).length, 0) || 0,
    [roadmap]
  );
  const nextCourse = useMemo(
    () => roadmap?.phases.flatMap((phase) => phase.courses).find((course) => !course.completed),
    [roadmap]
  );

  const generateRoadmap = async () => {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        credentials: "include",
      });
      const data = await parseJson<RoadmapResponse>(res);

      if (!res.ok) {
        throw new Error(res.status === 401 ? "Log in to generate a roadmap" : data.error || "Failed to generate roadmap");
      }

      setRoadmap(data.data?.careerPath.roadmap || null);
    } catch (err) {
      console.error("Failed to generate roadmap", err);
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialRoadmap = async () => {
      try {
        const res = await fetch("/api/roadmap", { credentials: "include" });
        const data = await parseJson<RoadmapResponse>(res);

        if (!res.ok) {
          throw new Error(res.status === 401 ? "Log in to view your roadmap" : data.error || "Failed to load roadmap");
        }

        if (!ignore) {
          setRoadmap(data.data?.careerPath.roadmap || null);
        }
      } catch (err) {
        console.error("Failed to load roadmap", err);

        if (!ignore) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialRoadmap();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white shadow-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Loading your roadmap...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white shadow-xl">
        <div className="relative p-6 md:p-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-blue-100 backdrop-blur">
                <Map size={16} /> Personalized roadmap
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                {roadmap ? roadmap.title : "Build your career roadmap"}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                {roadmap
                  ? roadmap.description
                  : "Generate a focused plan from your career goal, experience level, selected skills, matching courses, and saved course progress."}
              </p>
            </div>

            <button
              type="button"
              onClick={generateRoadmap}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {generating ? <Loader2 className="animate-spin" size={18} /> : roadmap ? <RefreshCw size={18} /> : <Sparkles size={18} />}
              {generating ? "Generating..." : roadmap ? "Regenerate roadmap" : "Generate roadmap"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!roadmap ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700">
            <Target size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-950">No saved roadmap yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Complete your profile and skills, then generate a roadmap. Your plan will be saved and this page will show phase and overall completion from your course progress.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Overall roadmap</p>
                <Trophy className="text-amber-500" size={20} />
              </div>
              <div className="mt-3 text-4xl font-bold text-slate-950">{roadmap.overallProgress}%</div>
              <div className="mt-4"><ProgressBar value={roadmap.overallProgress} tone="emerald" /></div>
            </div>

            <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Courses completed</p>
                <CheckCircle2 className="text-emerald-500" size={20} />
              </div>
              <div className="mt-3 text-4xl font-bold text-slate-950">{completedCourses}/{totalCourses}</div>
              <p className="mt-3 text-sm text-gray-500">Tracked from your course progress.</p>
            </div>

            <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Career target</p>
                <Target className="text-blue-500" size={20} />
              </div>
              <div className="mt-3 text-xl font-bold text-slate-950">{roadmap.careerGoal}</div>
              <p className="mt-3 text-sm text-gray-500">Experience level: {roadmap.experienceLevel}</p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
            <div className="space-y-5">
              {roadmap.phases.map((phase, index) => (
                <article key={phase.id} className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
                  <div className="border-b bg-slate-50/80 p-5 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                          <Clock3 size={14} /> {phase.focus}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-950">{phase.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500">{phase.description}</p>
                      </div>
                      <div className="min-w-40 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                          <span>Phase {index + 1}</span>
                          <span>{phase.progress}%</span>
                        </div>
                        <ProgressBar value={phase.progress} tone={index === 0 ? "blue" : index === 1 ? "violet" : "emerald"} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 p-5 md:p-6">
                    {phase.courses.map((course) => (
                      <div key={`${phase.id}-${course.id}`} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{course.skill}</span>
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{course.provider}</span>
                              {course.completed && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  <CheckCircle2 size={13} /> Complete
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-950">{course.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{course.category}</p>
                          </div>

                          <div className="grid gap-3 md:w-56">
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <ProgressBar value={course.progress} />
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              <BookOpen size={15} /> Open course
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="rounded-[2rem] border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950">Selected skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {roadmap.selectedSkills.length > 0 ? roadmap.selectedSkills.map((skill) => (
                    <span key={skill.id} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                      {skill.name} · L{skill.level}
                    </span>
                  )) : (
                    <p className="text-sm leading-6 text-gray-500">No selected skills yet. The roadmap used your career goal to find matching courses.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border bg-slate-950 p-5 text-white shadow-sm">
                <Sparkles className="text-cyan-300" size={24} />
                <h2 className="mt-3 text-lg font-bold">Next best action</h2>
                {nextCourse ? (
                  <>
                    <p className="mt-2 text-sm leading-6 text-slate-300">Continue {nextCourse.title} and update progress on the Courses page when you make progress.</p>
                    <a
                      href={nextCourse.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-50"
                    >
                      Start next <ArrowRight size={16} />
                    </a>
                  </>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-300">Every course in this roadmap is complete. Regenerate your roadmap when you are ready for the next challenge.</p>
                )}
              </div>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}
