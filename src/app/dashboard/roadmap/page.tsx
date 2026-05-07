"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  MapIcon,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

type CourseSnapshot = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: string;
  category: string;
  progress: number;
};

type RoadmapPhase = {
  title: string;
  timeframe: string;
  focus: string;
  goals: string[];
  milestones: string[];
  courses: CourseSnapshot[];
};

type RoadmapGenerator = "AI" | "Template fallback";

type RoadmapContent = {
  targetRole: string;
  experienceLevel: string;
  summary: string;
  strengths: string[];
  skillGaps: string[];
  phases: RoadmapPhase[];
  nextActions: string[];
  generatedAt: string;
  generatedBy?: RoadmapGenerator;
};

type RoadmapData = {
  id: string;
  careerPathId: string;
  title: string;
  description: string;
  progress: number;
  updatedAt: string;
  roadmap: RoadmapContent | null;
};

type RoadmapResponse = {
  success: boolean;
  data?: RoadmapData | null;
  error?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function formatDate(value?: string) {
  if (!value) return "Not generated yet";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function collectCourses(phases: RoadmapPhase[]) {
  const courseMap = new Map<string, CourseSnapshot>();

  phases.forEach((phase) => {
    phase.courses.forEach((course) => {
      courseMap.set(course.id, course);
    });
  });

  return Array.from(courseMap.values());
}

const roadmapInputs = [
  { label: "Profile", description: "Career goal, education, bio, and experience level" },
  { label: "Skills", description: "Selected strengths and target skills" },
  { label: "Courses", description: "Matching resources from your course catalog" },
  { label: "Progress", description: "Saved completion percentages for course prioritization" },
  { label: "AI", description: "OpenAI-generated plan with a safe template fallback" },
];

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        const res = await fetch("/api/roadmap", {
          credentials: "include",
        });
        const data = (await res.json()) as RoadmapResponse;

        if (!res.ok) throw new Error(data.error || "Failed to load roadmap");

        setRoadmap(data.data || null);
      } catch (err) {
        console.error(err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, []);

  const generateRoadmap = async () => {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as RoadmapResponse;

      if (!res.ok || !data.data) {
        throw new Error(data.error || "Failed to generate roadmap");
      }

      setRoadmap(data.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const content = roadmap?.roadmap;
  const generatedBy = content?.generatedBy || "Template fallback";
  const recommendedCourses = useMemo(
    () => (content ? collectCourses(content.phases) : []),
    [content]
  );
  const averageCourseProgress = useMemo(() => {
    if (!recommendedCourses.length) return 0;

    const total = recommendedCourses.reduce((sum, course) => sum + course.progress, 0);
    return Math.round(total / recommendedCourses.length);
  }, [recommendedCourses]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
          <Loader2 className="h-5 w-5 animate-spin text-black" />
          Loading roadmap...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-black text-white shadow-sm">
        <div className="relative px-6 py-8 md:px-8">
          <div className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 ring-1 ring-white/15">
                <Sparkles className="h-4 w-4" />
                AI roadmap workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Turn your profile into a 90-day career plan
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/70 md:text-base">
                Generate a personalized AI roadmap from your career goal, selected
                skills, course catalog, and saved learning progress.
              </p>
            </div>

            <button
              onClick={generateRoadmap}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : roadmap ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {roadmap ? "Regenerate roadmap" : "Generate roadmap"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        {roadmapInputs.map((input) => (
          <div
            key={input.label}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-bold text-gray-950">{input.label}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">{input.description}</p>
          </div>
        ))}
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {!content ? (
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-950 text-white">
            <MapIcon className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-gray-950">
            No roadmap generated yet
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Complete your profile and select skills first for the best results,
            then generate a roadmap to get phase-by-phase goals, milestones, and
            course recommendations.
          </p>
          <button
            onClick={generateRoadmap}
            disabled={generating}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate my roadmap
          </button>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Target role</p>
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-3 text-xl font-bold text-gray-950">{content.targetRole}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Experience</p>
                <Trophy className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-3 text-xl font-bold text-gray-950">{content.experienceLevel}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Course progress</p>
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-3 text-xl font-bold text-gray-950">{averageCourseProgress}%</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">AI engine</p>
                <Clock3 className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-3 text-xl font-bold text-gray-950">{generatedBy}</p>
              <p className="mt-1 text-xs font-semibold text-gray-400">Updated {formatDate(roadmap?.updatedAt)}</p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-5">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h2 className="text-xl font-bold text-gray-950">Mentor summary</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{content.summary}</p>
              </div>

              {content.phases.map((phase, index) => (
                <article
                  key={phase.title}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200"
                >
                  <div className="border-b border-gray-100 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">
                          Phase {index + 1} · {phase.timeframe}
                        </div>
                        <h3 className="mt-3 text-2xl font-bold text-gray-950">{phase.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-500">{phase.focus}</p>
                      </div>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                        <MapIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 lg:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-gray-400">Goals</h4>
                      <div className="mt-3 space-y-3">
                        {phase.goals.map((goal) => (
                          <div key={goal} className="flex gap-3 text-sm leading-6 text-gray-700">
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-gray-400">Milestones</h4>
                      <div className="mt-3 space-y-3">
                        {phase.milestones.map((milestone) => (
                          <div key={milestone} className="flex gap-3 text-sm leading-6 text-gray-700">
                            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{milestone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {phase.courses.length ? (
                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                        <BookOpen className="h-4 w-4" />
                        Suggested courses
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {phase.courses.map((course) => (
                          <a
                            key={course.id}
                            href={course.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl bg-white p-4 text-left ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <p className="text-sm font-bold text-gray-950">{course.title}</p>
                            <p className="mt-1 text-xs font-semibold text-gray-500">
                              {course.provider} · {course.skill}
                            </p>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-black"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <p className="mt-2 text-xs font-semibold text-gray-400">
                              {course.progress}% complete
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h3 className="text-lg font-bold text-gray-950">Current strengths</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.strengths.length ? (
                    content.strengths.map((skill) => (
                      <span key={skill} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-gray-500">
                      Select skills to make this section more personalized.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h3 className="text-lg font-bold text-gray-950">Skill gaps to close</h3>
                <div className="mt-4 space-y-3">
                  {content.skillGaps.length ? (
                    content.skillGaps.map((skill) => (
                      <div key={skill} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-black" />
                        <p className="text-sm font-semibold text-gray-700">{skill}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-gray-500">
                      No major gaps found from your current goal and selected skills.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-black p-6 text-white shadow-sm">
                <h3 className="text-lg font-bold">Next actions</h3>
                <div className="mt-4 space-y-4">
                  {content.nextActions.map((action) => (
                    <div key={action} className="flex gap-3 text-sm leading-6 text-white/75">
                      <Sparkles className="mt-1 h-4 w-4 shrink-0 text-white" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}
