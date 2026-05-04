"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

type Milestone = {
  order: number;
  title: string;
  description: string;
  focusSkills: string[];
  done: boolean;
};

type CareerPathPayload = {
  assignmentId: string;
  progress: number;
  careerPath: {
    id: string;
    title: string;
    description: string | null;
    roadmap: {
      milestones?: Milestone[];
      targetRole?: string;
      estimatedWeeks?: number;
    };
  };
};

export default function RoadmapPage() {
  const [data, setData] = useState<CareerPathPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadPath = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/career-path", { credentials: "include" });
      const json = await res.json();
      setData(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPath();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const milestones = useMemo(() => data?.careerPath?.roadmap?.milestones ?? [], [data]);

  const generatePath = async () => {
    setBusy(true);
    try {
      const profileRes = await fetch("/api/profile", { credentials: "include" });
      const profileJson = await profileRes.json();
      const profile = profileJson?.data;

      const goal = profile?.careerGoal || "Software Engineer";
      const level = profile?.experienceLevel || "Beginner";

      const res = await fetch("/api/career-paths/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ careerGoal: goal, experienceLevel: level }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      await loadPath();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to generate career path");
    } finally {
      setBusy(false);
    }
  };

  const updateProgress = async (nextProgress: number) => {
    if (!data) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/user/career-path/${data.assignmentId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ progress: nextProgress }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      setData({ ...data, progress: nextProgress });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update progress");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-6"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Career Roadmap</h1>
          <p className="text-gray-500">Generate and track your personalized path.</p>
        </div>
        <button onClick={generatePath} disabled={busy} className="px-4 py-2 bg-black text-white rounded-lg">
          {busy ? "Working..." : "Generate Path"}
        </button>
      </div>

      {!data ? (
        <div className="border rounded-xl p-6 bg-white">No roadmap yet. Click “Generate Path”.</div>
      ) : (
        <>
          <div className="border rounded-xl p-6 bg-white space-y-2">
            <h2 className="text-xl font-semibold">{data.careerPath.title}</h2>
            <p className="text-sm text-gray-600">{data.careerPath.description}</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="h-3 bg-black rounded-full" style={{ width: `${data.progress}%` }} />
            </div>
            <p className="text-sm text-gray-600">Progress: {data.progress}%</p>
            <button
              onClick={() => updateProgress(Math.min(100, data.progress + 20))}
              disabled={busy}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              Mark Next Milestone Done (+20%)
            </button>
          </div>

          <div className="grid gap-4">
            {milestones.map((milestone) => (
              <div key={milestone.order} className="border rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500">Step {milestone.order}</p>
                <h3 className="font-semibold">{milestone.title}</h3>
                <p className="text-sm text-gray-600">{milestone.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {milestone.focusSkills.map((skill) => (
                    <span key={skill} className="text-xs px-2 py-1 bg-gray-100 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
