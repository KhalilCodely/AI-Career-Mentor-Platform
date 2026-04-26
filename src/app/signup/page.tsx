"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Signup failed.");
        return;
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/login"), 900);
    } catch {
      setError("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 p-4 dark:from-zinc-950 dark:to-zinc-900 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <Image src="/window.svg" alt="Create account illustration" fill priority className="object-cover p-12 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/70 to-cyan-600/70" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="text-2xl font-bold">Build your personalized learning path</h2>
            <p className="mt-2 text-sm text-cyan-50">Create your account to unlock AI-powered career guidance.</p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md space-y-5">
            <Link href="/" className="inline-block text-sm text-blue-600 hover:underline">← Back to Home</Link>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Create account</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Start your AI career journey.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" required />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" required />
              <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" required />

              {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
              {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{success}</p> : null}

              <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating..." : "Create account"}</button>
            </form>

            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
