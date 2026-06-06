import { requireUser } from "@/lib/dal";
import { generateText } from "@/lib/gemini";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// 10 prompts per minute per user.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export async function POST() {
  const user = await requireUser();

  const rl = rateLimit({ key: `ai:prompt:${user.id}`, maxRequests: MAX_REQUESTS, windowMs: WINDOW_MS });
  if (!rl.success) return rateLimitResponse(rl.resetMs);

  try {
    const prompt = await generateText(
      `Generate a single, thoughtful journaling prompt to help someone reflect on their day.
Keep it under 20 words. Return only the prompt text, with no quotes, numbering, or preamble.`,
    );
    return Response.json({ prompt });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate prompt.";
    return Response.json({ error: message }, { status: 500 });
  }
}
