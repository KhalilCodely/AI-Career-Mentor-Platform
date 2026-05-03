"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth-client";

type UserProgressItem = {
  id: string;
  courseId: string;
  progress: number;
  completed: boolean;
};

export default function UserboardIndexPage() {
  const router = useRouter();
  const [progressItems, setProgressItems] = useState<UserProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.token) {
      router.replace("/login");
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user_progress", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setProgressItems(json.data || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const summary = useMemo(() => {
    const total = progressItems.length;
    const completed = progressItems.filter((item) => item.completed).length;
    const average = total === 0 ? 0 : Math.round(progressItems.reduce((acc, item) => acc + item.progress, 0) / total);
    return { total, completed, average };
  }, [progressItems]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Userboard Overview</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Track your learning progress at a glance.</p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading progress...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs uppercase text-zinc-500">Courses Started</p>
            <p className="mt-2 text-2xl font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs uppercase text-zinc-500">Courses Completed</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">{summary.completed}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs uppercase text-zinc-500">Average Progress</p>
            <p className="mt-2 text-2xl font-semibold text-blue-600">{summary.average}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
