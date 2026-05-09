import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.28),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]" />
      <Suspense fallback={<div className="relative rounded-3xl bg-white/95 px-6 py-4 text-sm font-semibold text-slate-600">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
