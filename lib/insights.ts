import "server-only";

import { getEntries } from "@/lib/entries";
import { toISODate } from "@/lib/text";
import type { Mood } from "@/lib/types";

export interface MoodPoint {
  date: string; // YYYY-MM-DD
  label: string; // short label e.g. "Jun 6"
  mood: number | null; // average mood that day
}

export interface InsightsData {
  totalEntries: number;
  currentStreak: number;
  avgWords: number;
  moodTrend: MoodPoint[];
  /** Map of YYYY-MM-DD -> average mood that day, across all entries. */
  moodByDate: Record<string, number>;
}

export async function getInsights(): Promise<InsightsData> {
  const entries = await getEntries();

  const totalEntries = entries.length;
  const avgWords =
    totalEntries === 0
      ? 0
      : Math.round(
          entries.reduce((sum, e) => sum + (e.word_count ?? 0), 0) /
            totalEntries,
        );

  // Set of dates that have at least one entry.
  const dateSet = new Set(entries.map((e) => e.entry_date));

  // Current streak: consecutive days with an entry, counting back from today
  // (or yesterday if today has none).
  let currentStreak = 0;
  const probe = new Date();
  if (!dateSet.has(toISODate(probe))) {
    probe.setDate(probe.getDate() - 1);
  }
  while (dateSet.has(toISODate(probe))) {
    currentStreak += 1;
    probe.setDate(probe.getDate() - 1);
  }

  // Mood trend for the last 30 days (averaging moods per day).
  const moodsByDate = new Map<string, number[]>();
  for (const e of entries) {
    if (e.mood == null) continue;
    const arr = moodsByDate.get(e.entry_date) ?? [];
    arr.push(e.mood as Mood);
    moodsByDate.set(e.entry_date, arr);
  }

  const moodTrend: MoodPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = toISODate(d);
    const moods = moodsByDate.get(iso);
    moodTrend.push({
      date: iso,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      mood:
        moods && moods.length
          ? moods.reduce((a, b) => a + b, 0) / moods.length
          : null,
    });
  }

  // Average mood per date across all history (for the year heatmap).
  const moodByDate: Record<string, number> = {};
  for (const [date, moods] of moodsByDate) {
    moodByDate[date] = moods.reduce((a, b) => a + b, 0) / moods.length;
  }

  return { totalEntries, currentStreak, avgWords, moodTrend, moodByDate };
}
