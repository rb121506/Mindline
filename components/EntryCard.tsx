import Link from "next/link";
import { MOOD_EMOJI, MOOD_LABEL, type Entry } from "@/lib/types";
import { excerpt, formatEntryDate } from "@/lib/text";

export function EntryCard({ entry, index = 0 }: { entry: Entry; index?: number }) {
  return (
    <Link
      href={`/entry/${entry.id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className="group relative block animate-fade-up overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-elevated"
    >
      {/* Ember accent rail on hover */}
      <span className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-ember transition-transform duration-300 group-hover:scale-y-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {formatEntryDate(entry.entry_date)}
          </p>
          <h3 className="mt-1 truncate font-serif text-lg font-semibold tracking-tight transition-colors group-hover:text-accent-strong">
            {entry.title || "Untitled"}
          </h3>
        </div>
        {entry.mood && (
          <span
            title={MOOD_LABEL[entry.mood]}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card-muted text-lg"
          >
            {MOOD_EMOJI[entry.mood]}
          </span>
        )}
      </div>

      {entry.body_plain && (
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {excerpt(entry.body_plain, 140)}
        </p>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-3">
        {entry.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-card-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        {entry.word_count > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground/70">
            {entry.word_count} words
          </span>
        )}
      </div>
    </Link>
  );
}
