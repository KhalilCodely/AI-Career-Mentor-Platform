"use client";

import { motion } from "framer-motion";

const paths = [
  {
    title: "Frontend Developer",
    desc: "Build modern UIs with React, Tailwind, and animations.",
  },
  {
    title: "Backend Developer",
    desc: "Design APIs, databases, and scalable systems.",
  },
  {
    title: "Full Stack Developer",
    desc: "Combine frontend & backend to build complete apps.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export default function CareerPaths() {
  return (
    <section className="relative py-28 px-6 bg-black text-white overflow-hidden">

      {/* 🔥 Animated Gradient Background */}
      <div className="absolute inset-0 -z-10">
        
        {/* Moving gradient layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.15),transparent_40%)] animate-[pulse_6s_ease-in-out_infinite]" />

        {/* Noise / texture */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />

      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Career Paths Built for{" "}
          <span className="bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            You
          </span>
        </h2>

        <p className="text-gray-400 max-w-xl mx-auto">
          Explore personalized career journeys powered by AI recommendations.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto"
      >
        {paths.map((path, i) => (
          <motion.div key={i} variants={item} className="group perspective-1000">
            
            <motion.div
              whileHover={{ rotateX: 10, rotateY: -10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative h-full rounded-2xl"
            >
              
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 opacity-30 blur group-hover:opacity-60 transition"></div>

              {/* Card */}
              <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full">
                
                <h3 className="text-xl font-semibold mb-3">
                  {path.title}
                </h3>

                <p className="text-gray-400 mb-6">
                  {path.desc}
                </p>

                <button className="text-blue-400 font-medium group-hover:translate-x-1 transition">
                  Explore Path →
                </button>

              </div>

            </motion.div>

          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}