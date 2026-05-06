"use client";

import { motion } from "framer-motion";

const messages = [
  {
    role: "user",
    text: "I want to become a frontend developer. What should I learn?",
  },
  {
    role: "ai",
    text: "Start with HTML, CSS, and JavaScript. Then learn React and build real projects.",
  },
  {
    role: "user",
    text: "How long will it take?",
  },
  {
    role: "ai",
    text: "With consistent practice, you can become job-ready in 4–6 months.",
  },
];

export default function AiDemoChat() {
  return (
    <section id ="ai-demo"className="py-20 px-6 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold">AI Career Assistant</h2>
        <p className="text-zinc-600 dark:text-zinc-300 mt-2">
          Get instant career advice powered by AI
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-6 shadow-xl"
      >
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === "user" ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fake input */}
        <div className="mt-6 flex gap-2">
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 rounded-xl px-4 py-2 bg-white dark:bg-zinc-800 border"
            disabled
          />
          <button className="bg-black text-white px-4 rounded-xl">
            Send
          </button>
        </div>
      </motion.div>
    </section>
  );
}