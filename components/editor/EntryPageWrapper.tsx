"use client";

import { useState } from "react";
import { EntryEditor } from "./EntryEditor";
import { ReadingView } from "./ReadingView";
import { BookOpenIcon } from "@/components/icons";
import type { Entry } from "@/lib/types";

export function EntryPageWrapper({ entry }: { entry: Entry }) {
  const [reading, setReading] = useState(false);

  if (reading) {
    return (
      <ReadingView
        entry={entry}
        onExitReadingMode={() => setReading(false)}
      />
    );
  }

  return (
    <div className="relative py-2">
      {/* Reading mode toggle — floats above the editor */}
      <button
        onClick={() => setReading(true)}
        title="Enter reading mode"
        className="absolute -top-1 right-0 flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft transition-colors hover:bg-card-muted hover:text-foreground"
      >
        <BookOpenIcon className="h-3.5 w-3.5" />
        Read
      </button>
      <EntryEditor entry={entry} />
    </div>
  );
}
