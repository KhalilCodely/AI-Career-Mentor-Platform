"use client";

import { useEffect, useState } from "react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // 🔐 replace with your session later
  const userId = "REPLACE_WITH_SESSION";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const updateProgress = async (courseId: string, value: number) => {
    // ✅ instant UI update
    setProgressMap((prev) => ({
      ...prev,
      [courseId]: value,
    }));

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          courseId,
          progress: value,
        }),
      });
    } catch (err) {
      console.error("Progress update failed", err);
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