import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/gemini";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { toISODate } from "@/lib/text";
import { MOOD_LABEL, type Entry, type Mood } from "@/lib/types";

// 5 reflections per 5 minutes per user (expensive operation).
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 5;

export async function POST() {
  const user = await requireUser();

  const rl = rateLimit({ key: `ai:reflection:${user.id}`, maxRequests: MAX_REQUESTS, windowMs: WINDOW_MS });
  if (!rl.success) return rateLimitResponse(rl.resetMs);

  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 6);
  const sinceISO = toISODate(since);
  const weekStart = sinceISO;

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .gte("entry_date", sinceISO)
    .order("entry_date", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const entries = (data ?? []) as Entry[];
  if (entries.length === 0) {
    return Response.json(
      { error: "No entries in the past week to reflect on." },
      { status: 400 },
    );
  }

  const corpus = entries
    .map((e) => {
      const mood = e.mood ? ` (mood: ${MOOD_LABEL[e.mood as Mood]})` : "";
      return `Date ${e.entry_date}${mood}:\n${e.body_plain}`;
    })
    .join("\n\n---\n\n");

  try {
    const reflection = await generateText(
      `You are a warm, insightful journaling companion. Read this person's journal
entries from the past week and write a short reflection (2-3 short paragraphs).
Note recurring themes, emotional patterns, and one gentle, encouraging observation.
Write in second person ("you"). Do not just list the days back.

Entries:
${corpus.slice(0, 12000)}`,
    );

    await supabase.from("weekly_reflections").upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        content: reflection,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,week_start" },
    );

    return Response.json({ reflection });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate reflection.";
    return Response.json({ error: message }, { status: 500 });
  }
}
