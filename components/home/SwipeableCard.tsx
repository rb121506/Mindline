"use client";

import { useRef, useState, type TouchEvent } from "react";
import { EntryCard } from "@/components/EntryCard";
import { PinIcon, PinOffIcon, TrashIcon } from "@/components/icons";
import type { Entry } from "@/lib/types";

const PIN_WIDTH = 64;
const DEL_WIDTH = 72;
const REVEAL = PIN_WIDTH + DEL_WIDTH; // 136px total

export function SwipeableCard({
  entry,
  index,
  onDelete,
  onPin,
}: {
  entry: Entry;
  index: number;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
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
    setOffset(Math.max(-REVEAL, Math.min(0, dx)));
  }

  function onTouchEnd() {
    dragging.current = false;
    const shouldOpen = offset < -REVEAL / 2;
    setOpen(shouldOpen);
    setOffset(shouldOpen ? -REVEAL : 0);
  }

  function closeReveal() {
    setOpen(false);
    setOffset(0);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Actions behind the card */}
      <div className="absolute inset-y-0 right-0 flex" style={{ width: REVEAL }}>
        {/* Pin / Unpin */}
        <button
          onClick={() => { onPin(entry.id, !entry.pinned); closeReveal(); }}
          aria-label={entry.pinned ? "Unpin entry" : "Pin entry"}
          style={{ width: PIN_WIDTH }}
          className="flex items-center justify-center bg-amber-500 text-white transition-opacity hover:bg-amber-600"
        >
          {entry.pinned
            ? <PinOffIcon className="h-5 w-5" />
            : <PinIcon className="h-5 w-5" />}
        </button>

        {/* Delete */}
        <button
          onClick={() => { onDelete(entry.id); closeReveal(); }}
          aria-label="Delete entry"
          style={{ width: DEL_WIDTH }}
          className="flex items-center justify-center bg-red-500 text-white transition-opacity hover:bg-red-600"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Foreground card */}
      <div
        className="relative touch-pan-y transition-transform duration-200"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={(e) => {
          if (open) {
            e.preventDefault();
            e.stopPropagation();
            closeReveal();
          }
        }}
      >
        <EntryCard entry={entry} index={index} />
      </div>
    </div>
  );
}
