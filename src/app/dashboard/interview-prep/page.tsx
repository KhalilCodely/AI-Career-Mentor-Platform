"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bot, CheckCircle2, ClipboardList, Loader2, MessageSquare, Mic, Send, Sparkles } from "lucide-react";

type InterviewPrepResult = {
  overview: string;
  focusAreas: string[];
  questions: string[];
  modelAnswers: string[];
  practicePlan: string[];
  provider: "openai" | "gemini" | "local";
  model: string;
  aiGenerated: boolean;
  generatedAt: string;
};

type InterviewPrep = {
  id: string;
  targetRole: string;
  interviewType: string;
  result: InterviewPrepResult;
  createdAt: string;
};

type InterviewPrepResponse = {
  success?: boolean;
  data?: InterviewPrep[] | InterviewPrep;
  error?: string;
};

const interviewTypes = ["Behavioral and technical", "Frontend technical", "System design", "Data/SQL", "Product sense", "Mock recruiter screen"];

function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

function providerLabel(result: InterviewPrepResult) {
  if (result.provider === "openai") return `GPT · ${result.model}`;
  if (result.provider === "gemini") return `Gemini · ${result.model}`;
  return "Local smart fallback";
}

function PrepCard({ title, items, icon: Icon }: { title: string; items: string[]; icon: typeof CheckCircle2 }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
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

export default function InterviewPrepPage() {
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [interviewType, setInterviewType] = useState(interviewTypes[0]);
  const [preps, setPreps] = useState<InterviewPrep[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const latest = preps[0] || null;

  useEffect(() => {
    let ignore = false;

    const loadPreps = async () => {
      try {
        const res = await fetch("/api/interview-prep", { credentials: "include" });
        const data = await parseJson<InterviewPrepResponse>(res);
        if (!res.ok) throw new Error(data.error || "Failed to load interview prep history");
        if (!ignore) setPreps(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to load interview prep history");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadPreps();
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
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetRole, interviewType }),
      });
      const data = await parseJson<InterviewPrepResponse>(res);
      if (!res.ok) throw new Error(data.error || "Failed to create interview prep");
      if (data.data && !Array.isArray(data.data)) setPreps((current) => [data.data as InterviewPrep, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create interview prep");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white shadow-xl">
        <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-indigo-100">
              <Sparkles size={16} /> AI interview prep
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Practice interviews with a personalized prep pack.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
              Generate role-aware focus areas, realistic questions, model answer frameworks, and a short practice plan using your career context.
            </p>
          </div>
          <div className="relative rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <Bot className="mb-4 text-indigo-100" />
            <p className="text-3xl font-black">{preps.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">Saved prep packs</p>
            <p className="mt-4 text-sm leading-6 text-slate-200">OpenAI/Gemini powered when API keys are configured, with a local fallback.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <Mic size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-950">Prep settings</h2>
              <p className="text-sm text-gray-500">Choose a role and interview type.</p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-gray-700">Target role</span>
            <input
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="e.g. Backend Engineer"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700">Interview type</span>
            <select
              value={interviewType}
              onChange={(event) => setInterviewType(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            >
              {interviewTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>

          {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={targetRole.trim().length < 3 || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Generate prep pack
          </button>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-[2rem] border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
              <Loader2 className="mx-auto mb-3 animate-spin" /> Loading prep history...
            </div>
          ) : null}

          {latest ? (
            <>
              <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
                  <Sparkles size={14} /> {providerLabel(latest.result)}
                </div>
                <h2 className="text-2xl font-black text-slate-950">{latest.targetRole} · {latest.interviewType}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{latest.result.overview}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <PrepCard title="Focus areas" items={latest.result.focusAreas} icon={CheckCircle2} />
                <PrepCard title="Practice questions" items={latest.result.questions} icon={MessageSquare} />
                <PrepCard title="Model answer frameworks" items={latest.result.modelAnswers} icon={Bot} />
                <PrepCard title="Practice plan" items={latest.result.practicePlan} icon={ClipboardList} />
              </div>
            </>
          ) : !loading ? (
            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
              <Mic className="mx-auto mb-3 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-950">No prep packs yet</h2>
              <p className="mt-2 text-sm text-gray-600">Generate your first AI interview prep pack to start practicing.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
