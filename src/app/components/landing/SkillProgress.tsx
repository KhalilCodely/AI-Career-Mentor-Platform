"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const jobData = {
  "Full Stack Developer": [
    {
      name: "Frontend",
      progress: 80,
      icon: "https://cdn-icons-png.flaticon.com/512/2721/2721297.png",
    },
    {
      name: "Backend",
      progress: 70,
      icon: "https://cdn-icons-png.flaticon.com/512/2721/2721279.png",
    },
    {
      name: "System Design",
      progress: 60,
      icon: "https://cdn-icons-png.flaticon.com/512/4149/4149673.png",
    },
  ],

  "Data Analyst": [
    {
      name: "Excel",
      progress: 85,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/excel/excel-original.svg",
    },
    {
      name: "SQL",
      progress: 75,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    },
    {
      name: "Visualization",
      progress: 70,
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png",
    },
  ],

  "AI / ML Engineer": [
    {
      name: "Python",
      progress: 85,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    },
    {
      name: "Machine Learning",
      progress: 70,
      icon: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
    },
    {
      name: "Statistics",
      progress: 65,
      icon: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png",
    },
  ],

  "Graphic Designer": [
    {
      name: "Photoshop",
      progress: 85,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg",
    },
    {
      name: "Illustrator",
      progress: 80,
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg",
    },
    {
      name: "Brand Design",
      progress: 75,
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
  ],

  "Project Manager": [
    {
      name: "Planning",
      progress: 80,
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png",
    },
    {
      name: "Communication",
      progress: 85,
      icon: "https://cdn-icons-png.flaticon.com/512/1256/1256650.png",
    },
    {
      name: "Agile",
      progress: 70,
      icon: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
    },
  ],
};

export default function SkillsProgress() {
  const jobs = Object.keys(jobData);
  const [active, setActive] = useState(jobs[0]);

  return (
    <section className="relative py-24 px-6 bg-[#0a0a0a] text-white overflow-hidden">
      
      {/* 🔥 Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-100 h-100 bg-blue-600/20 blur-[120px] rounded-full -top-25 -left-25" />
        <div className="absolute w-100 h-100 bg-purple-600/20 blur-[120px] rounded-full -bottom-25 -right-25" />
      </div>

      {/* Title */}
      <div className="text-center mb-14">
        <h2 className="text-4xl font-bold mb-4">
          Explore Skills by Career Path
        </h2>
        <p className="text-gray-400">
          Switch between roles and discover required skills.
        </p>
      </div>

      {/* Selector */}
      <div className="flex justify-center mb-14">
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
          {jobs.map((job) => (
            <button
              key={job}
              onClick={() => setActive(job)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all border
                ${
                  active === job
                    ? "text-white border-transparent"
                    : "border-white/10 hover:bg-white/5"
                }`}
            >
              {active === job && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 rounded-full"
                />
              )}
              <span className="relative z-10">{job}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skills Card */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            {jobData[active as keyof typeof jobData].map((skill, i) => (
              <div key={i}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="w-6 h-6"
                    />
                    <span className="font-medium">{skill.name}</span>
                  </div>

                  <span className="text-sm text-gray-400">
                    {skill.progress}%
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.progress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>

              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}