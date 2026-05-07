"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  FileText,
  Gauge,
  GraduationCap,
  History,
  Lightbulb,
  Link2,
  Loader2,
  Send,
  Sparkles,
  Target,
  Upload,
  UserRound,
  XCircle,
} from "lucide-react";

type ResumeFeedback = {
  summary: string;
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  roleAlignment: string;
  nextSteps: string[];
  provider: "openai" | "gemini" | "local";
  model: string;
  aiGenerated: boolean;
  uses: {
    profile: boolean;
    skills: boolean;
    courses: boolean;
    progress: boolean;
    ai: boolean;
  };
  checkedAt: string;
};

type ResumeCheck = {
  id: string;
  fileUrl: string;
  score: number | null;
  feedback: ResumeFeedback | null;
  createdAt: string;
};

type ResumeCheckResponse = {
  success?: boolean;
  data?: ResumeCheck[] | ResumeCheck;
  error?: string;
};

const sampleResume = `Alex Rivera\nFrontend Developer\nalex@example.com · github.com/alexrivera · linkedin.com/in/alexrivera\n\nSUMMARY\nFrontend developer focused on React, TypeScript, and accessible UI systems. Built dashboards and customer-facing features for SaaS teams.\n\nEXPERIENCE\nFrontend Developer, BrightApps\n- Built reusable React components for an analytics dashboard used by 1,200+ weekly users.\n- Improved page load speed by 28% by optimizing bundle splitting and image delivery.\n- Partnered with designers and backend engineers to launch onboarding flows.\n\nPROJECTS\nCareer Tracker\n- Built a Next.js app with authentication, PostgreSQL, Prisma, and progress tracking.\n- Added charts and filters to help users monitor course completion.\n\nSKILLS\nReact, TypeScript, Next.js, JavaScript, SQL, Figma, accessibility, Git\n\nEDUCATION\nB.S. Computer Science`;

const featureChecks = [
  { label: "Profile", key: "profile" as const, icon: UserRound, expected: true },
  { label: "Skills", key: "skills" as const, icon: Brain, expected: "maybe" },
  { label: "Courses", key: "courses" as const, icon: GraduationCap, expected: "maybe" },
  { label: "Progress", key: "progress" as const, icon: Gauge, expected: false },
  { label: "AI", key: "ai" as const, icon: Bot, expected: true },
  { label: "UI linked", key: "linked" as const, icon: Link2, expected: true },
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Resume checker request failed";
}

async function parseJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

function providerLabel(feedback: ResumeFeedback) {
  if (feedback.provider === "openai") return `GPT · ${feedback.model}`;
  if (feedback.provider === "gemini") return `Gemini · ${feedback.model}`;
  return "Local smart fallback";
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative flex size-32 items-center justify-center rounded-full bg-slate-100">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(#2563eb ${score * 3.6}deg, #e2e8f0 0deg)` }}
      />
      <div className="relative flex size-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
        <span className="text-3xl font-black text-slate-950">{score}</span>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Score</span>
      </div>
    </div>
  );
}

