"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, LockKeyhole } from "lucide-react";

export default function ResetPasswordConfirmPage() {
  const params = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) throw new Error(data.error || "Unable to reset password");

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
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
            {success ? <CheckCircle2 className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">New password</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{success ? "Password updated" : "Create a new password"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {success ? "Your password has been changed. You can now sign in with the new password." : "Choose a strong password with at least 8 characters."}
          </p>
        </div>

        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {success ? (
          <Link href="/login" className="flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
            Go to sign in
          </Link>
        ) : (
          <form onSubmit={resetPassword} className="space-y-5">
            <PasswordField label="New password" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((current) => !current)} />
            <PasswordField label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} show={showPassword} onToggle={() => setShowPassword((current) => !current)} />
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {loading ? "Updating password..." : "Change password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        <LockKeyhole className="h-5 w-5 text-slate-400" />
        <input type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400" />
        <button type="button" onClick={onToggle} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}
