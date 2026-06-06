import { getInsights } from "@/lib/insights";
import { MoodChart } from "@/components/insights/MoodChart";
import { MoodHeatmap } from "@/components/insights/MoodHeatmap";
import { WeeklyReflection } from "@/components/insights/WeeklyReflection";
import { MonthlyRecap } from "@/components/insights/MonthlyRecap";

export const metadata = { title: "Insights · Mindline" };

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`animate-fade-up rounded-2xl border p-3.5 shadow-soft sm:p-5 ${
        accent
          ? "border-transparent bg-ember text-white"
          : "border-border bg-card"
      }`}
    >
      <p
        className={`font-serif text-2xl font-semibold tracking-tight sm:text-3xl ${
          accent ? "text-white" : ""
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-0.5 text-xs leading-tight sm:mt-1 sm:text-sm ${
          accent ? "text-white/80" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

export default async function InsightsPage() {
  const { totalEntries, currentStreak, avgWords, moodTrend, moodByDate } =
    await getInsights();

  return (
    <div className="animate-fade-in">
      <header className="mb-7">
        <p className="text-sm font-medium text-accent-strong">Your patterns</p>
        <h1 className="mt-0.5 font-serif text-3xl font-semibold tracking-tight">
          Insights
        </h1>
      </header>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard label="day streak" value={`${currentStreak}🔥`} accent />
        <StatCard label="total entries" value={totalEntries} />
        <StatCard label="avg words" value={avgWords} />
      </div>

      <div className="mt-4 animate-fade-up rounded-2xl border border-border bg-card p-4 shadow-soft sm:mt-5 sm:p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
          Mood · last 30 days
        </h2>
        <MoodChart data={moodTrend} />
      </div>

      <div className="mt-4 animate-fade-up rounded-2xl border border-border bg-card p-4 shadow-soft sm:mt-5 sm:p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
          Mood · the past year
        </h2>
        <MoodHeatmap moodByDate={moodByDate} />
      </div>

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-2">
        <WeeklyReflection />
        <MonthlyRecap />
      </div>
    </div>
  );
}
