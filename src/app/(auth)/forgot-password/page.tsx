"use client";

import Link from "next/link";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetLink("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to create password reset link");
      }

      setMessage(data.message || "If an account exists, a reset link has been created.");
      setResetLink(typeof data.resetLink === "string" ? data.resetLink : "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.35),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.28),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]" />
      <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/90 shadow-2xl shadow-blue-950/30 backdrop-blur xl:grid-cols-[1fr_0.9fr]">
        <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white xl:flex">
          <div>
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Career Mentor
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Get back to your career roadmap securely.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Request a password reset link, choose a new password, and continue building your career plan.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-sm leading-6 text-slate-200">
            Reset links are single-use and expire after 60 minutes to help keep your account protected.
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Password reset</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Forgot your password?</h2>
              <p className="mt-2 text-sm text-slate-500">Enter your email and we&apos;ll create a secure reset link.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <p>{message}</p>
                {resetLink ? (
                  <Link href={resetLink} className="mt-3 inline-flex font-bold text-emerald-800 underline underline-offset-4">
                    Open reset link
                  </Link>
                ) : null}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setError("");
                      setEmail(event.target.value);
                    }}
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating reset link..." : "Create reset link"}
                {!loading ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Remembered your password?{" "}
              <Link href="/login" className="font-bold text-cyan-600 transition hover:text-cyan-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
