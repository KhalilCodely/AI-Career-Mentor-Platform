"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!form.email || !form.password) {
      setError("All fields are required");
      return false;
    }

    if (!form.email.includes("@")) {
      setError("Invalid email address");
      return false;
    }

    return true;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("NON-JSON RESPONSE:", text);
        throw new Error("Server error");
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectTo || (data.role === "ADMIN" ? "/admin" : "/dashboard"));
      router.refresh();
    } catch (err: unknown) {
      console.error("LOGIN ERROR:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-950 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.42),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.32),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]" />
      <div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-8 right-8 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-2xl shadow-blue-950/40 backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white xl:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative">
            <BrandLogo
              className="mb-10 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur"
              titleClassName="text-lg"
              subtitleClassName="text-[11px] text-blue-100"
            />
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
              <ShieldCheck className="h-4 w-4" />
              Secure mentor workspace
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back to your career growth hub.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Pick up your roadmap, sharpen skills, and keep every career milestone moving forward.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {["Personal roadmap", "AI practice", "Resume insights"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-semibold shadow-lg shadow-black/10 backdrop-blur">
                <CheckCircle2 className="mb-3 h-5 w-5 text-blue-300" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-center justify-between gap-4">
              <BrandLogo />
              <Link href="/" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                Home
              </Link>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Sign in</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Login to continue building your career plan.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <LockKeyhole className="h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
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

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-blue-500/35 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
