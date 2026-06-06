"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { MOOD_EMOJI, type Entry, type Mood } from "@/lib/types";
import { formatEntryDate } from "@/lib/text";

const DEBOUNCE_MS = 350;

function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark class="bg-amber-200 dark:bg-amber-800/60 rounded px-0.5">$1</mark>',
  );
}

function excerpt(text: string, query: string, maxLen = 160): string {
  const q = query.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text.slice(0, maxLen);
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 100);
  const slice = text.slice(start, end);
  return (start > 0 ? "…" : "") + slice + (end < text.length ? "…" : "");
}

export function SearchClient({
  initialQuery,
  initialResults,
}: {
  initialQuery: string;
  initialResults: Entry[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback(
    (q: string) => {
      startTransition(() => {
        const params = q ? `?q=${encodeURIComponent(q)}` : "";
        router.replace(`/search${params}`, { scroll: false });
      });
    },
    [router],
  );

  // Debounce navigation so we don't fire on every keystroke.
  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value), DEBOUNCE_MS);
  }

  // Sync server results into local state when they arrive.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing server results
  useEffect(() => { setResults(initialResults); }, [initialResults]);

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-6">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search titles, content, tags…"
          className="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-4 text-base shadow-soft outline-none transition-all placeholder:text-muted-foreground/50 focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
        />
        {isPending && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
            Searching…
          </span>
        )}
      </div>

      {/* Results */}
      {!query.trim() ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Start typing to search across all your entries.
        </p>
      ) : results.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No entries found for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          {results.map((entry) => (
            <Link
              key={entry.id}
              href={`/entry/${entry.id}`}
              className="group block rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-elevated"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatEntryDate(entry.entry_date)}
                  </p>
                  <h3
                    className="mt-0.5 truncate font-serif text-lg font-semibold tracking-tight transition-colors group-hover:text-accent-strong"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(entry.title || "Untitled", query),
                    }}
                  />
                </div>
                {entry.mood && (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card-muted text-lg">
                    {MOOD_EMOJI[entry.mood as Mood]}
                  </span>
                )}
              </div>
              {entry.body_plain && (
                <p
                  className="mt-2 text-sm leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(
                      excerpt(entry.body_plain, query),
                      query,
                    ),
                  }}
                />
              )}
              {entry.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {entry.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-card-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
