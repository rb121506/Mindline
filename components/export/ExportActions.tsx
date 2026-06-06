"use client";

import { downloadAllMarkdown } from "@/lib/markdown";
import { DownloadIcon, PrinterIcon } from "@/components/icons";
import type { Entry } from "@/lib/types";

export function ExportActions({ entries }: { entries: Entry[] }) {
  return (
    <div className="no-print flex flex-wrap gap-3">
      <button
        onClick={() => downloadAllMarkdown(entries)}
        disabled={entries.length === 0}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-soft transition-colors hover:bg-muted disabled:opacity-50"
      >
        <DownloadIcon className="h-[18px] w-[18px]" />
        Download Markdown
      </button>
      <button
        onClick={() => window.print()}
        disabled={entries.length === 0}
        className="inline-flex items-center gap-2 rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
      >
        <PrinterIcon className="h-[18px] w-[18px]" />
        Print / Save as PDF
      </button>
    </div>
  );
}
