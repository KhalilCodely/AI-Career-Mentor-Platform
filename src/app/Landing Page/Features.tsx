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
    desc: "Get personalized career advice based on your goals and skills.",
    icon: Brain,
  },
  {
    title: "Resume Analyzer",
    desc: "Improve your resume with smart AI feedback.",
    icon: FileText,
  },
  {
    title: "Job Matching",
    desc: "Find jobs tailored to your profile instantly.",
    icon: Briefcase,
  },
  {
    title: "Interview Practice",
    desc: "Practice real interview questions with AI simulation.",
    icon: Mic,
  },
  {
    title: "Skill Tracking",
    desc: "Track your learning progress and improve faster.",
    icon: TrendingUp,
  },
  {
    title: "Secure Platform",
    desc: "Your data is protected with enterprise-level security.",
    icon: Shield,
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

const item = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-24 px-6 bg-linear-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 overflow-hidden"
    >
      {/* 🔵 Background glow */}
      <div className="absolute w-75 h-75 bg-blue-400/20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-75 h-75 bg-purple-400/20 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* Title */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold"
        >
          Powerful Features
        </motion.h2>

        <p className="text-zinc-600 dark:text-zinc-300 mt-3">
          Everything you need to accelerate your career growth
        </p>
      </div>

      {/* Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
      >
        {features.map((f, i) => {
          const Icon = f.icon;

          return (
            <motion.div
              key={i}
              variants={item}
              whileHover={{
                scale: 1.05,
                rotateX: 5,
                rotateY: -5,
              }}
              className="p-6 bg-white/70 dark:bg-zinc-800/70 backdrop-blur rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 transition group"
            >
              {/* Icon */}
              <div className="mb-4 w-12 h-12 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 group-hover:scale-110 transition">
                <Icon className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg mb-2">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}