"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenIcon } from "@/components/icons";

/** Prominent floating write button — mobile only, sits above the bottom nav. */
export function WriteFab() {
  const pathname = usePathname();
  // Redundant while already writing.
  if (pathname.startsWith("/entry")) return null;

  return (
    <Link
      href="/entry/new"
      aria-label="Write a new entry"
      className="fixed bottom-24 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform active:scale-95 md:hidden"
    >
      <PenIcon className="h-[18px] w-[18px]" />
      Write
    </Link>
  );
}
