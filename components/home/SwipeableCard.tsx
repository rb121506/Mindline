"use client";

import { useRef, useState, type TouchEvent } from "react";
import { EntryCard } from "@/components/EntryCard";
import { TrashIcon } from "@/components/icons";
import type { Entry } from "@/lib/types";

const REVEAL = 88; // px width of the delete action

export function SwipeableCard({
  entry,
  index,
  onDelete,
}: {
  entry: Entry;
  index: number;
  onDelete: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);

  function onTouchStart(e: TouchEvent) {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current + (open ? -REVEAL : 0);
    // Only allow left-swipe (negative), clamp to reveal width.
    setOffset(Math.max(-REVEAL, Math.min(0, dx)));
  }

  function onTouchEnd() {
    dragging.current = false;
    const shouldOpen = offset < -REVEAL / 2;
    setOpen(shouldOpen);
    setOffset(shouldOpen ? -REVEAL : 0);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete action behind the card */}
      <button
        onClick={() => onDelete(entry.id)}
        aria-label="Delete entry"
        className="absolute inset-y-0 right-0 flex w-[88px] items-center justify-center bg-red-500 text-white"
      >
        <TrashIcon className="h-5 w-5" />
      </button>

      {/* Foreground card */}
      <div
        className="relative touch-pan-y transition-transform duration-200"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={(e) => {
          // If revealed, first tap just closes instead of navigating.
          if (open) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            setOffset(0);
          }
        }}
      >
        <EntryCard entry={entry} index={index} />
      </div>
    </div>
  );
}
