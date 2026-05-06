"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Loader2,
  Map,
  RefreshCw,
  Target,
  UserRound,
} from "lucide-react";

type Profile = {
  bio: string;
  education: string;
  experienceLevel: string;
  careerGoal: string;
};

type ProfileResponse = {
  success?: boolean;
  data?: Profile;
  error?: string;
};

type UserSkill = {
  skill: {
    id: string;
    name: string;
    category?: {
      name: string;
    } | null;
  };
};

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: {
    name: string;
  };
};

type GeneratedRoadmapStep = {
  order: number;
  title: string;
  description: string;
  status: string;
};

type GeneratedRoadmapCourse = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: string;
};

type GeneratedRoadmap = {
  targetRole: string;
  experienceLevel: string;
  summary: string;
  currentSkills: string[];
  recommendedCourses: GeneratedRoadmapCourse[];
  steps: GeneratedRoadmapStep[];
};

type SavedRoadmap = {
  id: string;
  careerPathId: string;
  title: string;
  description: string | null;
  roadmap: GeneratedRoadmap | null;
  progress: number;
  updatedAt: string;
};

type RoadmapListResponse = {
  success?: boolean;
  data?: SavedRoadmap[];
  error?: string;
};

type RoadmapMutationResponse = {
  success?: boolean;
  data?: SavedRoadmap;
  error?: string;
  message?: string;
};

type RoadmapStep = {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: typeof UserRound;
  completed: boolean;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to load roadmap";
}

function isGeneratedRoadmap(value: unknown): value is GeneratedRoadmap {
  if (!value || typeof value !== "object") return false;

  const roadmap = value as Partial<GeneratedRoadmap>;
  return Array.isArray(roadmap.steps) && Array.isArray(roadmap.recommendedCourses);
}

