"use client";

import { useEffect } from "react";
import { PenIcon, XIcon } from "@/components/icons";
import { MOOD_EMOJI, MOOD_LABEL, type Entry, type Mood } from "@/lib/types";
import { formatEntryDate } from "@/lib/text";
import { tiptapJsonToHtml } from "@/lib/markdown";

interface ReadingViewProps {
  entry: Entry;
  onExitReadingMode: () => void;
}

export function ReadingView({ entry, onExitReadingMode }: ReadingViewProps) {
  // Add reading class to <html> to hide sidebar + bottom nav.
  useEffect(() => {
    document.documentElement.classList.add("reading");
    return () => document.documentElement.classList.remove("reading");
  }, []);

  const html = tiptapJsonToHtml(entry.body);

  return (
    <article className="reading-article animate-fade-in mx-auto max-w-2xl px-6 py-10">
      {/* Floating controls */}
      <div className="fixed right-5 top-5 z-50 flex items-center gap-2">
        <a
          href={`/entry/${entry.id}`}
          onClick={(e) => { e.preventDefault(); onExitReadingMode(); }}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3.5 py-2 text-sm font-medium text-muted-foreground shadow-elevated backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <PenIcon className="h-4 w-4" />
          Edit
        </a>
        <button
          onClick={onExitReadingMode}
          aria-label="Exit reading mode"
          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card/90 text-muted-foreground shadow-elevated backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Meta */}
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          {formatEntryDate(entry.entry_date)}
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight">
          {entry.title || "Untitled"}
        </h1>

        {(entry.mood || entry.tags.length > 0) && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {entry.mood && (
              <span className="flex items-center gap-1.5 rounded-full bg-card-muted px-3 py-1 text-sm">
                {MOOD_EMOJI[entry.mood as Mood]}{" "}
                <span className="text-muted-foreground">
                  {MOOD_LABEL[entry.mood as Mood]}
                </span>
              </span>
            )}
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Body */}
      <div
        className="reading-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
        {entry.word_count > 0 && (
          <span>{entry.word_count} words</span>
        )}
      </footer>
    </article>
  );
}
