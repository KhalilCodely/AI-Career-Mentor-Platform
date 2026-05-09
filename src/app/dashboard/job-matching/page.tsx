"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Loader2, Radar, Sparkles, Target, Wand2 } from "lucide-react";

type JobMatchResult = {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  gaps: string[];
  resumeKeywords: string[];
  actionPlan: string[];
  suggestedRoles: string[];
  provider: "openai" | "gemini" | "local";
  model: string;
  aiGenerated: boolean;
  generatedAt: string;
};

type JobMatch = {
  id: string;
  targetRole: string;
  jobDescription: string | null;
  result: JobMatchResult;
  createdAt: string;
};

type JobMatchResponse = {
  success?: boolean;
  data?: JobMatch[] | JobMatch;
  error?: string;
};

const sampleDescription = "Frontend developer role using React, TypeScript, accessibility, APIs, and product collaboration. Looking for portfolio projects, clean UI implementation, and communication skills.";

function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

function providerLabel(result: JobMatchResult) {
  if (result.provider === "openai") return `GPT · ${result.model}`;
  if (result.provider === "gemini") return `Gemini · ${result.model}`;
  return "Local smart fallback";
}

function ResultList({ title, items, tone }: { title: string; items: string[]; tone: "blue" | "emerald" | "amber" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className={`flex size-10 items-center justify-center rounded-2xl ring-1 ${colors[tone]}`}>
          <CheckCircle2 size={18} />
        </span>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      </div>
      <ul className="space-y-3 text-sm leading-6 text-gray-600">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function JobMatchingPage() {
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [jobDescription, setJobDescription] = useState(sampleDescription);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const latest = matches[0] || null;
  const averageScore = useMemo(() => {
    if (matches.length === 0) return 0;
    return Math.round(matches.reduce((sum, match) => sum + match.result.matchScore, 0) / matches.length);
  }, [matches]);

  useEffect(() => {
    let ignore = false;

    const loadMatches = async () => {
      try {
        const res = await fetch("/api/job-matching", { credentials: "include" });
        const data = await parseJson<JobMatchResponse>(res);
        if (!res.ok) throw new Error(data.error || "Failed to load job matches");
        if (!ignore) setMatches(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to load job matches");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadMatches();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetRole.trim().length < 3 || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/job-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetRole, jobDescription }),
      });
      const data = await parseJson<JobMatchResponse>(res);
      if (!res.ok) throw new Error(data.error || "Failed to create job match");
      if (data.data && !Array.isArray(data.data)) setMatches((current) => [data.data as JobMatch, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job match");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 text-white shadow-xl">
        <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-cyan-100">
              <Sparkles size={16} /> AI job matching
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Match your profile to real job targets.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
              Paste a job description or enter a target role. The AI compares it with your profile, saved skills, and course progress, then stores the analysis for later.
            </p>
          </div>
          <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black">{matches.length}</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">Saved matches</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black">{averageScore || "--"}</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">Avg score</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black">AI</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">OpenAI/Gemini</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <BriefcaseBusiness size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-950">Job target</h2>
              <p className="text-sm text-gray-500">Role and optional job description.</p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-gray-700">Target role</span>
            <input
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="e.g. Data Analyst"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700">Job description</span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value.slice(0, 8_000))}
              rows={10}
              className="mt-2 w-full resize-none rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Paste job description or leave blank for role-only matching..."
            />
          </label>

          {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={targetRole.trim().length < 3 || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Radar size={18} />}
            Generate match
          </button>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-[2rem] border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
              <Loader2 className="mx-auto mb-3 animate-spin" /> Loading match history...
            </div>
          ) : null}

          {latest ? (
            <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                    <Wand2 size={14} /> {providerLabel(latest.result)}
                  </div>
                  <h2 className="text-2xl font-black text-slate-950">{latest.targetRole}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{latest.result.summary}</p>
                </div>
                <div className="flex size-28 shrink-0 flex-col items-center justify-center rounded-full bg-slate-950 text-white shadow-lg">
                  <span className="text-3xl font-black">{latest.result.matchScore}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">Match</span>
                </div>
              </div>
            </div>
          ) : !loading ? (
            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
              <Target className="mx-auto mb-3 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-950">No job matches yet</h2>
              <p className="mt-2 text-sm text-gray-600">Generate your first AI job match to see score, gaps, and application steps.</p>
            </div>
          ) : null}

          {latest ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <ResultList title="Matched skills" items={latest.result.matchedSkills} tone="emerald" />
              <ResultList title="Gaps to close" items={latest.result.gaps} tone="amber" />
              <ResultList title="Resume keywords" items={latest.result.resumeKeywords.length ? latest.result.resumeKeywords : ["Add skills to your profile for keywords."]} tone="blue" />
              <ResultList title="Action plan" items={latest.result.actionPlan} tone="blue" />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
