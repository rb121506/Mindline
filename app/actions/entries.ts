"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import type { EntryInput } from "@/lib/types";

function deriveTitle(input: EntryInput): string {
  if (input.title && input.title.trim()) return input.title.trim();
  // Auto-generate from the first line of plain text.
  const firstLine = input.body_plain.split("\n").map((l) => l.trim()).find(Boolean);
  if (!firstLine) return "Untitled";
  return firstLine.length > 80 ? firstLine.slice(0, 80).trimEnd() + "…" : firstLine;
}

export async function createEntry(input: EntryInput): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      title: deriveTitle(input),
      body: input.body,
      body_plain: input.body_plain,
      mood: input.mood,
      tags: input.tags,
      entry_date: input.entry_date,
      word_count: input.word_count,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/insights");
  redirect(`/entry/${data.id}`);
}

export async function updateEntry(
  id: string,
  input: EntryInput,
): Promise<{ error?: string }> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("entries")
    .update({
      title: deriveTitle(input),
      body: input.body,
      body_plain: input.body_plain,
      mood: input.mood,
      tags: input.tags,
      entry_date: input.entry_date,
      word_count: input.word_count,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/entry/${id}`);
  revalidatePath("/calendar");
  revalidatePath("/insights");
  return {};
}

export async function deleteEntry(id: string): Promise<{ error?: string }> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/insights");
  redirect("/");
}

/** Delete without redirecting — for inline (swipe) deletion from a list. */
export async function removeEntry(id: string): Promise<{ error?: string }> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/insights");
  return {};
}
