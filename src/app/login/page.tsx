"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Login failed.");
        return;
      }

      localStorage.setItem("auth_token", data.token);
      if (data.user) {
        localStorage.setItem("auth_user", JSON.stringify(data.user));
      }

      setSuccess("Welcome back! Redirecting...");
      setTimeout(() => {
        const isAdmin = data.user?.role === "ADMIN";
        router.push(isAdmin ? "/dashboard" : "/userboard");
      }, 800);
    } catch {
      setError("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-zinc-950 dark:to-zinc-900 p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <Image
            src="/globe.svg"
            alt="Career growth illustration"
            fill
            priority
            className="object-cover p-12 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 to-purple-600/70" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="text-2xl font-bold">Welcome back to Career Mentor</h2>
            <p className="mt-2 text-sm text-blue-100">
              Track your learning goals and continue your AI career roadmap.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md space-y-5">
            <Link href="/" className="inline-block text-sm text-blue-600 hover:underline">
              ← Back to Home
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Sign in</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Use your account to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" required />
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
              </div>
              {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
              {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{success}</p> : null}
              <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
            </form>

            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Don&apos;t have an account? <Link href="/signup" className="font-semibold text-blue-600 hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
