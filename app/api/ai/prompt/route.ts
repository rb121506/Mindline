import { requireUser } from "@/lib/dal";
import { generateText } from "@/lib/gemini";

// Suggests a fresh journaling prompt. POST so it's never cached.
export async function POST() {
  await requireUser();

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
