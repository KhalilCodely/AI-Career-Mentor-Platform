const stats = [
  { value: "12k+", label: "career plans created" },
  { value: "84%", label: "users report clearer goals" },
  { value: "24/7", label: "AI mentor support" },
];

const roadmap = [
  "Profile scan",
  "Skill gap map",
  "Weekly sprint",
  "Interview prep",
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#dbeafe_0,_transparent_32%),linear-gradient(135deg,_#f8fafc_0%,_#ffffff_45%,_#eef2ff_100%)] px-6 pb-20 pt-16 dark:bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.25)_0,_transparent_34%),linear-gradient(135deg,_#09090b_0%,_#18181b_48%,_#0f172a_100%)]">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/80 to-transparent dark:from-zinc-950/80" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute right-[-7rem] top-16 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute bottom-4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-3xl text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200 dark:shadow-none">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
            AI-guided career clarity in minutes
          </span>

          <h1 className="mt-7 text-5xl font-black tracking-tight text-zinc-950 sm:text-6xl md:text-7xl dark:text-white">
            Build a career plan that actually moves you forward.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl dark:text-zinc-300 lg:mx-0">
            Turn your goals, skills, and resume into a personalized roadmap with AI coaching, progress tracking, and interview-ready next steps.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <a
              href="/register"
              className="group rounded-2xl bg-zinc-950 px-7 py-4 text-center font-semibold text-white shadow-2xl shadow-zinc-900/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-700/25 dark:bg-white dark:text-zinc-950 dark:hover:bg-blue-100"
            >
              Start your free plan
              <span className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#ai-demo"
              className="rounded-2xl border border-zinc-200 bg-white/80 px-7 py-4 text-center font-semibold text-zinc-800 shadow-lg shadow-zinc-200/60 backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:shadow-none dark:hover:border-blue-300/40 dark:hover:text-blue-200"
            >
              Watch AI demo
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-3 rounded-3xl border border-white/70 bg-white/65 p-3 shadow-xl shadow-blue-100/40 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <dt className="text-2xl font-black text-zinc-950 dark:text-white">{stat.value}</dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-slate-300/50 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70 dark:shadow-black/40">
            <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-white/10">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Career Mentor AI</p>
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Frontend Developer Roadmap</h2>
              </div>
              <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">On track</div>
            </div>

            <div className="mt-6 space-y-4">
              {roadmap.map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-blue-500/20">
                    0{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-white">{step}</p>
                    <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${92 - index * 16}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-950 p-5 text-white dark:bg-white dark:text-zinc-950">
              <p className="text-sm font-medium opacity-70">Next best action</p>
              <p className="mt-2 text-lg font-bold">Build a portfolio project using API data and document your process.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
