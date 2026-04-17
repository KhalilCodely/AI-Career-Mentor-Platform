"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Tilt from "react-parallax-tilt";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function Reviews() {
  const reviews = [
    {
      name: "Emily",
      image: "https://i.pravatar.cc/100?img=1",
      text: "Career Mentor AI helped me find clarity in my career path and build real confidence.",
    },
    {
      name: "Ahmad",
      image: "https://i.pravatar.cc/100?img=3",
      text: "The AI recommendations are accurate and structured. It feels like a real mentor.",
    },
    {
      name: "Sara",
      image: "https://i.pravatar.cc/100?img=5",
      text: "I improved my resume and started getting interviews within weeks.",
    },
    {
      name: "Omar",
      image: "https://i.pravatar.cc/100?img=7",
      text: "The roadmap feature saved me months of confusion.",
    },
    {
      name: "Lina",
      image: "https://i.pravatar.cc/100?img=9",
      text: "This app gave me direction and clarity.",
    },
    {
      name: "Karim",
      image: "https://i.pravatar.cc/100?img=11",
      text: "Feels like a personal career coach guiding me daily.",
    },
  ];

  return (
    <section className="bg-black text-white py-24 px-6">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center mb-16"
      >
        Why People Love Career Mentor AI
      </motion.h2>

      {/* Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        {reviews.map((r, i) => (
          <Tilt
            key={i}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            perspective={1000}
            scale={1.05}
            transitionSpeed={1000}
            gyroscope={true}
          >
            <motion.div
              variants={item}
              className="relative p-px rounded-xl bg-linear-to-r from-blue-500 to-purple-500"
            >
              <div className="bg-black rounded-xl p-6 h-full transition duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                
                {/* Review text */}
                <p className="text-gray-300 mb-6">{r.text}</p>

                {/* Bottom section */}
                <div className="flex items-center justify-between">
                  
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-10 h-10 rounded-full border border-white/20"
                    />
                    <span className="font-semibold">{r.name}</span>
                  </div>

                  {/* Stars */}
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>

                </div>
              </div>
            </motion.div>
          </Tilt>
        ))}
      </motion.div>
    </section>
  );
}