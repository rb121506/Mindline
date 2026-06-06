"use client";

import { useState } from "react";
import { SparklesIcon } from "@/components/icons";

/** Minimal renderer for the recap's `## heading`, `- bullet`, paragraph lines. */
function RecapBody({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (bullets.length) {
      out.push(
        <ul key={key} className="ml-4 list-disc space-y-1 text-sm leading-6">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      flush(`f${i}`);
      return;
    }
    if (line.startsWith("## ")) {
      flush(`f${i}`);
      out.push(
        <h3
          key={i}
          className="mt-3 text-xs font-bold uppercase tracking-wider text-accent-strong first:mt-0"
        >
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      bullets.push(line.slice(2));
    } else {
      flush(`f${i}`);
      out.push(
        <p key={i} className="text-sm leading-6">
          {line.replace(/\*\*/g, "")}
        </p>,
      );
    }
  });
  flush("end");
  return <div className="space-y-1.5 font-serif">{out}</div>;
}

export function MonthlyRecap() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/recap", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate.");
      setContent(data.recap ?? "");
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
            <h2 className="text-sm font-semibold">Monthly recap</h2>
            <p className="text-xs text-muted-foreground">Themes, moods & moments</p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="shrink-0 rounded-xl bg-ember px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-95 disabled:opacity-60"
        >
          {loading ? "Recapping…" : "Generate"}
        </button>
      </div>

      <div className="px-5 py-4">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {loading && !content && (
          <div className="space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-muted shimmer" />
            <div className="h-3.5 w-full rounded bg-muted shimmer" />
            <div className="h-3.5 w-[85%] rounded bg-muted shimmer" />
          </div>
        )}
        {content ? (
          <div className="animate-fade-in">
            <RecapBody text={content} />
          </div>
        ) : (
          !error &&
          !loading && (
            <p className="text-sm text-muted-foreground">
              Generate an AI recap of this month — recurring themes, mood shifts,
              favorite moments, and a few gentle questions to reflect on.
            </p>
          )
        )}
      </div>
    </div>
  );
}
