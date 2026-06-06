import Link from "next/link";
import { getEntries } from "@/lib/entries";
import { tiptapJsonToHtml } from "@/lib/markdown";
import { formatEntryDate } from "@/lib/text";
import { MOOD_EMOJI, MOOD_LABEL, type Mood } from "@/lib/types";
import { ExportActions } from "@/components/export/ExportActions";
import { ChevronLeftIcon } from "@/components/icons";

export const metadata = { title: "Export · Mindline" };

export default async function ExportPage() {
  const entries = await getEntries();
  // Print reads best in chronological order (oldest first).
  const chronological = [...entries].reverse();

  return (
    <div className="animate-fade-in">
      <div className="no-print">
        <Link
          href="/settings"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Settings
        </Link>
        <header className="mb-6">
          <p className="text-sm font-medium text-accent-strong">Backup</p>
          <h1 className="mt-0.5 font-serif text-3xl font-semibold tracking-tight">
            Export your journal
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Download every entry as a single Markdown file, or print to PDF for a
            beautifully formatted archive. {entries.length}{" "}
            {entries.length === 1 ? "entry" : "entries"} ready.
          </p>
        </header>
        <ExportActions entries={entries} />
        <div className="my-8 h-px bg-border" />
        <p className="mb-6 text-xs uppercase tracking-wider text-muted-foreground">
          Preview
        </p>
      </div>

      {/* Printable document */}
      <article className="print-document mx-auto max-w-prose">
        <div className="print-entry mb-10 hidden print:block">
          <h1 className="font-serif text-3xl font-bold">Mindline</h1>
          <p className="mt-1 text-sm">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        {chronological.map((entry, i) => (
          <section
            key={entry.id}
            className={`print-entry mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft print:mb-6 print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none ${
              i < chronological.length - 1 ? "" : ""
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {formatEntryDate(entry.entry_date)}
              </p>
              {entry.mood && (
                <span className="text-sm">
                  {MOOD_EMOJI[entry.mood as Mood]}{" "}
                  {MOOD_LABEL[entry.mood as Mood]}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              {entry.title || "Untitled"}
            </h2>
            {entry.tags.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {entry.tags.map((t) => `#${t}`).join("  ")}
              </p>
            )}
            <div
              className="tiptap mt-3"
              dangerouslySetInnerHTML={{
                __html: tiptapJsonToHtml(entry.body) || `<p>${entry.body_plain}</p>`,
              }}
            />
          </section>
        ))}

        {entries.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No entries to export yet.
          </p>
        )}
      </article>
    </div>
  );
}
