"use client";

import { useState } from "react";
import { SparklesIcon } from "@/components/icons";

export function WeeklyReflection() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/reflection", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate.");
      setContent(data.reflection ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card-muted/40 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent-strong">
            <SparklesIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Weekly reflection</h2>
            <p className="text-xs text-muted-foreground">AI summary of your week</p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="shrink-0 rounded-xl bg-ember px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-95 disabled:opacity-60"
        >
          {loading ? "Reflecting…" : "Generate"}
        </button>
      </div>

      <div className="px-5 py-4">
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {loading && !content && (
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-muted shimmer" />
            <div className="h-3.5 w-[92%] rounded bg-muted shimmer" />
            <div className="h-3.5 w-[78%] rounded bg-muted shimmer" />
          </div>
        )}
        {content ? (
          <p className="animate-fade-in whitespace-pre-wrap font-serif text-[15px] leading-7">
            {content}
          </p>
        ) : (
          !error &&
          !loading && (
            <p className="text-sm text-muted-foreground">
              Generate a warm, AI-written reflection on your entries from the past
              seven days.
            </p>
          )
        )}
      </div>
    </div>
  );
}
