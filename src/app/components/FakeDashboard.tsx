"use client";

import { motion } from "framer-motion";

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

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const row = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Career Progress Dashboard
        </motion.h2>
        <p className="text-zinc-600 dark:text-zinc-300 mt-2">
          Track your journey and progress with AI guidance
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {/* Table Header */}
        <div className="grid grid-cols-4 px-6 py-4 text-sm font-semibold text-zinc-500 border-b dark:border-zinc-800">
          <span>User</span>
          <span>Role</span>
          <span>Progress</span>
          <span>Status</span>
        </div>

        {/* Rows */}
        {users.map((user, i) => (
          <motion.div
            key={i}
            variants={row}
            whileHover={{ scale: 1.01 }}
            className="grid grid-cols-4 items-center px-6 py-5 border-b last:border-none border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
          >
            {/* User */}
            <div className="flex items-center gap-3">
              <img
                src={user.img}
                className="w-10 h-10 rounded-full border"
              />
              <span className="font-medium">{user.name}</span>
            </div>

            {/* Role */}
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              {user.role}
            </span>

            {/* Progress */}
            <div className="w-full">
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${user.progress}%` }}
                  transition={{ duration: 1 }}
                  className="h-2 bg-black dark:bg-white rounded"
                />
              </div>
              <span className="text-xs text-zinc-500 mt-1 block">
                {user.progress}%
              </span>
            </div>

            {/* Status */}
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                user.progress > 80
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : user.progress > 60
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
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