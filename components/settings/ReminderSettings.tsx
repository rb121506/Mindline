"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "journal-reminder";

interface ReminderConfig {
  enabled: boolean;
  time: string; // HH:MM
}

export function ReminderSettings() {
  const [config, setConfig] = useState<ReminderConfig>({
    enabled: false,
    time: "20:00",
  });
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      if (raw) setConfig(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!config.enabled || permission !== "granted") return;

    const [h, m] = config.time.split(":").map(Number);
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);

    const delay = next.getTime() - Date.now();
    timerRef.current = setTimeout(() => {
      new Notification("Time to journal ✍️", {
        body: "Take a moment to write about your day.",
      });
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [config, permission]);

  function persist(next: ReminderConfig) {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  async function handleToggle() {
    if (!config.enabled) {
      if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
      }
      let perm = Notification.permission;
      if (perm === "default") perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        alert("Notifications were not allowed.");
        return;
      }
    }
    persist({ ...config, enabled: !config.enabled });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Daily reminder</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A gentle browser nudge to keep your streak alive.
          </p>
        </div>
        <button
          onClick={handleToggle}
          role="switch"
          aria-checked={config.enabled}
          aria-label="Toggle daily reminder"
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
            config.enabled ? "bg-ember" : "bg-border-strong"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-300 ${
              config.enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
        <label htmlFor="reminder-time" className="text-sm text-muted-foreground">
          Remind me at
        </label>
        <input
          id="reminder-time"
          type="time"
          value={config.time}
          onChange={(e) => persist({ ...config, time: e.target.value })}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium outline-none transition-all focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
        />
      </div>

      {config.enabled && permission === "granted" && (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent-strong">
          ✓ Scheduled for {config.time}. Keep this tab open for it to fire.
        </p>
      )}
    </div>
  );
}
