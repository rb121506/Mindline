import { getEntries, getAllTags, getEntryByDate } from "@/lib/entries";
import { oneYearAgoISODate } from "@/lib/text";
import { EntryList } from "@/components/home/EntryList";
import { OnThisDay } from "@/components/home/OnThisDay";
import { Greeting } from "@/components/home/Greeting";

export const metadata = { title: "Home · Mindline" };

export default async function HomePage() {
  const [entries, allTags, onThisDay] = await Promise.all([
    getEntries(),
    getAllTags(),
    getEntryByDate(oneYearAgoISODate()),
  ]);

  return (
    <div className="animate-fade-in">
      <header className="mb-7 flex items-end justify-between gap-4">
        <Greeting />
        <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft sm:inline-flex">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </header>

      {onThisDay && (
        <div className="mb-6">
          <OnThisDay entry={onThisDay} />
        </div>
      )}

      <EntryList entries={entries} allTags={allTags} />
    </div>
  );
}
