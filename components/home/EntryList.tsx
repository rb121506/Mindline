"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SwipeableCard } from "@/components/home/SwipeableCard";
import { PenIcon, SearchIcon } from "@/components/icons";
import { removeEntry, togglePin } from "@/app/actions/entries";
import type { Entry } from "@/lib/types";

export function EntryList({
  entries: initialEntries,
  allTags,
}: {
  entries: Entry[];
  allTags: string[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    const prev = entries;
    setEntries((list) => list.filter((e) => e.id !== id));
    const res = await removeEntry(id);
    if (res?.error) {
      setEntries(prev);
      alert(res.error);
    }
  }

  async function handlePin(id: string, pinned: boolean) {
    const prev = entries;
    setEntries((list) =>
      list.map((e) => (e.id === id ? { ...e, pinned } : e)),
    );
    const res = await togglePin(id, pinned);
    if (res?.error) {
      setEntries(prev);
      alert(res.error);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (activeTag && !e.tags.includes(activeTag)) return false;
      if (!q) return true;
      const haystack = `${e.title ?? ""} ${e.body_plain}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, query, activeTag]);

  const pinnedEntries = filtered.filter((e) => e.pinned);
  const regularEntries = filtered.filter((e) => !e.pinned);

  function CardRow({ entry, index }: { entry: Entry; index: number }) {
    return (
      <SwipeableCard
        entry={entry}
        index={index}
        onDelete={handleDelete}
        onPin={handlePin}
      />
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your entries…"
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-11 pr-3.5 text-sm shadow-soft outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
        />
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <Chip active={activeTag === null} onClick={() => setActiveTag(null)}>
            All
          </Chip>
          {allTags.map((tag) => (
            <Chip
              key={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            >
              #{tag}
            </Chip>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState hasEntries={entries.length > 0} />
      ) : (
        <div className="space-y-6">
          {/* Pinned section */}
          {pinnedEntries.length > 0 && (
            <section>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                📌 Pinned
              </p>
              <div className="grid gap-3">
                {pinnedEntries.map((entry, i) => (
                  <CardRow key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* All / rest */}
          {regularEntries.length > 0 && (
            <section>
              {pinnedEntries.length > 0 && (
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Entries
                </p>
              )}
              <div className="grid gap-3">
                {regularEntries.map((entry, i) => (
                  <CardRow key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
        active
          ? "bg-ember text-white shadow-glow"
          : "border border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ hasEntries }: { hasEntries: boolean }) {
  if (hasEntries) {
    return (
      <div className="animate-fade-in rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No entries match your search.
        </p>
      </div>
    );
  }
  return (
    <div className="animate-fade-up rounded-3xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
        <PenIcon className="h-6 w-6" />
      </div>
      <h3 className="font-serif text-xl font-semibold">Your story starts here</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
        Write your first entry and begin building your journal, one day at a time.
      </p>
      <Link
        href="/entry/new"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-95"
      >
        <PenIcon className="h-4 w-4" />
        Write first entry
      </Link>
    </div>
  );
}
