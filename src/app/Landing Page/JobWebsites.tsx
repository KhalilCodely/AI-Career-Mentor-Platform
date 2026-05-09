"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2 } from "lucide-react";

const jobWebsites = [
  {
    name: "LinkedIn Jobs",
    href: "https://www.linkedin.com/jobs/",
    focus: "Networking + professional roles",
    tip: "Use referrals, follow recruiters, and turn on alerts for target titles.",
  },
  {
    name: "Indeed",
    href: "https://www.indeed.com/",
    focus: "High-volume job search",
    tip: "Filter by date posted so you apply before roles get crowded.",
  },
  {
    name: "Glassdoor",
    href: "https://www.glassdoor.com/Job/index.htm",
    focus: "Company reviews + salary research",
    tip: "Check ratings and interview notes before tailoring your application.",
  },
  {
    name: "ZipRecruiter",
    href: "https://www.ziprecruiter.com/",
    focus: "Fast matching + alerts",
    tip: "Keep your profile updated so matching recommendations stay relevant.",
  },
  {
    name: "Monster",
    href: "https://www.monster.com/",
    focus: "General roles across industries",
    tip: "Upload a polished resume and create saved searches for repeat checks.",
  },
  {
    name: "FlexJobs",
    href: "https://www.flexjobs.com/",
    focus: "Remote + flexible work",
    tip: "Use it when you want screened remote, hybrid, freelance, or flexible roles.",
  },
  {
    name: "Wellfound",
    href: "https://wellfound.com/jobs",
    focus: "Startup jobs",
    tip: "Highlight ownership, product impact, and comfort working in small teams.",
  },
  {
    name: "Dice",
    href: "https://www.dice.com/",
    focus: "Tech + IT roles",
    tip: "Add specific tools, languages, and certifications recruiters search for.",
  },
  {
    name: "Handshake",
    href: "https://joinhandshake.com/",
    focus: "Students + early career",
    tip: "Great for internships, campus recruiting, and entry-level opportunities.",
  },
  {
    name: "USAJOBS",
    href: "https://www.usajobs.gov/",
    focus: "U.S. federal government jobs",
    tip: "Match your resume closely to the announcement requirements and keywords.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function JobWebsites() {
  return (
    <section
      id="job-sites"
      className="relative isolate overflow-hidden bg-zinc-50 px-6 py-24 dark:bg-zinc-900/40"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.12),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,0.12),transparent_30%)]" />

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            No database required — start applying today
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-5 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl dark:text-white"
          >
            Top 10 websites to apply for jobs.
          </motion.h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Use these trusted job boards alongside your CareerMentorAI roadmap to find openings, research companies, and submit stronger applications.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 md:grid-cols-2"
        >
          {jobWebsites.map((site, index) => (
            <motion.a
              key={site.name}
              variants={item}
              href={site.href}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/70 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-300/30 dark:hover:shadow-black/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-blue-500/20">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                      {site.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {site.focus}
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
                </div>
                <p className="mt-3 flex gap-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{site.tip}</span>
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
