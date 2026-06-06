import { requireUser } from "@/lib/dal";
import { generateText } from "@/lib/gemini";

// Auto-generates a short title/summary from an entry's plain text.
export async function POST(request: Request) {
  await requireUser();

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return Response.json({ error: "No text provided." }, { status: 400 });
  }

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
