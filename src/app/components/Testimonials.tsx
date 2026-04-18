"use client";

import { motion } from "framer-motion";

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
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0 },
};

export default function Testimonials() {
  return (
    <section
      id="reviews"
      className="relative py-24 px-6 bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 overflow-hidden"
    >
      {/* 🔵 Background Glow */}
      <div className="absolute w-[400px] h-[400px] bg-blue-400/20 blur-3xl rounded-full top-0 left-0"></div>
      <div className="absolute w-[400px] h-[400px] bg-purple-400/20 blur-3xl rounded-full bottom-0 right-0"></div>

      {/* Title */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold"
        >
          What Our Users Say
        </motion.h2>

        <p className="text-zinc-600 dark:text-zinc-300 mt-3">
          Real feedback from people who transformed their careers
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
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            variants={item}
            whileHover={{
              scale: 1.05,
              rotateX: 5,
              rotateY: -5,
            }}
            className="p-6 bg-white/70 dark:bg-zinc-800/70 backdrop-blur rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 transition"
          >
            {/* User */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={r.img}
                className="w-12 h-12 rounded-full border"
              />
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-zinc-500">
                  {r.role} • {r.company}
                </p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-3">
              {Array.from({ length: r.rating }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-yellow-500"
                >
                  ★
                </motion.span>
              ))}
            </div>

            {/* Text */}
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {r.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}