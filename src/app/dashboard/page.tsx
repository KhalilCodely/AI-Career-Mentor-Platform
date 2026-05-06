"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedRoadmap = {
  id: string;
  careerPathId: string;
  title: string;
  description: string | null;
  progress: number;
};

type RoadmapListResponse = {
  success?: boolean;
  data?: SavedRoadmap[];
  error?: string;
};

export default function Dashboard() {
  const [roadmap, setRoadmap] = useState<SavedRoadmap | null>(null);

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        const res = await fetch("/api/roadmap", { credentials: "include" });

        if (res.status === 401) return;

        const data = await res.json() as RoadmapListResponse;
        if (res.ok) {
          setRoadmap(data.data?.[0] || null);
        }
      } catch (error) {
        console.error("Failed to load dashboard roadmap progress", error);
      }
    };

    loadRoadmap();
  }, []);

  const roadmapProgress = roadmap?.progress || 0;

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">
        Welcome to your Dashboard 🚀
      </h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Courses</h2>
          <p className="text-sm text-gray-500">
            Track your learning progress
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Skills</h2>
          <p className="text-sm text-gray-500">
            Manage your skills
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Profile</h2>
          <p className="text-sm text-gray-500">
            Update your info
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Roadmap</h2>
            <span className="text-sm font-semibold text-gray-700">
              {roadmapProgress}%
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {roadmap ? roadmap.description || roadmap.title : "Generate your career roadmap"}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-black transition-all"
              style={{ width: `${roadmapProgress}%` }}
            />
          </div>
          <Link
            href="/dashboard/roadmap"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            {roadmap ? "View roadmap" : "Create roadmap"} →
          </Link>
        </div>

      </div>

    </div>
  );
}
