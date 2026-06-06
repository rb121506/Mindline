"use client";

import { useEffect, useState } from "react";

export function Greeting() {
  const [greeting, setGreeting] = useState("Welcome back");
  const [today, setToday] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    const g =
      h < 5
        ? "Still up?"
        : h < 12
          ? "Good morning"
          : h < 17
            ? "Good afternoon"
            : h < 22
              ? "Good evening"
              : "Winding down?";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only time greeting
    setGreeting(g);
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <div>
      <p className="text-sm font-medium text-accent-strong">{today || " "}</p>
      <h1 className="mt-0.5 font-serif text-3xl font-semibold tracking-tight">
        {greeting}
      </h1>
    </div>
  );
}
