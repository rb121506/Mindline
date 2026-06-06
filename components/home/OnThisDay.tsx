import Link from "next/link";
import { MOOD_EMOJI, type Entry } from "@/lib/types";
import { excerpt } from "@/lib/text";
import { SparklesIcon } from "@/components/icons";

export function OnThisDay({ entry }: { entry: Entry }) {
  return (
    <Link
      href={`/entry/${entry.id}`}
      className="group relative block animate-fade-up overflow-hidden rounded-2xl p-[1.5px] shadow-soft transition-all hover:shadow-elevated"
    >
      {/* Gradient border */}
      <span className="absolute inset-0 bg-ember opacity-90" />
      <div className="relative rounded-[calc(1rem-1px)] bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-strong">
            <SparklesIcon className="h-4 w-4" />
            On this day · 1 year ago
          </p>
          {entry.mood && <span className="text-xl">{MOOD_EMOJI[entry.mood]}</span>}
        </div>
        <h3 className="mt-2 font-serif text-lg font-semibold tracking-tight transition-colors group-hover:text-accent-strong">
          {entry.title || "Untitled"}
        </h3>
        {entry.body_plain && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {excerpt(entry.body_plain, 140)}
          </p>
        )}
      </div>
    </Link>
  );
}
