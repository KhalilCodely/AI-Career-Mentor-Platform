"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For learners validating a target role and building their first roadmap.",
    features: ["AI career intake", "Starter roadmap", "Basic skill tracking", "Community-ready action plan"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro Mentor",
    price: "$12",
    cadence: "/mo",
    description: "For job seekers who want structured execution, resume feedback, and interview momentum.",
    features: ["Unlimited AI mentor chat", "Resume checker", "Weekly sprint planning", "Interview practice prompts"],
    cta: "Choose Pro",
    featured: true,
  },
  {
    name: "Teams",
    price: "Custom",
    description: "For bootcamps, career communities, and teams coaching multiple learners.",
    features: ["Admin analytics", "Learner progress overview", "Shared resource library", "Priority onboarding"],
    cta: "Talk to us",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative isolate overflow-hidden bg-slate-50 px-6 py-24 dark:bg-zinc-900">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_72%)]" />

      <div className="mx-auto mb-12 max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
        >
          Simple product packaging
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-5 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl dark:text-white"
        >
          Clear plans make the platform feel ready to buy.
        </motion.h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Pricing, feature boundaries, and calls to action help visitors understand who the product serves and what they get next.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative flex flex-col rounded-[2rem] border p-6 shadow-xl transition hover:-translate-y-1 ${
              plan.featured
                ? "border-blue-500 bg-zinc-950 text-white shadow-blue-200/70 dark:bg-white dark:text-zinc-950 dark:shadow-black/30"
                : "border-zinc-200 bg-white text-zinc-950 shadow-slate-200/70 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-black/20"
            }`}
          >
            {plan.featured && (
              <span className="absolute right-6 top-6 rounded-full bg-blue-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                Popular
              </span>
            )}
            <h3 className="text-xl font-black">{plan.name}</h3>
            <p className={`mt-3 text-sm leading-6 ${plan.featured ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-600 dark:text-zinc-300"}`}>
              {plan.description}
            </p>
            <div className="mt-6 flex items-end gap-1">
              <span className="text-4xl font-black">{plan.price}</span>
              {plan.cadence && <span className={`pb-1 text-sm font-semibold ${plan.featured ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500"}`}>{plan.cadence}</span>}
            </div>
            <ul className="mt-6 space-y-3 text-sm font-semibold">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className={plan.featured ? "text-blue-300 dark:text-blue-600" : "text-blue-600 dark:text-blue-300"}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={plan.name === "Teams" ? "#contact" : "/register"}
              className={`mt-8 inline-flex justify-center rounded-2xl px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
                plan.featured
                  ? "bg-white text-zinc-950 hover:bg-blue-100 dark:bg-zinc-950 dark:text-white"
                  : "bg-zinc-950 text-white hover:bg-blue-700 dark:bg-white dark:text-zinc-950"
              }`}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
