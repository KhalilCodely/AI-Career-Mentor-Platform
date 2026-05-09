"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const reviews = [
  {
    name: "Ali Hassan",
    role: "Frontend Developer",
    company: "Tech Startup",
    rating: 5,
    text: "This platform completely changed my career path. The AI guidance is incredibly accurate and practical.",
    img: "https://i.pravatar.cc/100?img=1",
  },
  {
    name: "Sara Khaled",
    role: "UI/UX Designer",
    company: "Freelancer",
    rating: 5,
    text: "Amazing insights! I improved my portfolio and landed clients faster than ever.",
    img: "https://i.pravatar.cc/100?img=2",
  },
  {
    name: "Omar Youssef",
    role: "Full Stack Developer",
    company: "Remote Company",
    rating: 5,
    text: "The career roadmap feature is insane. It gave me a clear direction step by step.",
    img: "https://i.pravatar.cc/100?img=3",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

export default function Testimonials() {
  return (
    <section
      id="reviews"
      className="relative isolate overflow-hidden bg-slate-50 px-6 py-24 dark:bg-zinc-900"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_100%_60%,rgba(168,85,247,0.16),transparent_30%)]" />

      <div className="mx-auto mb-16 max-w-4xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
        >
          Trusted by ambitious learners
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-5 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl dark:text-white"
        >
          Career growth feels better when the path is clear.
        </motion.h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Learners use Career Mentor to focus their effort, improve their story, and move with confidence.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3"
      >
        {reviews.map((review) => (
          <motion.div
            key={review.name}
            variants={item}
            whileHover={{ y: -8 }}
            className="relative overflow-hidden rounded-3xl border border-white bg-white/85 p-6 shadow-xl shadow-slate-200/60 backdrop-blur transition dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20"
          >
            <div className="absolute right-5 top-4 text-6xl font-black leading-none text-blue-100 dark:text-white/5">“</div>
            <div className="relative flex items-center gap-4">
              <Image
                src={review.img}
                alt={`${review.name} avatar`}
                width={52}
                height={52}
                className="h-13 w-13 rounded-2xl border border-zinc-200 dark:border-white/10"
              />
              <div>
                <p className="font-bold text-zinc-950 dark:text-white">{review.name}</p>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {review.role} • {review.company}
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-1">
              {Array.from({ length: review.rating }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="text-lg text-amber-400"
                >
                  ★
                </motion.span>
              ))}
            </div>

            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              {review.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
