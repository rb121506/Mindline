// Shared domain types for the journal app.

export type Mood = 1 | 2 | 3 | 4 | 5;

export const MOOD_EMOJI: Record<Mood, string> = {
  1: "😔",
  2: "😐",
  3: "😊",
  4: "😄",
  5: "🤩",
};

export const MOOD_LABEL: Record<Mood, string> = {
  1: "Low",
  2: "Meh",
  3: "Okay",
  4: "Good",
  5: "Great",
};

/** Row shape of the `entries` table. */
export interface Entry {
  id: string;
  user_id: string;
  title: string | null;
  /** Tiptap document serialized as a JSON string. */
  body: string;
  /** Plain-text version used for search, excerpts and AI. */
  body_plain: string;
  mood: Mood | null;
  tags: string[];
  /** ISO date (YYYY-MM-DD) the entry is for. */
  entry_date: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

/** Row shape of the `weekly_reflections` table. */
export interface WeeklyReflection {
  id: string;
  user_id: string;
  week_start: string;
  content: string;
  generated_at: string;
}

/** Payload used when creating or updating an entry. */
export interface EntryInput {
  title: string | null;
  body: string;
  body_plain: string;
  mood: Mood | null;
  tags: string[];
  entry_date: string;
  word_count: number;
}
