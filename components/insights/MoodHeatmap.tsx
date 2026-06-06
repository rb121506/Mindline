"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MOOD_EMOJI, MOOD_LABEL, type Mood } from "@/lib/types";
import { toISODate, formatEntryDate } from "@/lib/text";

interface Cell {
  iso: string;
  mood: number | null;
  inFuture: boolean;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Background for a given (rounded) mood level 1–5, or empty. */
function cellStyle(mood: number | null): React.CSSProperties {
  if (mood == null) return {};
  const level = Math.max(1, Math.min(5, Math.round(mood)));
  const pct = [22, 40, 58, 78, 100][level - 1];
  return {
    backgroundColor: `color-mix(in srgb, var(--accent) ${pct}%, transparent)`,
  };
}

export function MoodHeatmap({
  moodByDate,
}: {
  moodByDate: Record<string, number>;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ cell: Cell; x: number; y: number } | null>(
    null,
  );

  // Always start scrolled to the right so the most recent weeks are visible.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  // Build 53 weeks (columns) of 7 days (rows) ending today.
  const { weeks, monthSpans } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Walk back to the Sunday that starts the grid (~52 weeks back).
    const start = new Date(today);
    start.setDate(start.getDate() - 7 * 52 - today.getDay());

    const cols: Cell[][] = [];
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;

    const cursor = new Date(start);
    let col = 0;
    while (cursor <= today || cursor.getDay() !== 0) {
      const week: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = toISODate(cursor);
        const inFuture = cursor > today;
        week.push({
          iso,
          mood: inFuture ? null : (moodByDate[iso] ?? null),
          inFuture,
        });
        // Month label when the first row of a column enters a new month.
        if (d === 0 && cursor.getMonth() !== lastMonth && !inFuture) {
          lastMonth = cursor.getMonth();
          labels.push({ col, label: MONTH_LABELS[lastMonth] });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(week);
      col++;
      if (col > 53) break;
    }
    return { weeks: cols, monthSpans: labels };
  }, [moodByDate]);

  return (
    <div className="relative">
      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1.5">
          {/* Month labels */}
          <div className="relative ml-7 h-3.5 text-[10px] text-muted-foreground">
            {monthSpans.map((m, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${m.col * 15}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Weekday labels */}
            <div className="flex flex-col gap-[3px] pr-1 text-[10px] text-muted-foreground">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i} className="h-[12px] leading-[12px]">
                  {d}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell) => (
                    <button
                      key={cell.iso}
                      disabled={cell.inFuture}
                      onClick={() =>
                        cell.mood != null && router.push(`/entry/new?date=${cell.iso}`)
                      }
                      onMouseEnter={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setHover({ cell, x: r.left, y: r.top });
                      }}
                      onMouseLeave={() => setHover(null)}
                      className={`h-[12px] w-[12px] rounded-[3px] border transition-transform hover:scale-125 ${
                        cell.inFuture
                          ? "border-transparent"
                          : cell.mood != null
                            ? "border-black/5 dark:border-white/10"
                            : "border-border bg-card-muted"
                      }`}
                      style={cellStyle(cell.mood)}
                      aria-label={cell.iso}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="ml-7 mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Low</span>
            {[1, 2, 3, 4, 5].map((l) => (
              <span
                key={l}
                className="h-[11px] w-[11px] rounded-[3px] border border-black/5 dark:border-white/10"
                style={cellStyle(l)}
              />
            ))}
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hover && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs shadow-elevated"
          style={{ left: hover.x + 6, top: hover.y - 6 }}
        >
          <p className="font-medium">{formatEntryDate(hover.cell.iso)}</p>
          <p className="text-muted-foreground">
            {hover.cell.mood != null
              ? `${MOOD_EMOJI[Math.round(hover.cell.mood) as Mood]} ${MOOD_LABEL[Math.round(hover.cell.mood) as Mood]}`
              : "No entry"}
          </p>
        </div>
      )}
    </div>
  );
}
