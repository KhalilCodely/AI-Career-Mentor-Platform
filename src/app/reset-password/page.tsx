"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

type Notice = {
  type: "success" | "error";
  message: string;
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotice(null);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setNotice({ type: "error", message: "This reset link is missing a token." });
      return;
    }

    if (form.newPassword.length < 8) {
      setNotice({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setNotice({ type: "error", message: "Password and confirmation do not match." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });
      const data = await res.json() as { error?: string; message?: string };

      if (!res.ok) throw new Error(data.error || "Password reset failed");

      setNotice({ type: "success", message: data.message || "Password reset successfully. Redirecting to login..." });
      setForm({ newPassword: "", confirmPassword: "" });
      setTimeout(() => router.push("/login"), 1400);
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Password reset failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-white/15 bg-white p-6 shadow-2xl shadow-blue-950/30 sm:p-8">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        Career Mentor
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          <ShieldCheck className="h-4 w-4" /> Secure password reset
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use the one-time link from your email to set a fresh password for your account.
        </p>
      </div>

      {notice ? (
        <div className={`mb-5 flex gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {notice.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
          {notice.message}
        </div>
      ) : null}

      {!token ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          This page needs a reset token. Ask your administrator to send a new reset email.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div>
          <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">New password</label>
          <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <LockKeyhole className="h-5 w-5 text-slate-400" />
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={form.newPassword}
              onChange={handleChange}
              placeholder="At least 8 characters"
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
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat new password"
              className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset password"}
          {!loading ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Remember your password? <Link href="/login" className="font-bold text-blue-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.28),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]" />
      <Suspense fallback={<div className="relative rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-600">Loading reset form...</div>}>
        <div className="relative w-full">
          <ResetPasswordForm />
        </div>
      </Suspense>
    </main>
  );
}
