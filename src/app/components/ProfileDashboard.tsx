"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAuth } from "@/lib/auth-client";

type ProfileRecord = {
  id: string;
  userId: string;
  bio: string | null;
  education: string | null;
  experienceLevel: string | null;
  careerGoal: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProfileResponse = {
  success: boolean;
  data: ProfileRecord | null;
  message?: string;
  error?: string;
};

export default function ProfileDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [careerGoal, setCareerGoal] = useState("");

  useEffect(() => {
    const auth = getAuth();

    if (!auth) {
      router.replace("/login");
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const data = (await res.json()) as ProfileResponse;

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load profile");
        }

        if (data.data) {
          setBio(data.data.bio || "");
          setEducation(data.data.education || "");
          setExperienceLevel(data.data.experienceLevel || "");
          setCareerGoal(data.data.careerGoal || "");
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to load profile right now."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          bio,
          education,
          experienceLevel,
          careerGoal,
        }),
      });

      const data = (await res.json()) as ProfileResponse;

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save profile");
      }

      setSuccess(data.message || "Profile saved successfully");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save profile right now."
      );
    } finally {
      setSaving(false);
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
        className="relative z-10 w-full max-w-3xl rounded-3xl p-8 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border border-white/30 dark:border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
      >
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 mb-6">
          Save your professional details so recommendations can be more personalized.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-20 w-full rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
            <div className="h-20 w-full rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
            <div className="h-20 w-full rounded-2xl bg-white/60 dark:bg-zinc-900 animate-pulse" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
                Experience level
              </label>
              <input
                type="text"
                value={experienceLevel}
                onChange={(event) => setExperienceLevel(event.target.value)}
                placeholder="Beginner, Intermediate, Senior..."
                className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
                Education
              </label>
              <textarea
                value={education}
                onChange={(event) => setEducation(event.target.value)}
                placeholder="Your degree, certifications, or relevant studies"
                rows={3}
                className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
                Career goal
              </label>
              <textarea
                value={careerGoal}
                onChange={(event) => setCareerGoal(event.target.value)}
                placeholder="What role are you aiming for next?"
                rows={3}
                className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Share a short summary about your background"
                rows={4}
                className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md disabled:opacity-60"
            >
              {saving ? "Saving profile..." : "Save profile"}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
