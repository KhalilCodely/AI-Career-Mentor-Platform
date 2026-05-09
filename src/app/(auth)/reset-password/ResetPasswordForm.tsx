"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing. Request a new password reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to reset password");
      }

      setPassword("");
      setConfirmPassword("");
      setMessage(data.message || "Password reset successfully");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.28),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]" />
      <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/90 shadow-2xl shadow-blue-950/30 backdrop-blur xl:grid-cols-[1fr_0.9fr]">
        <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white xl:flex">
          <div>
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
              <Sparkles className="h-4 w-4" />
              Career Mentor
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Choose a fresh password for your account.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Use a strong password that is unique to Career Mentor to protect your roadmap and profile.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["8+ characters", "Single-use link", "Secure update"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-semibold">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              Career Mentor
            </Link>

            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">New password</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Reset password</h2>
              <p className="mt-2 text-sm text-slate-500">Enter and confirm your new password.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <p>{message}</p>
                <Link href="/login" className="mt-3 inline-flex font-bold text-emerald-800 underline underline-offset-4">
                  Sign in with your new password
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">New password</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <LockKeyhole className="h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setError("");
                      setPassword(event.target.value);
                    }}
                    placeholder="Password (min 8 characters)"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm password</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <LockKeyhole className="h-5 w-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => {
                      setError("");
                      setConfirmPassword(event.target.value);
                    }}
                    placeholder="Confirm new password"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting password..." : "Reset password"}
                {!loading ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Need another link?{" "}
              <Link href="/forgot-password" className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline">
                Request reset
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