export default function RoadmapPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [savedRoadmap, setSavedRoadmap] = useState<SavedRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadRoadmapData = async () => {
      try {
        const [profileRes, skillsRes, coursesRes, roadmapRes] = await Promise.all([
          fetch("/api/profile", { credentials: "include" }),
          fetch("/api/user/skills", { credentials: "include" }),
          fetch("/api/courses"),
          fetch("/api/roadmap", { credentials: "include" }),
        ]);

        const coursesData = await coursesRes.json() as Course[];
        setCourses(coursesData);

        if (profileRes.status !== 401) {
          const profileData = await profileRes.json() as ProfileResponse;

          if (!profileRes.ok) {
            throw new Error(profileData.error || "Failed to load profile");
          }

          setProfile(profileData.data || null);
        }

        if (skillsRes.status !== 401) {
          const skillsData = await skillsRes.json() as UserSkill[];

          if (!skillsRes.ok) {
            throw new Error("Failed to load skills");
          }

          setSkills(skillsData);
        }

        if (roadmapRes.status !== 401) {
          const roadmapData = await roadmapRes.json() as RoadmapListResponse;

          if (!roadmapRes.ok) {
            throw new Error(roadmapData.error || "Failed to load saved roadmap");
          }

          setSavedRoadmap(roadmapData.data?.[0] || null);
        }
      } catch (err) {
        console.error("ROADMAP LOAD ERROR:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadRoadmapData();
  }, []);

  const selectedSkillNames = useMemo(
    () => skills.map((userSkill) => userSkill.skill.name),
    [skills]
  );

  const localRecommendedCourses = useMemo(() => {
    if (selectedSkillNames.length === 0) return courses.slice(0, 4);

    const selectedSkills = new Set(selectedSkillNames);
    const matchingCourses = courses.filter((course) =>
      selectedSkills.has(course.skill.name)
    );

    return matchingCourses.slice(0, 4);
  }, [courses, selectedSkillNames]);

  const generatedRoadmap = isGeneratedRoadmap(savedRoadmap?.roadmap)
    ? savedRoadmap.roadmap
    : null;
  const generatedCourses = generatedRoadmap?.recommendedCourses || [];
  const recommendedCourses = generatedCourses.length > 0
    ? generatedCourses
    : localRecommendedCourses.map((course) => ({
        id: course.id,
        title: course.title,
        provider: course.provider,
        url: course.url,
        skill: course.skill.name,
      }));

  const roadmapSteps: RoadmapStep[] = [
    {
      title: "Complete your career profile",
      description: "Add your background, education, experience level, and target role.",
      href: "/dashboard/profile",
      action: "Update profile",
      icon: UserRound,
      completed: Boolean(profile?.careerGoal && profile?.experienceLevel),
    },
    {
      title: "Choose your current skills",
      description: "Tell Career Mentor what you already know so your plan starts at the right level.",
      href: "/dashboard/skills",
      action: "Manage skills",
      icon: Brain,
      completed: selectedSkillNames.length > 0,
    },
    {
      title: "Generate and save your roadmap",
      description: "Use your profile, skills, and course catalog to create a saved career roadmap.",
      href: "/dashboard/roadmap",
      action: savedRoadmap ? "Regenerate" : "Generate",
      icon: Map,
      completed: Boolean(savedRoadmap),
    },
    {
      title: "Follow recommended courses",
      description: "Use courses connected to your selected skills to close learning gaps.",
      href: "/dashboard/courses",
      action: "View courses",
      icon: BookOpen,
      completed: recommendedCourses.length > 0,
    },
    {
      title: "Build portfolio proof",
      description: "Turn your course progress into projects, case studies, and interview stories.",
      href: "/dashboard/courses",
      action: "Track progress",
      icon: Target,
      completed: Boolean(savedRoadmap && savedRoadmap.progress >= 100),
    },
  ];

  const completedSteps = roadmapSteps.filter((step) => step.completed).length;
  const readinessScore = savedRoadmap?.progress ?? Math.round((completedSteps / roadmapSteps.length) * 100);
  const targetRole = generatedRoadmap?.targetRole || profile?.careerGoal || "your target tech career";

  const generateRoadmap = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json() as RoadmapMutationResponse;

      if (!res.ok || !data.data) {
        throw new Error(data.error || "Failed to generate roadmap");
      }

      setSavedRoadmap(data.data);
      setSuccess(data.message || "Roadmap generated and saved successfully");
    } catch (err) {
      console.error("ROADMAP GENERATE ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const updateRoadmapProgress = async (progress: number) => {
    if (!savedRoadmap) return;

    const previousProgress = savedRoadmap.progress;
    setSavingProgress(true);
    setError("");
    setSuccess("");
    setSavedRoadmap((current) => current ? { ...current, progress } : current);

    try {
      const res = await fetch("/api/roadmap/progress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          careerPathId: savedRoadmap.careerPathId,
          progress,
        }),
      });
      const data = await res.json() as { error?: string; message?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to update roadmap progress");
      }

      setSuccess(data.message || "Roadmap progress updated");
    } catch (err) {
      console.error("ROADMAP PROGRESS UPDATE ERROR:", err);
      setSavedRoadmap((current) => current ? { ...current, progress: previousProgress } : current);
      setError(getErrorMessage(err));
    } finally {
      setSavingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-black p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <Map size={16} />
              Personalized roadmap
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">
              Roadmap to {targetRole}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-300 md:text-base">
              Generate a roadmap from your profile, selected skills, and courses.
              Your saved roadmap is stored in the database and connected to your account.
            </p>

            <button
              onClick={generateRoadmap}
              disabled={generating}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {savedRoadmap ? "Regenerate saved roadmap" : "Generate roadmap"}
            </button>
          </div>

          <div className="rounded-2xl bg-white p-5 text-black shadow-sm">
            <p className="text-sm text-gray-500">Roadmap progress</p>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-bold">{readinessScore}</span>
              <span className="pb-1 text-sm text-gray-500">%</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {savedRoadmap
                ? "Saved progress from your roadmap"
                : `${completedSteps} of ${roadmapSteps.length} setup steps complete`}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {savedRoadmap && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Saved roadmap progress</h2>
              <p className="text-sm text-gray-500">
                {savedRoadmap.description || savedRoadmap.title}
              </p>
            </div>

            <div className="min-w-full md:min-w-80">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{savedRoadmap.progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={savedRoadmap.progress}
                disabled={savingProgress}
                onChange={(event) => updateRoadmapProgress(Number(event.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {generatedRoadmap ? "Generated roadmap steps" : "Your next steps"}
              </h2>
              <p className="text-sm text-gray-500">
                {generatedRoadmap
                  ? generatedRoadmap.summary
                  : "Generate a roadmap to save a personalized plan."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {generatedRoadmap ? (
              generatedRoadmap.steps.map((step, index) => (
                <div
                  key={step.order}
                  className="flex gap-4 rounded-xl border p-4 transition hover:border-gray-400"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                      {step.order}
                    </div>
                    {index < generatedRoadmap.steps.length - 1 && (
                      <div className="mt-2 h-full min-h-8 w-px bg-gray-200" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{step.title}</h3>
                      {step.status === "ready" && (
                        <CheckCircle2 className="text-green-600" size={16} />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              roadmapSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-xl border p-4 transition hover:border-gray-400"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Icon size={18} />
                      </div>
                      {index < roadmapSteps.length - 1 && (
                        <div className="mt-2 h-full min-h-8 w-px bg-gray-200" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{step.title}</h3>
                            {step.completed && (
                              <CheckCircle2 className="text-green-600" size={16} />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {step.description}
                          </p>
                        </div>

                        {step.href === "/dashboard/roadmap" ? (
                          <button
                            onClick={generateRoadmap}
                            disabled={generating}
                            className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {generating ? "Generating..." : step.action}
                          </button>
                        ) : (
                          <Link
                            href={step.href}
                            className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                          >
                            {step.action}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Selected skills</h2>
            <p className="mt-1 text-sm text-gray-500">
              Skills currently shaping your roadmap.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedSkillNames.length > 0 ? (
                selectedSkillNames.slice(0, 10).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No skills selected yet. Add skills to personalize your roadmap.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Recommended courses</h2>
            <p className="mt-1 text-sm text-gray-500">
              Start with courses linked to your skills.
            </p>

            <div className="mt-4 space-y-3">
              {recommendedCourses.length > 0 ? (
                recommendedCourses.map((course) => (
                  <a
                    key={course.id}
                    href={course.url}
                    target="_blank"
                    className="block rounded-xl border p-3 transition hover:border-gray-400"
                  >
                    <p className="font-medium">{course.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {course.provider} • {course.skill}
                    </p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No courses available yet.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
