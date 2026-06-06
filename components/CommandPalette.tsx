"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CalendarIcon,
  ChartIcon,
  DownloadIcon,
  HomeIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
} from "@/components/icons";
import { MOOD_EMOJI, type Mood } from "@/lib/types";
import { formatEntryDate } from "@/lib/text";

interface EntryLite {
  id: string;
  title: string | null;
  body_plain: string;
  entry_date: string;
  mood: Mood | null;
}

const ACTIONS = [
  { id: "new", label: "New entry", href: "/entry/new", Icon: PlusIcon },
  { id: "home", label: "Go to Home", href: "/", Icon: HomeIcon },
  { id: "calendar", label: "Go to Calendar", href: "/calendar", Icon: CalendarIcon },
  { id: "insights", label: "Go to Insights", href: "/insights", Icon: ChartIcon },
  { id: "settings", label: "Go to Settings", href: "/settings", Icon: SettingsIcon },
  { id: "export", label: "Export journal", href: "/export", Icon: DownloadIcon },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<EntryLite[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const loadEntries = useCallback(async () => {
    if (loaded) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("entries")
      .select("id, title, body_plain, entry_date, mood")
      .order("entry_date", { ascending: false })
      .limit(500);
    setEntries((data as EntryLite[]) ?? []);
    setLoaded(true);
  }, [loaded]);

  // Global shortcuts: Cmd/Ctrl+K (palette), Cmd/Ctrl+N (new entry).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        void loadEntries();
      } else if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        router.push("/entry/new");
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
      void loadEntries();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, [loadEntries, router]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const q = query.trim().toLowerCase();
  const filteredActions = useMemo(
    () => (q ? ACTIONS.filter((a) => a.label.toLowerCase().includes(q)) : ACTIONS),
    [q],
  );
  const filteredEntries = useMemo(() => {
    if (!q) return entries.slice(0, 6);
    return entries
      .filter((e) =>
        `${e.title ?? ""} ${e.body_plain}`.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [entries, q]);

  type Item =
    | { kind: "action"; href: string; label: string; Icon: typeof HomeIcon }
    | { kind: "entry"; entry: EntryLite };

  const items: Item[] = useMemo(
    () => [
      ...filteredActions.map((a) => ({
        kind: "action" as const,
        href: a.href,
        label: a.label,
        Icon: a.Icon,
      })),
      ...filteredEntries.map((e) => ({ kind: "entry" as const, entry: e })),
    ],
    [filteredActions, filteredEntries],
  );

  function go(item: Item) {
    close();
    if (item.kind === "action") router.push(item.href);
    else router.push(`/entry/${item.entry.id}`);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      go(items[active]);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl border border-border bg-card shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <SearchIcon className="h-[18px] w-[18px] text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search entries or jump to…"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches.
            </p>
          )}
          {items.map((item, i) => {
            const selected = i === active;
            const base = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
              selected ? "bg-accent-soft text-accent-strong" : "hover:bg-muted"
            }`;
            if (item.kind === "action") {
              const Icon = item.Icon;
              return (
                <button
                  key={`a-${item.label}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                  className={base}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </button>
              );
            }
            const e = item.entry;
            return (
              <button
                key={e.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={base}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-card-muted text-sm">
                  {e.mood ? MOOD_EMOJI[e.mood] : "📄"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {e.title || "Untitled"}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatEntryDate(e.entry_date)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
