"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Copy, KeyRound, Link2, Loader2, Mail, Sparkles } from "lucide-react";

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const requestLink = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; resetUrl?: string; error?: string };

      if (!res.ok) throw new Error(data.error || "Unable to generate reset link");

      setMessage(data.message || "If that email exists, a password reset link is ready.");
      setResetUrl(data.resetUrl || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.28),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]" />
      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/15 bg-white/95 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur sm:p-8">
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <KeyRound className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Reset password</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Send a secure reset link</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the account email and we will generate a one-hour password reset link.
          </p>
        </div>

        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        {message && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}

        <form onSubmit={requestLink} className="space-y-5">
          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <Mail className="h-5 w-5 text-slate-400" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400" />
            </div>
          </label>

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating link..." : "Send reset link"}
          </button>
        </form>

        {resetUrl && (
          <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800"><Link2 className="h-4 w-4" /> Development reset link</div>
            <p className="break-all text-xs leading-5 text-blue-700">{resetUrl}</p>
            <button type="button" onClick={() => navigator.clipboard.writeText(resetUrl)} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-100">
              <Copy className="h-3.5 w-3.5" /> Copy link
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
