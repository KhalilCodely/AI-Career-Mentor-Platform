"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, BookOpen } from "lucide-react";

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill?: {
    name: string;
    category?: {
      name: string;
    } | null;
  } | null;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch("/api/courses", { credentials: "include" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load courses");
        }

        setCourses(data);
      } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Failed to load courses";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="text-gray-600 mt-1">Senior-style curated learning paths to grow faster.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && courses.length === 0 && (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          No courses found yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((course) => (
          <article
            key={course.id}
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold leading-snug">{course.title}</h2>
              <BookOpen className="text-gray-400" size={18} />
            </div>

            <p className="mt-2 text-sm text-gray-600">{course.provider}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {course.skill?.name && (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">{course.skill.name}</span>
              )}
              {course.skill?.category?.name && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{course.skill.category.name}</span>
              )}
            </div>

            <a
              href={course.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
            >
              Start course
              <ExternalLink size={14} />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
