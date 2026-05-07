"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Sparkles, User } from "lucide-react";
import { useMemo, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.password.length >= 8) score += 1;
    if (/[A-Z]/.test(form.password)) score += 1;
    if (/[0-9]/.test(form.password)) score += 1;
    return score;
  }, [form.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required");
      return false;
    }

    if (!form.email.includes("@")) {
      setError("Invalid email address");
      return false;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Register failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.24),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)]" />
      <div className="absolute -right-16 top-16 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/90 shadow-2xl shadow-blue-950/30 backdrop-blur xl:grid-cols-[0.9fr_1fr]">
        <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white xl:flex">
          <div>
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Start strong
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Build a smarter path to your next role.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Create your workspace, discover skill gaps, and follow a practical plan designed around your goals.
            </p>
          </div>

          <div className="space-y-3">
            {["Personalized learning roadmap", "Skill progress tracking", "AI career practice sessions"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 text-cyan-300" />
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Create account</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Join Career Mentor</h2>
              <p className="mt-2 text-sm text-slate-500">Set up your profile and start your guided career journey.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleRegister();
              }}
              className="space-y-5"
            >
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full name</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                  <User className="h-5 w-5 text-slate-400" />
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    placeholder="Alex Morgan"
                    required
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    placeholder="you@example.com"
                    required
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                  <LockKeyhole className="h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    placeholder="Password (min 8 characters)"
                    required
                    minLength={8}
                    onChange={handleChange}
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
                <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
                  {[1, 2, 3].map((level) => (
                    <span
                      key={level}
                      className={`h-1.5 rounded-full transition ${passwordScore >= level ? "bg-cyan-500" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">Use 8+ characters. Add uppercase letters and numbers for a stronger password.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
                {!loading ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
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
