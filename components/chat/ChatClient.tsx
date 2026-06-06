"use client";

import { useEffect, useRef, useState } from "react";
import { SendIcon, SparklesIcon, XIcon } from "@/components/icons";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "What topics do I write about most?",
  "How has my mood been lately?",
  "What was I worried about last month?",
  "What are my happiest memories in here?",
];

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages, // history before this message
          message: trimmed,
        }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setMessages([...newHistory, { role: "assistant", content: data.reply! }]);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 220px)", minHeight: 400 }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card shadow-soft">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-12 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-3xl">
              ✨
            </div>
            <div>
              <p className="font-serif text-xl font-semibold">
                Ask me anything about your journal
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                I have access to your entries and can help you find patterns,
                memories, and insights.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => void send(p)}
                  className="rounded-xl border border-border bg-card-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent-strong"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}
            {loading && (
              <div className="flex gap-3 py-2 px-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ember text-white text-sm">
                  <SparklesIcon className="h-4 w-4 animate-pulse" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-card-muted px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-start justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 opacity-70 hover:opacity-100">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your journal…"
            rows={1}
            disabled={loading}
            className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 pr-12 text-sm shadow-soft outline-none transition-all placeholder:text-muted-foreground/50 focus:border-accent focus:ring-4 focus:ring-[var(--ring)] disabled:opacity-60"
            style={{ minHeight: 48, maxHeight: 160 }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
            }}
          />
        </div>
        <button
          onClick={() => void send(input)}
          disabled={!input.trim() || loading}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ember text-white shadow-glow transition-all hover:brightness-105 active:scale-[0.97] disabled:opacity-50"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Press Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end py-1 px-3">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-ember px-4 py-3 text-sm leading-relaxed text-white shadow-glow">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-1 px-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent-soft text-base">
        ✨
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-card-muted px-4 py-3 text-sm leading-relaxed">
        {/* Render paragraphs from newlines */}
        {message.content.split("\n\n").map((para, i) => (
          <p key={i} className={i > 0 ? "mt-3" : ""}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
