"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { entryInputSchema, type ValidatedEntryInput } from "@/lib/validations";

function deriveTitle(input: ValidatedEntryInput): string {
  if (input.title && input.title.trim()) return input.title.trim();
  const firstLine = input.body_plain.split("\n").map((l) => l.trim()).find(Boolean);
  if (!firstLine) return "Untitled";
  return firstLine.length > 80 ? firstLine.slice(0, 80).trimEnd() + "…" : firstLine;
}

export async function createEntry(raw: unknown): Promise<{ error?: string }> {
  const user = await requireUser();
  const parsed = entryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const input = parsed.data;
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
  raw: unknown,
): Promise<{ error?: string }> {
  await requireUser();

  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id)) {
    return { error: "Invalid entry ID." };
  }

  const parsed = entryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const input = parsed.data;
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
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id)) {
    return { error: "Invalid entry ID." };
  }
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
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id)) {
    return { error: "Invalid entry ID." };
  }
  const supabase = await createClient();

  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/insights");
  return {};
}
