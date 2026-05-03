"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAuth } from "@/lib/auth-client";

type CareerPath = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserCareerPath = {
  id: string;
  userId: string;
  careerPathId: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  careerPath: CareerPath;
};

type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  count?: number;
  error?: string;
};

type ApiSingleResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

export default function CareerPathDashboard() {
  const router = useRouter();

  const [allPaths, setAllPaths] = useState<CareerPath[]>([]);
  const [enrollments, setEnrollments] = useState<UserCareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const auth = getAuth();

    if (!auth) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [allRes, userRes] = await Promise.all([
          fetch("/api/career_path"),
          fetch(`/api/career_path?userId=${encodeURIComponent(auth.user.id)}`),
        ]);

        const allData = (await allRes.json()) as ApiListResponse<CareerPath>;
        const userData = (await userRes.json()) as ApiListResponse<UserCareerPath>;

        if (!allRes.ok || !allData.success) {
          throw new Error(allData.error || "Failed to load career paths");
        }

        if (!userRes.ok || !userData.success) {
          throw new Error(userData.error || "Failed to load your career paths");
        }

        setAllPaths(allData.data || []);
        setEnrollments(userData.data || []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to load career paths right now."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.careerPathId)),
    [enrollments]
  );

  const enrollmentByPathId = useMemo(
    () => new Map(enrollments.map((enrollment) => [enrollment.careerPathId, enrollment])),
    [enrollments]
  );

  const averageProgress = useMemo(() => {
    if (enrollments.length === 0) return 0;
    const total = enrollments.reduce((sum, e) => sum + Number(e.progress || 0), 0);
    return Math.round(total / enrollments.length);
  }, [enrollments]);

  const handleEnroll = async (careerPathId: string) => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    setActionLoadingId(careerPathId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/career_path/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth.user.id,
          careerPathId,
        }),
      });

      const data = (await res.json()) as ApiSingleResponse<UserCareerPath>;

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to enroll in career path");
      }

      setEnrollments((prev) => [...prev, data.data]);
      setSuccess(data.message || "Enrolled successfully");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to enroll right now."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnenroll = async (careerPathId: string) => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    setActionLoadingId(careerPathId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/career_path/unenroll", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth.user.id,
          careerPathId,
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to unenroll from career path");
      }

      setEnrollments((prev) =>
        prev.filter((e) => e.careerPathId !== careerPathId)
      );
      setSuccess(data.message || "Unenrolled successfully");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to unenroll right now."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleProgressChange = async (
    enrollment: UserCareerPath,
    newProgress: number
  ) => {
    const clamped = Math.min(100, Math.max(0, Math.round(newProgress)));

    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    const idKey = `${enrollment.careerPathId}-progress`;
    setActionLoadingId(idKey);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/career_path/progress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth.user.id,
          careerPathId: enrollment.careerPathId,
          progress: clamped,
        }),
      });

      const data = (await res.json()) as ApiSingleResponse<UserCareerPath>;

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update progress");
      }

      setEnrollments((prev) =>
        prev.map((e) =>
          e.careerPathId === enrollment.careerPathId ? data.data : e
        )
      );
      setSuccess(data.message || "Progress updated");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to update progress right now."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-indigo-200 via-white to-blue-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <motion.div
        className="absolute w-[500px] h-[500px] bg-blue-500/30 blur-3xl rounded-full top-[-120px] left-[-120px]"
        animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] bg-purple-500/30 blur-3xl rounded-full bottom-[-120px] right-[-120px]"
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl rounded-3xl p-8 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border border-white/30 dark:border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Career Paths Dashboard
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
              Track your enrolled career paths, update progress, and discover new options.
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            {success}
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-6 w-1/3 rounded-full bg-white/60 dark:bg-zinc-800 animate-pulse" />
            <div className="h-40 w-full rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
            <div className="h-40 w-full rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900/80">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Paths enrolled
                </p>
                <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
                  {enrollments.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900/80">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Average progress
                </p>
                <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
                  {averageProgress}%
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${averageProgress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900/80">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Available paths
                </p>
                <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
                  {allPaths.length}
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  My Career Paths
                </h2>
              </div>

              {enrollments.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  You are not enrolled in any career paths yet. Explore the paths
                  below and enroll to start your journey.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {enrollments.map((enrollment) => {
                    const busyId = `${enrollment.careerPathId}-progress`;
                    const isBusy = actionLoadingId === busyId;

                    return (
                      <motion.div
                        key={enrollment.id}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-md dark:border-white/5 dark:bg-zinc-900/90"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                              {enrollment.careerPath.title}
                            </h3>
                            {enrollment.careerPath.description && (
                              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                                {enrollment.careerPath.description}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                            Enrolled
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(Number(enrollment.progress))}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${Math.min(100, Number(enrollment.progress))}%` }}
                            />
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={Math.round(Number(enrollment.progress))}
                            onChange={(e) =>
                              handleProgressChange(
                                enrollment,
                                Number(e.target.value)
                              )
                            }
                            className="mt-3 w-full accent-blue-500"
                            disabled={isBusy}
                          />
                        </div>

                        <div className="mt-4 flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={actionLoadingId === enrollment.careerPathId}
                            onClick={() => handleUnenroll(enrollment.careerPathId)}
                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-100 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
                          >
                            {actionLoadingId === enrollment.careerPathId
                              ? "Unenrolling..."
                              : "Unenroll"}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Explore Career Paths
                </h2>
              </div>

              {allPaths.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No career paths are available yet. Check back soon.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {allPaths.map((path) => {
                    const isEnrolled = enrolledIds.has(path.id);
                    const isBusy = actionLoadingId === path.id;
                    const enrollment = enrollmentByPathId.get(path.id);
                    const enrollmentProgress = enrollment
                      ? Math.min(100, Math.max(0, Math.round(Number(enrollment.progress))))
                      : 0;

                    return (
                      <motion.div
                        key={path.id}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-md dark:border-white/5 dark:bg-zinc-900/90"
                      >
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                          {path.title}
                        </h3>
                        {path.description && (
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                            {path.description}
                          </p>
                        )}

                        {isEnrolled && (
                          <div className="mt-4">
                            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: `${enrollmentProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {isEnrolled ? `Enrolled · ${enrollmentProgress}% complete` : "Not enrolled yet"}
                          </span>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isBusy}
                            onClick={() =>
                              isEnrolled
                                ? handleUnenroll(path.id)
                                : handleEnroll(path.id)
                            }
                            className={`rounded-xl px-4 py-2 text-xs font-medium shadow-md transition disabled:opacity-60 ${
                              isEnrolled
                                ? "border border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            }`}
                          >
                            {isBusy
                              ? isEnrolled
                                ? "Updating..."
                                : "Enrolling..."
                              : isEnrolled
                              ? "Unenroll"
                              : "Enroll"}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </motion.div>
    </div>
  );
}

