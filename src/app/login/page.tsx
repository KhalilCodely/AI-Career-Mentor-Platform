"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

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
      setSuccess("Welcome back! Redirecting...");

      setTimeout(() => router.push("/"), 1200);
    } catch {
      setError("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-linear-to-br from-indigo-200 via-white to-blue-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">

      {/* 🔵 Background blobs */}
      <motion.div
        className="absolute w-125 h-125 bg-blue-500/30 blur-3xl rounded-full -top-30 -left-30"
        animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        className="absolute w-100 h-100 bg-purple-500/30 blur-3xl rounded-full -bottom-30 -right-30"
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* 💎 Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl p-8 backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
      >
        {/* 🏠 Back to Home */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
            Login to continue your AI career journey 🚀
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 outline-none text-sm backdrop-blur focus:ring-2 focus:ring-blue-400 dark:text-white"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 outline-none text-sm backdrop-blur focus:ring-2 focus:ring-blue-400 dark:text-white"
            required
          />

          {/* 🔑 Forgot password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-500 text-sm"
            >
              {success}
            </motion.div>
          )}

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-700 dark:text-zinc-300 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
