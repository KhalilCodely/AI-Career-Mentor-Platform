"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getAuth } from "@/lib/auth-client";

type DashboardData = {
  totals: {
    users: number;
    careerPaths: number;
    skills: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: string;
  }>;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    if (auth.user.role !== "ADMIN") {
      router.replace("/userboard");
      return;
    }

    const load = async () => {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        setError(json.error || "Failed to load admin dashboard");
        return;
      }

      setData(json.data);
    };

    void load();
  }, [router]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Overview of platform activity.</p>
        </div>
        <button onClick={() => { clearAuth(); router.push('/login'); }} className="rounded-md border px-3 py-1 text-sm">Logout</button>
      </div>

      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4"><p className="text-xs text-zinc-500">Users</p><p className="text-2xl font-semibold">{data?.totals.users ?? "-"}</p></div>
        <div className="rounded-xl border p-4"><p className="text-xs text-zinc-500">Career Paths</p><p className="text-2xl font-semibold">{data?.totals.careerPaths ?? "-"}</p></div>
        <div className="rounded-xl border p-4"><p className="text-xs text-zinc-500">Skills</p><p className="text-2xl font-semibold">{data?.totals.skills ?? "-"}</p></div>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Recent users</h2>
        <div className="space-y-2">
          {data?.recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
              <span className="text-xs">{user.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
