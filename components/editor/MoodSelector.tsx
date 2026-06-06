"use client";

import { MOOD_EMOJI, MOOD_LABEL, type Mood } from "@/lib/types";

interface MoodSelectorProps {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
}

const MOODS: Mood[] = [1, 2, 3, 4, 5];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft">
      {MOODS.map((m) => {
        const selected = value === m;
        return (
          <button
            key={m}
            type="button"
            title={MOOD_LABEL[m]}
            aria-label={MOOD_LABEL[m]}
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : m)}
            className={`group relative grid h-10 w-10 place-items-center rounded-xl text-xl transition-all duration-200 ${
              selected
                ? "scale-110 bg-accent-soft"
                : "opacity-50 grayscale hover:scale-105 hover:opacity-100 hover:grayscale-0"
            }`}
          >
            {MOOD_EMOJI[m]}
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
              {MOOD_LABEL[m]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
