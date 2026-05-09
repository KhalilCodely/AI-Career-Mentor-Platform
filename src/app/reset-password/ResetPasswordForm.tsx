"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing from the link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not reset password");
      }

      setPassword("");
      setConfirmPassword("");
      setMessage("Password updated. You can now sign in with the new password.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full max-w-md rounded-[2rem] border border-white/15 bg-white/95 p-8 shadow-2xl shadow-blue-950/30 backdrop-blur">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        Career Mentor
      </Link>

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Reset password</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Choose a new password</h1>
      <p className="mt-2 text-sm text-slate-500">Use the reset link from an admin to update your account password.</p>

      {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
      {message ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div> : null}

      <form onSubmit={submit} className="mt-6 space-y-5">
        <label className="block text-sm font-semibold text-slate-700">
          New password
          <span className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <LockKeyhole className="h-5 w-5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
              placeholder="New password"
            />
          </span>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Confirm password
          <span className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <LockKeyhole className="h-5 w-5 text-slate-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
              placeholder="Confirm password"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !token}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
          {!loading ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}
        </button>
      </form>

      <Link href="/login" className="mt-6 inline-flex text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
        Back to login
      </Link>
    </section>
  );
}
