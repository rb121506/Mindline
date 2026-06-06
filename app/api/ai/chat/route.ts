import { requireUser } from "@/lib/dal";
import { generateText } from "@/lib/gemini";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getEntriesForChat } from "@/lib/entries";
import { chatInputSchema } from "@/lib/validations";

// 20 messages per 10 minutes per user.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;

export async function POST(request: Request) {
  const user = await requireUser();

  const rl = rateLimit({
    key: `ai:chat:${user.id}`,
    maxRequests: MAX_REQUESTS,
    windowMs: WINDOW_MS,
  });
  if (!rl.success) return rateLimitResponse(rl.resetMs);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = chatInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 },
    );
  }

  const { messages, message } = parsed.data;

  // Build journal context string.
  const journalContext = await getEntriesForChat();

  // Format conversation history.
  const history = messages
    .map((m) => `${m.role === "user" ? "You" : "Mindline AI"}: ${m.content}`)
    .join("\n");

  const prompt = `You are Mindline's AI companion — warm, insightful, and thoughtful.
You have access to the user's private journal entries below. Use them to answer
questions about their experiences, feelings, and patterns. Be specific to what
they've actually written. Never fabricate entries or events. If you can't find
relevant information in the entries, say so honestly.

Keep responses conversational and concise (2-4 paragraphs max).

=== JOURNAL ENTRIES (most recent first) ===
${journalContext}
=== END OF JOURNAL ===

${history ? `=== CONVERSATION SO FAR ===\n${history}\n=== END CONVERSATION ===\n\n` : ""}You: ${message}
Mindline AI:`;

  try {
    const reply = await generateText(prompt);
    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to respond.";
    return Response.json({ error: message }, { status: 500 });
  }
}
