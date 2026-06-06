"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MOOD_EMOJI, type Mood } from "@/lib/types";
import type { MoodPoint } from "@/lib/insights";

export function MoodChart({ data }: { data: MoodPoint[] }) {
  const hasData = data.some((d) => d.mood != null);

  if (!hasData) {
    return (
      <p className="py-14 text-center text-sm text-muted-foreground">
        Log some moods to see your trend bloom here. 🌱
      </p>
    );
  }

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--grad-from, #f59e0b)" />
              <stop offset="100%" stopColor="var(--grad-to, #ea580c)" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            interval={6}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            minTickGap={8}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(v) => MOOD_EMOJI[v as Mood] ?? ""}
            tick={{ fontSize: 14 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ fill: "color-mix(in srgb, var(--accent) 10%, transparent)" }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "var(--shadow-elevated)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
            formatter={(value) => [Number(value).toFixed(1), "Mood"]}
          />
          <Bar dataKey="mood" radius={[6, 6, 0, 0]} maxBarSize={26}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.mood != null ? "url(#moodGrad)" : "transparent"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
