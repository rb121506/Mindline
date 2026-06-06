"use client";

import { useTheme } from "@/components/ThemeProvider";
import { MoonIcon, SunIcon } from "@/components/icons";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-semibold">Appearance</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Choose how Journal looks to you.
      </p>
      <div className="mt-4 inline-flex rounded-xl border border-border bg-card-muted p-1">
        <ThemeBtn
          active={theme === "light"}
          onClick={() => setTheme("light")}
          icon={<SunIcon className="h-4 w-4" />}
          label="Light"
        />
        <ThemeBtn
          active={theme === "dark"}
          onClick={() => setTheme("dark")}
          icon={<MoonIcon className="h-4 w-4" />}
          label="Dark"
        />
      </div>
    </div>
  );
}

function ThemeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-card text-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
