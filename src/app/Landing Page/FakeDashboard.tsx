"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const users = [
  {
    name: "Ali Hassan",
    role: "Frontend Developer",
    progress: 70,
    status: "In Progress",
    img: "https://i.pravatar.cc/100?img=1",
  },
  {
    name: "Sara Khaled",
    role: "UI/UX Designer",
    progress: 85,
    status: "Almost Done",
    img: "https://i.pravatar.cc/100?img=2",
  },
  {
    name: "Omar Youssef",
    role: "Full Stack Developer",
    progress: 50,
    status: "Learning",
    img: "https://i.pravatar.cc/100?img=3",
  },
];

const metrics = [
  { label: "Roadmap", value: "68%", tone: "text-blue-600 dark:text-blue-300" },
  { label: "Resume", value: "A-", tone: "text-emerald-600 dark:text-emerald-300" },
  { label: "Interviews", value: "12", tone: "text-purple-600 dark:text-purple-300" },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const row = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="relative isolate overflow-hidden bg-white px-6 py-24 dark:bg-zinc-950">
      <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-slate-50 to-transparent dark:from-zinc-900" />

      <div className="mx-auto mb-12 max-w-4xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
        >
          Progress without the guesswork
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-5 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl dark:text-white"
        >
          Know exactly where every career goal stands.
        </motion.h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          A polished dashboard turns scattered tasks into measurable momentum across skills, resumes, and interviews.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/30"
      >
        <div className="grid gap-4 border-b border-zinc-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/70">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{metric.label}</p>
              <p className={`mt-2 text-3xl font-black ${metric.tone}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="hidden grid-cols-4 px-6 py-4 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 md:grid">
          <span>User</span>
          <span>Role</span>
          <span>Progress</span>
          <span>Status</span>
        </div>

        {users.map((user) => (
          <motion.div
            key={user.name}
            variants={row}
            whileHover={{ scale: 1.005 }}
            className="grid gap-4 border-t border-zinc-200 px-6 py-5 transition hover:bg-blue-50/50 dark:border-white/10 dark:hover:bg-white/5 md:grid-cols-4 md:items-center"
          >
            <div className="flex items-center gap-3">
              <Image
                src={user.img}
                alt={`${user.name} avatar`}
                width={44}
                height={44}
                className="h-11 w-11 rounded-2xl border border-zinc-200 dark:border-white/10"
              />
              <span className="font-bold text-zinc-950 dark:text-white">{user.name}</span>
            </div>

            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {user.role}
            </span>

            <div className="w-full">
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${user.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <span className="mt-1 block text-xs font-semibold text-zinc-500">
                {user.progress}% complete
              </span>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                user.progress > 80
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                  : user.progress > 60
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
              }`}
            >
              {user.status}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