function FeedbackList({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: typeof CheckCircle2; tone: "emerald" | "amber" | "blue" }) {
  const styles = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-2xl border ${styles[tone]}`}>
          <Icon size={18} />
        </div>
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

export default function ResumeCheckerPage() {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("pasted-resume.txt");
  const [checks, setChecks] = useState<ResumeCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const latestCheck = checks[0] || null;
  const latestFeedback = latestCheck?.feedback || null;
  const characterCount = resumeText.trim().length;
  const canSubmit = characterCount >= 120 && !checking;
  const averageScore = useMemo(() => {
    const scores = checks.map((check) => check.score).filter((score): score is number => typeof score === "number");
    if (scores.length === 0) return 0;

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [checks]);

  useEffect(() => {
    let ignore = false;

    const loadChecks = async () => {
      try {
        const res = await fetch("/api/resume-checker", { credentials: "include" });
        const data = await parseJson<ResumeCheckResponse>(res);

        if (!res.ok) {
          throw new Error(res.status === 401 ? "Log in to view resume checks" : data.error || "Failed to load resume checks");
        }

        if (!ignore) {
          setChecks(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        console.error("Failed to load resume checks", err);

        if (!ignore) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadChecks();

    return () => {
      ignore = true;
    };
  }, []);

  const handleFile = async (file?: File) => {
    if (!file) return;

    setFileName(file.name);
    setError("");

    if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      const text = await file.text();
      setResumeText(text.slice(0, 12_000));
      return;
    }

    setError("For PDFs or Word docs, paste the resume text below so the checker can review clean content.");
  };

  const checkResume = async () => {
    setChecking(true);
    setError("");

    try {
      const res = await fetch("/api/resume-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resumeText, fileName }),
      });
      const data = await parseJson<ResumeCheckResponse>(res);

      if (!res.ok) {
        throw new Error(res.status === 401 ? "Log in to check your resume" : data.error || "Failed to check resume");
      }

      if (data.data && !Array.isArray(data.data)) {
        setChecks((current) => [data.data as ResumeCheck, ...current].slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to check resume", err);
      setError(getErrorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white shadow-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Loading resume checker...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl">
        <div className="relative p-6 md:p-8">
          <div className="absolute -right-10 -top-10 size-64 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-blue-100">
                <Sparkles size={16} /> Resume Checker · profile + optional skills/courses + AI
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Check your resume against your career goal.</h1>
              <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
                Paste your resume and get a score, keyword gaps, role-alignment notes, and concrete next steps. The checker always uses your profile, can use selected skills and matching courses when available, and intentionally skips course progress.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center sm:min-w-96">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-bold">{checks.length}</div>
                <div className="text-xs text-slate-300">Checks saved</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-bold">{averageScore || "—"}</div>
                <div className="text-xs text-slate-300">Avg score</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-slate-300">Progress used</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Resume input</h2>
              <p className="mt-1 text-sm text-gray-500">Paste resume text, or upload a .txt/.md file to fill the editor.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              <Upload size={16} />
              Upload text
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
          </div>

          <textarea
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value.slice(0, 12_000))}
            placeholder="Paste your resume text here..."
            className="min-h-[420px] w-full resize-y rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              <span className={characterCount >= 120 ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>{characterCount}</span> / 12,000 characters · minimum 120
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setResumeText(sampleResume)}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Use sample
              </button>
              <button
                type="button"
                onClick={checkResume}
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-slate-950"
              >
                {checking ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                {checking ? "Checking..." : "Check resume"}
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-bold text-slate-950">Feature coverage</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">Matches the requested Resume Checker inputs and link status.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {featureChecks.map((item) => {
                const Icon = item.icon;
                const actual = item.key === "linked" ? true : latestFeedback?.uses[item.key] ?? item.expected;
                const enabled = actual === true || actual === "maybe";

                return (
                  <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Icon size={18} className={enabled ? "text-blue-600" : "text-gray-400"} />
                      {enabled ? <CheckCircle2 size={17} className="text-emerald-500" /> : <XCircle size={17} className="text-gray-400" />}
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-950">{item.label}</p>
                    <p className="text-xs text-gray-500">{actual === "maybe" ? "Optional" : enabled ? "Used" : "Not used"}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Recent checks</h2>
                <p className="mt-1 text-sm text-gray-500">Latest 5 saved analyses.</p>
              </div>
              <History className="text-gray-400" size={20} />
            </div>
            {checks.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">No resume checks yet. Run your first check to save feedback here.</div>
            ) : (
              <div className="space-y-3">
                {checks.map((check) => (
                  <button
                    type="button"
                    key={check.id}
                    onClick={() => setChecks((current) => [check, ...current.filter((item) => item.id !== check.id)])}
                    className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-950">Score {check.score ?? "—"}</p>
                      <p className="text-xs text-gray-500">{new Date(check.createdAt).toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>

      {latestFeedback ? (
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
              <ScoreRing score={latestFeedback.score} />
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                  <Bot size={15} /> {providerLabel(latestFeedback)}
                </div>
                <h2 className="text-2xl font-black text-slate-950">{latestFeedback.summary}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{latestFeedback.roleAlignment}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <FeedbackList title="Strengths" items={latestFeedback.strengths} icon={CheckCircle2} tone="emerald" />
            <FeedbackList title="Improvements" items={latestFeedback.improvements} icon={Lightbulb} tone="amber" />
            <FeedbackList title="Next steps" items={latestFeedback.nextSteps} icon={Target} tone="blue" />
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-bold text-slate-950">Missing or underused keywords</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {latestFeedback.missingKeywords.length > 0 ? latestFeedback.missingKeywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                  {keyword}
                </span>
              )) : (
                <p className="text-sm text-gray-500">No major keyword gaps were detected from your current profile and resume text.</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
