import { requireUser } from "@/lib/dal";
import { generateText } from "@/lib/gemini";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { aiTitleSchema } from "@/lib/validations";

// 15 title generations per minute per user.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;

export async function POST(request: Request) {
  const user = await requireUser();

  const rl = rateLimit({ key: `ai:title:${user.id}`, maxRequests: MAX_REQUESTS, windowMs: WINDOW_MS });
  if (!rl.success) return rateLimitResponse(rl.resetMs);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = aiTitleSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 },
    );
  }

  const text = parsed.data.text.trim();

  try {
    const title = await generateText(
      `Write a concise, evocative title (max 6 words) for the following journal entry.
Return only the title, with no quotes or punctuation at the end.

Entry:
"""
${text.slice(0, 4000)}
"""`,
    );
    return Response.json({ title });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate title.";
    return Response.json({ error: message }, { status: 500 });
  }
}
