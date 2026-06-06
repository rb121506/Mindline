import { getEntries } from "@/lib/entries";
import { CalendarView, type CalendarDay } from "@/components/calendar/CalendarView";

export const metadata = { title: "Calendar · Journal" };

export default async function CalendarPage() {
  const entries = await getEntries();

  const entriesByDate: Record<string, CalendarDay> = {};
  for (const e of entries) {
    if (!entriesByDate[e.entry_date]) {
      entriesByDate[e.entry_date] = { entryId: e.id, mood: e.mood };
    }
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-7">
        <p className="text-sm font-medium text-accent-strong">Your year</p>
        <h1 className="mt-0.5 font-serif text-3xl font-semibold tracking-tight">
          Calendar
        </h1>
      </header>
      <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-soft backdrop-blur-sm md:p-6">
        <CalendarView entriesByDate={entriesByDate} />
      </div>
    </div>
  );
}
