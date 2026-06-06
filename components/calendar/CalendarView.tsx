"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { MOOD_EMOJI, type Mood } from "@/lib/types";
import { toISODate } from "@/lib/text";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export interface CalendarDay {
  entryId: string;
  mood: Mood | null;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarView({
  entriesByDate,
}: {
  entriesByDate: Record<string, CalendarDay>;
}) {
  const router = useRouter();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [compact, setCompact] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  function handleDayClick(date: Date) {
    const iso = toISODate(date);
    const existing = entriesByDate[iso];
    router.push(existing ? `/entry/${existing.entryId}` : `/entry/new?date=${iso}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          {format(cursor, "MMMM")}{" "}
          <span className="text-muted-foreground">{format(cursor, "yyyy")}</span>
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCompact((c) => !c)}
            className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-soft transition-colors hover:bg-muted sm:block"
            title="Toggle density"
          >
            {compact ? "Comfortable" : "Compact"}
          </button>
          <NavBtn onClick={() => setCursor((c) => subMonths(c, 1))} label="Previous month">
            <ChevronLeftIcon className="h-[18px] w-[18px]" />
          </NavBtn>
          <button
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-soft transition-colors hover:bg-muted"
          >
            Today
          </button>
          <NavBtn onClick={() => setCursor((c) => addMonths(c, 1))} label="Next month">
            <ChevronRightIcon className="h-[18px] w-[18px]" />
          </NavBtn>
        </div>
      </div>

      {/* Weekday labels */}
      <div
        className={`mb-2 grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground/70 ${
          compact ? "gap-1" : "gap-1 sm:gap-1.5"
        }`}
      >
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid. Denser on mobile and in compact mode. */}
      <div className={`grid grid-cols-7 ${compact ? "gap-1" : "gap-1 sm:gap-1.5"}`}>
        {days.map((date) => {
          const iso = toISODate(date);
          const entry = entriesByDate[iso];
          const inMonth = isSameMonth(date, cursor);
          const today = isToday(date);
          return (
            <button
              key={iso}
              onClick={() => handleDayClick(date)}
              className={`group relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border transition-all active:scale-95 sm:rounded-xl ${
                inMonth
                  ? entry
                    ? "border-border bg-card-muted hover:border-accent hover:shadow-soft"
                    : "border-border/60 bg-card hover:border-border-strong hover:bg-card-muted"
                  : "border-transparent text-muted-foreground/30"
              } ${today ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
            >
              <span
                className={`text-xs sm:text-[13px] ${
                  today
                    ? "font-bold text-accent-strong"
                    : entry
                      ? "font-semibold"
                      : ""
                }`}
              >
                {format(date, "d")}
              </span>
              {entry &&
                (entry.mood && !compact ? (
                  <>
                    {/* Emoji on larger screens, compact dot on mobile */}
                    <span className="hidden text-base leading-none sm:block">
                      {MOOD_EMOJI[entry.mood]}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-ember sm:hidden" />
                  </>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                ))}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Click any day to open its entry — or start a new one.
      </p>
    </div>
  );
}

function NavBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-soft transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
