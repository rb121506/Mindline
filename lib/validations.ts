import { z } from "zod";

/** Validates the entry_date string as YYYY-MM-DD. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "entry_date must be YYYY-MM-DD");

/** Mood: integer 1–5 or null. */
const mood = z
  .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.null()])
  .optional()
  .transform((v) => v ?? null);

/** Schema for creating / updating a journal entry. */
export const entryInputSchema = z.object({
  title: z
    .union([z.string().max(200, "Title too long (max 200 chars)"), z.null()])
    .optional()
    .transform((v) => v ?? null),
  body: z.string().max(500_000, "Entry body too large (max 500 KB)"),
  body_plain: z.string().max(200_000, "Plain text too large (max 200 KB)"),
  mood,
  tags: z
    .array(z.string().max(50, "Tag too long (max 50 chars)"))
    .max(20, "Too many tags (max 20)")
    .default([]),
  entry_date: isoDate,
  word_count: z.number().int().min(0).max(1_000_000),
});

export type ValidatedEntryInput = z.infer<typeof entryInputSchema>;

/** Schema for the AI title endpoint body. */
export const aiTitleSchema = z.object({
  text: z.string().min(1, "No text provided.").max(50_000, "Text too long."),
});

/** Schema for the journal chat endpoint. */
export const chatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(30, "Too many messages in history."),
  message: z.string().min(1, "Message is empty.").max(2000),
});
