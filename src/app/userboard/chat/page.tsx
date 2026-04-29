"use client";

import { FormEvent, useEffect, useState } from "react";
import { getAuth } from "@/lib/auth-client";

type ChatMessage = {
  id: string;
  message: string;
  response: string;
  createdAt: string;
};

export default function UserboardChatPage() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    const auth = getAuth();
    if (!auth) return;

    const res = await fetch("/api/AI_chat/history?limit=30", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    if (!res.ok) {
      throw new Error("Failed to load chat history");
    }

    const data = await res.json();
    setHistory(data.data ?? []);
  }

  useEffect(() => {
    loadHistory().catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load history");
    });
  }, []);

  async function onSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      if (!auth) throw new Error("Please login again.");

      const res = await fetch("/api/AI_chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send message");
      }

      setHistory((prev) => [data, ...prev]);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Career AI Chat</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Ask questions and get personalized career guidance.</p>
      </header>

      <form onSubmit={onSend} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex gap-3">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask the mentor AI..."
          className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-transparent"
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="space-y-3">
        {history.map((chat) => (
          <article key={chat.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
            <p><span className="font-semibold">You:</span> {chat.message}</p>
            <p><span className="font-semibold">AI:</span> {chat.response}</p>
            <p className="text-xs text-zinc-500">{new Date(chat.createdAt).toLocaleString()}</p>
          </article>
        ))}
        {!history.length ? <p className="text-sm text-zinc-500">No chat history yet.</p> : null}
      </div>
    </section>
  );
}
