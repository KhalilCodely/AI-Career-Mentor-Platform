export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />
        <div className="absolute right-[-100px] bottom-[-100px] h-72 w-72 rounded-full bg-purple-300/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full border border-zinc-300/70 bg-white/80 px-4 py-1 text-sm text-zinc-700 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
          Faster, cleaner, and easier to use
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-white">
          Build Your Career with AI
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg dark:text-zinc-300">
          Personalized career paths, resume feedback, and job matching powered by AI, now with a lighter and faster landing experience.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/signup"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-white dark:text-zinc-900"
          >
            Start Free
          </a>
          <a
            href="#features"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
