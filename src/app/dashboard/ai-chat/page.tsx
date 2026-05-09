"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
  User,
} from "lucide-react";

type ChatMessage = {
  id: string;
  message: string;
  response: string;
  createdAt: string;
};

type ChatResponse = {
  success?: boolean;
  data?: ChatMessage[] | ChatMessage;
  error?: string;
  uses?: {
    profile: boolean;
    skills: boolean;
    courses: boolean;
    progress: boolean;
    ai: boolean;
  };
};

const promptStarters = [
  "What should I focus on this week to move closer to my career goal?",
  "Turn my selected skills and courses into a practical 3-step study plan.",
  "How can I describe my progress in a portfolio or interview story?",
  "Which gaps should I close before applying for junior roles?",
];

const contextCards = [
  {
    label: "Profile-aware",
    detail: "Uses your goal, background, and experience level.",
    icon: User,
  },
  {
    label: "Skill-aware",
    detail: "References saved skills for targeted next steps.",
    icon: Brain,
  },
  {
    label: "Course-aware",
    detail: "Suggests learning actions from matching courses.",
    icon: BookOpen,
  },
  {
    label: "Progress-aware",
    detail: "Adapts advice when course progress exists.",
    icon: CheckCircle2,
  },
];

function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "AI chat request failed";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AiChatMentorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [uses, setUses] = useState<ChatResponse["uses"] | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const characterCount = input.trim().length;
  const canSend = characterCount >= 3 && !sending;
  const latestMessage = messages.at(-1);
  const emptyState = !loading && messages.length === 0;

  const stats = useMemo(() => [
    { label: "Saved chats", value: messages.length.toString() },
    { label: "Context sources", value: uses ? Object.values(uses).filter(Boolean).length.toString() : "4+" },
    { label: "Response style", value: "Actionable" },
  ], [messages.length, uses]);

  useEffect(() => {
    let ignore = false;

    const loadMessages = async () => {
      try {
        const res = await fetch("/api/ai-chat", { credentials: "include" });
        const data = await parseJson<ChatResponse>(res);

        if (!res.ok) {
          throw new Error(res.status === 401 ? "Log in to use the AI chat mentor" : data.error || "Failed to load chats");
        }

        if (!ignore) {
          setMessages(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        console.error("Failed to load AI chat", err);

        if (!ignore) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async (message = input) => {
    const cleanMessage = message.trim();
    if (cleanMessage.length < 3 || sending) return;

    setSending(true);
    setError("");
    setInput("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: cleanMessage }),
      });
      const data = await parseJson<ChatResponse>(res);

      if (!res.ok) {
        throw new Error(res.status === 401 ? "Log in to chat with your mentor" : data.error || "Failed to send message");
      }

      if (data.data && !Array.isArray(data.data)) {
        setMessages((current) => [...current, data.data as ChatMessage]);
      }

      if (data.uses) {
        setUses(data.uses);
      }
    } catch (err) {
      console.error("Failed to send AI chat message", err);
      setError(getErrorMessage(err));
      setInput(cleanMessage);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl">
        <div className="relative p-6 md:p-8">
          <div className="absolute -right-12 -top-16 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-blue-100">
                <Sparkles size={16} /> AI chat mentor now linked
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Ask for career advice that knows your workspace.</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
                The mentor uses your profile, selected skills, matching courses, progress, and previous chat history to turn vague questions into concrete next steps.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
                >
                  Improve profile <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/skills"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Update skills
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {contextCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <Icon size={20} />
              </div>
              <h2 className="text-base font-bold text-slate-950">{card.label}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{card.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-4 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <MessageSquareText size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-950">Try a starter</h2>
              <p className="text-sm text-gray-500">Useful prompts for your next move.</p>
            </div>
          </div>

          <div className="space-y-2">
            {promptStarters.map((starter) => (
              <button
                key={starter}
                onClick={() => void sendMessage(starter)}
                disabled={sending}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left text-sm font-semibold leading-6 text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {starter}
              </button>
            ))}
          </div>

          {latestMessage ? (
            <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-gray-100">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Latest chat</p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{latestMessage.message}</p>
              <p className="mt-3 text-xs font-semibold text-gray-400">{formatTime(latestMessage.createdAt)}</p>
            </div>
          ) : null}
        </aside>

        <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                <Bot size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">AI Chat Mentor</h2>
                <p className="text-sm text-gray-500">Personalized career coaching chat</p>
              </div>
            </div>
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 sm:inline-flex">
              Context enabled
            </span>
          </div>

          <div className="h-[34rem] space-y-5 overflow-y-auto bg-slate-50/70 p-4 md:p-6">
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-600">
                <Loader2 className="mr-2 animate-spin" size={20} /> Loading chat history...
              </div>
            ) : null}

            {emptyState ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-3xl bg-white text-blue-700 shadow-sm ring-1 ring-gray-100">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">Start with one career question</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Ask about what to learn next, how to prioritize courses, or how to explain your progress in applications.
                  </p>
                </div>
              </div>
            ) : null}

            {messages.map((chat) => (
              <div key={chat.id} className="space-y-4">
                <div className="ml-auto max-w-2xl rounded-[1.5rem] rounded-tr-md bg-slate-950 p-4 text-white shadow-sm">
                  <p className="whitespace-pre-wrap text-sm leading-6">{chat.message}</p>
                  <p className="mt-2 text-right text-[11px] font-semibold text-slate-400">{formatTime(chat.createdAt)}</p>
                </div>
                <div className="max-w-3xl rounded-[1.5rem] rounded-tl-md border border-gray-200 bg-white p-4 text-gray-700 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                    <Bot size={14} /> Mentor
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6">{chat.response}</p>
                </div>
              </div>
            ))}

            {sending ? (
              <div className="max-w-3xl rounded-[1.5rem] rounded-tl-md border border-gray-200 bg-white p-4 text-gray-600 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Loader2 className="animate-spin" size={18} /> Mentor is thinking through your context...
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white p-4">
            {error ? (
              <div className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <label className="flex-1">
                <span className="sr-only">Message for AI chat mentor</span>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, 1_500))}
                  placeholder="Ask for a study plan, role prep advice, project ideas, or help prioritizing your courses..."
                  rows={3}
                  className="w-full resize-none rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Send
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-gray-400">{characterCount}/1500 characters · Advice is saved to your mentor history.</p>
          </form>
        </div>
      </section>
    </div>
  );
}
