import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import type { Entry } from "@/lib/types";

/** All entries for the current user, newest first. */
export async function getEntries(): Promise<Entry[]> {
  const supabase = await createClient();
  await requireUser();

  const { data, error } = await supabase
    .from("entries")
    .select("*")
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
