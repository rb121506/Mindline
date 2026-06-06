import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import type { Entry } from "@/lib/types";

/** All entries for the current user — pinned first, then newest first. */
export async function getEntries(): Promise<Entry[]> {
  const supabase = await createClient();
  await requireUser();

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("pinned", { ascending: false })
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Entry[];
}

/** A single entry by id (RLS scopes it to the current user). */
export async function getEntry(id: string): Promise<Entry | null> {
  const supabase = await createClient();
  await requireUser();

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Entry) ?? null;
}

/** The entry for a specific YYYY-MM-DD date, if one exists. */
export async function getEntryByDate(date: string): Promise<Entry | null> {
  const supabase = await createClient();
  await requireUser();

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("entry_date", date)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Entry) ?? null;
}

/** Distinct tags across all of the user's entries, sorted alphabetically. */
export async function getAllTags(): Promise<string[]> {
  const supabase = await createClient();
  await requireUser();

  const { data, error } = await supabase.from("entries").select("tags");
  if (error) throw new Error(error.message);

  const set = new Set<string>();
  for (const row of data ?? []) {
    for (const tag of (row.tags as string[] | null) ?? []) {
      if (tag) set.add(tag);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Pick a random entry id for the "Surprise me" feature. */
export async function getRandomEntryId(): Promise<string | null> {
  const supabase = await createClient();
  await requireUser();

  // Postgres RANDOM() — efficient enough for personal-scale data.
  const { data, error } = await supabase
    .from("entries")
    .select("id")
    .order("created_at") // deterministic base order
    .limit(500); // safety cap

  if (error || !data || data.length === 0) return null;
  const idx = Math.floor(Math.random() * data.length);
  return (data[idx] as { id: string }).id;
}

/** Full-text search across title + body_plain using Supabase ilike. */
export async function searchEntries(query: string): Promise<Entry[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();
  await requireUser();

  const q = `%${query.trim()}%`;
  const { data, error } = await supabase
    .from("entries")
    .select("id, title, entry_date, mood, body_plain, word_count, tags, pinned")
    .or(`title.ilike.${q},body_plain.ilike.${q}`)
    .order("entry_date", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Entry[];
}

/**
 * Returns recent entry text for AI chat context.
 * Fetches the 50 most recent entries, truncated to ~18 000 chars total.
 */
export async function getEntriesForChat(): Promise<string> {
  const supabase = await createClient();
  await requireUser();

  const { data, error } = await supabase
    .from("entries")
    .select("title, entry_date, body_plain, mood")
    .order("entry_date", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) return "No journal entries yet.";

  const parts: string[] = [];
  let total = 0;
  const LIMIT = 18_000;

  for (const e of data as { title: string | null; entry_date: string; body_plain: string; mood: number | null }[]) {
    const chunk = `[${e.entry_date}]${e.title ? ` ${e.title}` : ""}\n${e.body_plain.slice(0, 800)}`;
    if (total + chunk.length > LIMIT) break;
    parts.push(chunk);
    total += chunk.length;
  }

  return parts.join("\n\n---\n\n");
}
