"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to submit request.");
        return;
      }

      const resetLink = data?.resetLink as string | undefined;
      setMessage(
        resetLink
          ? `Password reset link generated: ${resetLink}`
          : "If an account exists for this email, a reset link has been sent."
      );
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Enter your email and we&apos;ll send a reset link.</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-2 text-white disabled:opacity-60">
            {loading ? "Submitting..." : "Send reset link"}
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <Link href="/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
