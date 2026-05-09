"use client";

import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, LockKeyhole, Sparkles, Target, Zap } from "lucide-react";

const workflow = [
  {
    icon: Target,
    title: "Set the target role",
    description: "Capture the learner's current level, target job, preferred timeline, and portfolio goals in one guided intake.",
  },
  {
    icon: Sparkles,
    title: "Generate the plan",
    description: "Translate skills, resume gaps, and interview needs into a weekly roadmap with practical project milestones.",
  },
  {
    icon: BarChart3,
    title: "Track momentum",
    description: "Keep every task, skill score, resume review, and interview practice session visible from the dashboard.",
  },
];

const productHighlights = [
  "Personalized roadmap from profile and skills",
  "Resume feedback with recruiter-style action items",
  "AI chat for learning blockers and interview prep",
  "Progress analytics that show what to do next",
];

const securityNotes = ["Encrypted sessions", "Private resume uploads", "Admin overview", "Export-ready roadmap"];

export default function ProductShowcase() {
  return (
    <section id="product" className="relative isolate overflow-hidden bg-white px-6 py-24 dark:bg-zinc-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(99,102,241,0.12),transparent_30%)]" />

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200"
          >
            <Zap className="h-4 w-4" />
            Product-ready workflow
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-5 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl dark:text-white"
          >
            From scattered career advice to one guided operating system.
          </motion.h2>

          <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            A real product needs more than a landing page. CareerMentorAI now shows a clear user journey, trust signals, product modules, and a conversion path for learners who want measurable progress.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {productHighlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-sm font-semibold leading-6 text-zinc-700 dark:text-zinc-200">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 p-2 shadow-2xl shadow-blue-100/60 dark:border-white/10 dark:bg-white/10 dark:shadow-black/30"
        >
          <div className="rounded-[1.5rem] bg-white p-6 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-white/10">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Career operating system</p>
                <h3 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">Launch plan dashboard</h3>
              </div>
              <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                14-day sprint active
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {workflow.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="grid gap-4 rounded-3xl border border-zinc-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[auto_1fr]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-300">
                          Step 0{index + 1}
                        </span>
                      </div>
                      <h4 className="mt-1 text-lg font-black text-zinc-950 dark:text-white">{item.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-zinc-950 dark:text-white">Trust and control built in</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Positioned like a SaaS product, not a prototype.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {securityNotes.map((note) => (
                  <span
                    key={note}
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-sm dark:bg-white/10 dark:text-blue-200"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
