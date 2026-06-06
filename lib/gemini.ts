import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Server-only Gemini client. The API key is never exposed to the browser;
 * all calls happen inside Route Handlers under /app/api/ai/*.
 */
export function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

/** Convenience wrapper that returns trimmed text for a prompt. */
export async function generateText(prompt: string): Promise<string> {
  const model = getModel();
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Translate common Gemini errors into friendly, actionable messages.
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      throw new Error(
        "Gemini rate limit reached on the free tier. Please wait a minute and try again.",
      );
    }
    if (message.includes("API key") || message.includes("API_KEY") || message.includes("401")) {
      throw new Error("Gemini API key is invalid or missing.");
    }
    throw new Error("The AI service is unavailable right now. Please try again.");
  }
}
