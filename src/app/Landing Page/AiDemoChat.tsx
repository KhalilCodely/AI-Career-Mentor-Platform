"use client";

import { motion } from "framer-motion";

const messages = [
  {
    role: "user",
    text: "I want to become a frontend developer. What should I learn first?",
  },
  {
    role: "ai",
    text: "Start with JavaScript fundamentals, semantic HTML, responsive CSS, and one React project that solves a real problem.",
  },
  {
    role: "user",
    text: "How do I know when I'm job-ready?",
  },
  {
    role: "ai",
    text: "When you can explain your projects, pass common interviews, and show consistent commits across 2–3 polished portfolio pieces.",
  },
];

const suggestions = ["Review my resume", "Map my skills", "Practice interviews"];

export default function AiDemoChat() {
  return (
    <section id="ai-demo" className="relative isolate overflow-hidden bg-slate-50 px-6 py-24 dark:bg-zinc-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_0%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_70%_100%,rgba(168,85,247,0.16),transparent_32%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="inline-flex rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm dark:border-purple-300/30 dark:bg-white/10 dark:text-purple-200">
            Live-style mentor preview
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl dark:text-white">
            Ask better questions. Get actionable answers.
          </h2>
          <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            The AI mentor keeps advice practical: what to learn, what to build, and how to present your work to recruiters.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-2xl border border-white bg-white/80 p-4 text-sm font-semibold text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                ✦ {suggestion}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-2xl shadow-slate-300/50 backdrop-blur dark:border-white/10 dark:bg-zinc-950/70 dark:shadow-black/30"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-white/10">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">AI Career Assistant</p>
              <p className="font-bold text-zinc-950 dark:text-white">Strategy session</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">Online</span>
          </div>

          <div className="space-y-4 p-6">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.text}
                initial={{ opacity: 0, x: msg.role === "user" ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-3xl px-5 py-4 text-sm leading-6 shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-inner dark:border-white/10 dark:bg-zinc-950">
              <input
                type="text"
                placeholder="Ask for your next best step..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-zinc-400"
                disabled
              />
              <button className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                Send
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
