import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/gemini";
import { MOOD_LABEL, type Entry, type Mood } from "@/lib/types";

// Generates (and stores) an AI recap of the current calendar month.
export async function POST() {
  const user = await requireUser();
  const supabase = await createClient();

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .gte("entry_date", monthStart)
    .lt("entry_date", monthEnd)
    .order("entry_date", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const entries = (data ?? []) as Entry[];
  if (entries.length === 0) {
    return Response.json(
      { error: "No entries this month to recap yet." },
      { status: 400 },
    );
  }

  const corpus = entries
    .map((e) => {
      const mood = e.mood ? ` (mood: ${MOOD_LABEL[e.mood as Mood]})` : "";
      return `${e.entry_date}${mood}: ${e.body_plain}`;
    })
    .join("\n\n");

  try {
    const recap = await generateText(
      `You are a warm, perceptive journaling companion writing a monthly recap.
Read this person's journal entries for the month and produce a recap with these
four short sections, using these exact markdown headings:

## Common themes
## Mood shifts
## Favorite moments
## Gentle questions

Keep each section to 2-4 sentences (the questions section can be 2-3 bullet
points). Write warmly in second person ("you"). Be specific to what they wrote.

Entries:
${corpus.slice(0, 14000)}`,
    );

    await supabase.from("monthly_recaps").upsert(
      {
        user_id: user.id,
        month_start: monthStart,
        content: recap,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,month_start" },
    );

    return Response.json({ recap });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate recap.";
    return Response.json({ error: message }, { status: 500 });
  }
}
