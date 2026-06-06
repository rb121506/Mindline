import { getInsights } from "@/lib/insights";
import { MoodChart } from "@/components/insights/MoodChart";
import { MoodHeatmap } from "@/components/insights/MoodHeatmap";
import { WeeklyReflection } from "@/components/insights/WeeklyReflection";
import { MonthlyRecap } from "@/components/insights/MonthlyRecap";

export const metadata = { title: "Insights · Journal" };

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
      className={`animate-fade-up rounded-2xl border p-5 shadow-soft ${
        accent
          ? "border-transparent bg-ember text-white"
          : "border-border bg-card"
      }`}
    >
      <p
        className={`font-serif text-3xl font-semibold tracking-tight ${
          accent ? "text-white" : ""
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-sm ${
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label={currentStreak === 1 ? "day streak" : "day streak"}
          value={`${currentStreak} 🔥`}
          accent
        />
        <StatCard label="total entries" value={totalEntries} />
        <StatCard label="avg words / entry" value={avgWords} />
      </div>

      <div className="mt-5 animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Mood · last 30 days
        </h2>
        <MoodChart data={moodTrend} />
      </div>

      <div className="mt-5 animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Mood · the past year
        </h2>
        <MoodHeatmap moodByDate={moodByDate} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <WeeklyReflection />
        <MonthlyRecap />
      </div>
    </div>
  );
}
