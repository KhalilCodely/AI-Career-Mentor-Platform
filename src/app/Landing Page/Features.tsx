"use client";

import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  Briefcase,
  Mic,
  TrendingUp,
  Shield,
} from "lucide-react";

const features = [
  {
    title: "AI Career Guidance",
    desc: "Translate goals into a realistic plan with recommended roles, milestones, and weekly priorities.",
    icon: Brain,
    accent: "from-blue-500 to-cyan-500",
  },
  {
    title: "Resume Analyzer",
    desc: "Spot weak bullets, missing keywords, and formatting gaps before you apply.",
    icon: FileText,
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Job Matching",
    desc: "Compare your profile with target roles so every application has a clear reason behind it.",
    icon: Briefcase,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "Interview Practice",
    desc: "Rehearse role-specific questions and get concise feedback on structure and confidence.",
    icon: Mic,
    accent: "from-orange-500 to-rose-500",
  },
  {
    title: "Skill Tracking",
    desc: "See what is complete, what is blocked, and what to learn next from one simple dashboard.",
    icon: TrendingUp,
    accent: "from-indigo-500 to-blue-500",
  },
  {
    title: "Secure Platform",
    desc: "Keep sensitive profile and resume details protected while you plan your next move.",
    icon: Shield,
    accent: "from-slate-700 to-zinc-950 dark:from-zinc-200 dark:to-white",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section
      id="features"
      className="relative isolate overflow-hidden bg-white px-6 py-24 dark:bg-zinc-950"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_80%_55%,rgba(168,85,247,0.14),transparent_30%)]" />

      <div className="mx-auto mb-16 max-w-4xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200"
        >
          Everything in one career workspace
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-5 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl dark:text-white"
        >
          A cleaner way to choose, learn, and land your next role.
        </motion.h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Career Mentor combines planning, feedback, and progress tracking so you always know the next useful step.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/70 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-300/30 dark:hover:shadow-black/30"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.accent}`} />
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-zinc-300/40 transition group-hover:scale-105 dark:text-zinc-950 dark:shadow-none`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {feature.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
