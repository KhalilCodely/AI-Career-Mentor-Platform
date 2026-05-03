"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Search } from "lucide-react";
import { getAuth } from "@/lib/auth-client";

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  imageUrl: string | null;
  skillId: string;
  skill: {
    id: string;
    name: string;
    category: { id: string; name: string } | null;
  };
  userProgress: { completed: boolean; progress: number } | null;
};

export default function CoursesDashboard() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);

  // 🔍 search + filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all");

  // 🖼️ track broken images
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/courses?userId=${auth.user.id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load courses");
        }

        setCourses(data.data || []);
      } catch {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // 🔥 filter logic
  const visibleCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.provider.toLowerCase().includes(search.toLowerCase()) ||
        course.skill.name.toLowerCase().includes(search.toLowerCase());

      const isCompleted = course.userProgress?.completed;

      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && isCompleted) ||
        (filter === "incomplete" && !isCompleted);

      return matchesSearch && matchesFilter;
    });
  }, [courses, search, filter]);

  const handleCompletionToggle = async (course: Course) => {
    const auth = getAuth();
    if (!auth?.token) return router.replace("/login");

    const nextCompleted = !course.userProgress?.completed;

    setSavingCourseId(course.id);

    try {
      const res = await fetch("/api/user_progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          courseId: course.id,
          completed: nextCompleted,
          progress: nextCompleted ? 100 : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update progress");
      }

      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, userProgress: data.data } : c
        )
      );
    } catch {
      setError("Failed to update progress");
    } finally {
      setSavingCourseId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>

        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        {(["all", "completed", "incomplete"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-zinc-900"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* STATES */}
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}

      {/* GRID */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.map((course) => {
          const progress = Math.min(
            100,
            Number(course.userProgress?.progress || 0)
          );

          // 🖼️ optimize external image
          const safeImage = course.imageUrl
            ? `${course.imageUrl}&w=600&q=80`
            : null;

          return (
            <div
              key={course.id}
              className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition bg-white dark:bg-zinc-900"
            >
              {/* IMAGE */}
              <div className="relative h-36 w-full rounded-lg overflow-hidden bg-zinc-100">
                {safeImage && !imgError[course.id] ? (
                  <Image
                    src={safeImage}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                    unoptimized
                    onError={() =>
                      setImgError((prev) => ({
                        ...prev,
                        [course.id]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-zinc-400">
                    No image
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="mt-3 space-y-1">
                <h3 className="font-semibold line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-zinc-500">
                  {course.provider} • {course.skill.name}
                </p>
              </div>

              {/* PROGRESS */}
              <div className="mt-3">
                <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-zinc-500">
                  {course.userProgress?.completed
                    ? "Completed • 100%"
                    : `${Math.round(progress)}%`}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex justify-between items-center">
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm flex items-center gap-1"
                >
                  Open <ExternalLink className="h-4 w-4" />
                </a>

                <button
                  onClick={() => handleCompletionToggle(course)}
                  disabled={savingCourseId === course.id}
                  aria-pressed={Boolean(course.userProgress?.completed)}
                  className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 ${
                    course.userProgress?.completed
                      ? "bg-gray-600"
                      : "bg-emerald-600"
                  } text-white disabled:opacity-50`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {savingCourseId === course.id
                    ? "Saving..."
                    : course.userProgress?.completed
                    ? "Mark not completed"
                    : "Mark completed"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
