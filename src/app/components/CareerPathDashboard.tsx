"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth-client";

type Recommendation = {
  type: "skill" | "course" | "career";
  title: string;
  url: string;
  reason: string;
};

type RoadmapStep = {
  phase: string;
  focus: string;
  skills: string[];
  aiRecommendations: Recommendation[];
};

type CareerPath = {
  id: string;
  title: string;
  description: string | null;
  roadmap?: RoadmapStep[];
};

type UserEnrollment = {
  id: string;
  userId: string;
  careerPathId: string;
  progress: string;
  careerPath: CareerPath;
};

export default function CareerPathDashboard() {
  const router = useRouter();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [enrolled, setEnrolled] = useState<UserEnrollment[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [goal, setGoal] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [allPathsRes, enrolledRes] = await Promise.all([
        fetch("/api/career_path"),
        fetch(`/api/career_path?userId=${encodeURIComponent(auth.user.id)}`),
      ]);

      const allPathsJson = await allPathsRes.json();
      const enrolledJson = await enrolledRes.json();

      if (!allPathsRes.ok || !allPathsJson.success) {
        throw new Error(allPathsJson.error || "Failed to load career paths");
      }

      if (!enrolledRes.ok || !enrolledJson.success) {
        throw new Error(enrolledJson.error || "Failed to load enrolled paths");
      }

      setPaths(allPathsJson.data || []);
      setEnrolled(enrolledJson.data || []);

      if (!selectedPath && allPathsJson.data?.length) {
        setSelectedPath(allPathsJson.data[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load career path data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enrolledPathIds = useMemo(() => new Set(enrolled.map((e) => e.careerPathId)), [enrolled]);

  const enrollPath = async (careerPathId: string) => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/career_path/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.user.id, careerPathId }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to enroll in career path");
      }

      setSuccess("Enrolled successfully.");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to enroll in career path.");
    } finally {
      setBusy(false);
    }
  };

  const generateRoadmap = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    if (goal.trim().length < 3) {
      setError("Please enter a meaningful goal (minimum 3 characters).");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const currentSkillsList = currentSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const res = await fetch("/api/career_path/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          careerGoal: goal.trim(),
          experienceLevel,
          currentSkills: currentSkillsList,
          constraints: constraints.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate roadmap");
      }

      setGoal("");
      setCurrentSkills("");
      setConstraints("");
      setSuccess("Roadmap generated and enrolled successfully.");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to generate roadmap.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Career Path Planner</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">Enroll in curated career paths or generate a custom roadmap from your own goal.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <form onSubmit={generateRoadmap} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">Generate custom roadmap</label>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Career goal (e.g., Frontend Developer)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input
            value={currentSkills}
            onChange={(e) => setCurrentSkills(e.target.value)}
            placeholder="Current skills (comma separated)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Constraints (time, budget, etc.)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="mt-3">
          <button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            Generate
          </button>
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold mb-3">Career path catalog</h2>
          {loading ? <p className="text-sm text-zinc-500">Loading...</p> : (
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {paths.map((path) => {
                const isEnrolled = enrolledPathIds.has(path.id);
                return (
                  <div key={path.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{path.title}</p>
                        <p className="text-xs text-zinc-500 mt-1">{path.description || "No description"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedPath(path)} className="text-xs rounded-md border px-2 py-1">View</button>
                        <button disabled={busy || isEnrolled} onClick={() => enrollPath(path.id)} className="text-xs rounded-md bg-indigo-600 text-white px-2 py-1 disabled:opacity-50">{isEnrolled ? "Enrolled" : "Enroll"}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold mb-3">Roadmap preview</h2>
          {!selectedPath ? <p className="text-sm text-zinc-500">Select a path to view its roadmap.</p> : (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedPath.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{selectedPath.description}</p>
              </div>
              {(selectedPath.roadmap || []).map((step) => (
                <div key={step.phase} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                  <p className="text-sm font-semibold">{step.phase}</p>
                  <p className="text-xs text-zinc-500 mt-1">{step.focus}</p>
                  <p className="text-xs mt-2"><span className="font-semibold">Skills:</span> {step.skills.join(", ")}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
