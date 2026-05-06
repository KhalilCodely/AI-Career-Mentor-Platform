"use client";

import { useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  icon?: string | null;
  skill: {
    name: string;
  };
};

type ProgressRecord = {
  courseId: string;
  progress: number;
  completed: boolean;
};

type ProgressResponse = {
  success?: boolean;
  data?: ProgressRecord[];
  error?: string;
};

type ApiErrorResponse = {
  error?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Progress update failed";
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/progress", { credentials: "include" }),
        ]);

        const coursesData = await coursesRes.json() as Course[] | ApiErrorResponse;

        if (!coursesRes.ok || !Array.isArray(coursesData)) {
          throw new Error(
            Array.isArray(coursesData) ? "Failed to load courses" : coursesData.error || "Failed to load courses"
          );
        }

        setCourses(coursesData);

        if (progressRes.status !== 401) {
          const progressData = await progressRes.json() as ProgressResponse;

          if (!progressRes.ok) {
            throw new Error(progressData.error || "Failed to load progress");
          }

          const savedProgress = Object.fromEntries(
            (progressData.data || []).map((record) => [record.courseId, record.progress])
          );

          setProgressMap(savedProgress);
        }
      } catch (err) {
        console.error("Failed to load courses", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const updateProgress = async (courseId: string, value: number) => {
    const previousProgress = progressMap[courseId] || 0;

    // ✅ instant UI update
    setProgressMap((prev) => ({
      ...prev,
      [courseId]: value,
    }));
    setError("");

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          courseId,
          progress: value,
        }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Progress update failed");
      }
    } catch (err) {
      console.error("Progress update failed", err);
      setProgressMap((prev) => ({
        ...prev,
        [courseId]: previousProgress,
      }));
      setError(getErrorMessage(err));
    }
  };

  // ✅ Loading state
  if (loading) {
    return <div className="p-6 text-center">Loading courses...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">🎓 Courses</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const progress = progressMap[course.id] || 0;

          return (
            <div
              key={course.id}
              className="p-4 border rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* ICON */}
              <div className="text-3xl mb-2">
                {course.icon || "📘"}
              </div>

              {/* TITLE */}
              <h2 className="font-semibold text-lg">
                {course.title}
              </h2>

              {/* SKILL */}
              <p className="text-sm text-gray-500 mb-2">
                {course.skill.name}
              </p>

              {/* PROGRESS */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  className="w-full"
                  onChange={(e) =>
                    updateProgress(course.id, Number(e.target.value))
                  }
                />

                {progress === 100 && (
                  <p className="text-green-600 text-xs mt-1">
                    ✅ Completed
                  </p>
                )}
              </div>

              {/* LINK */}
              <a
                href={course.url}
                target="_blank"
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Go to course →
              </a>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {courses.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          No courses available
        </div>
      )}
    </div>
  );
}
