/** Plain-text + word-count helpers shared by client and server. */

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function excerpt(text: string, max = 100): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

/** Format a Date as a local YYYY-MM-DD string (not UTC). */
export function toISODate(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** Today's date as a local YYYY-MM-DD string (not UTC). */
export function todayISODate(): string {
  return toISODate(new Date());
}

/** The YYYY-MM-DD string for exactly one year ago today. */
export function oneYearAgoISODate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return toISODate(d);
}

const WEEKDAY_NAMES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Human-friendly date label, e.g. "Fri, Jun 6, 2026".
 * Built deterministically (no `toLocaleDateString`) so server and client
 * render identical strings regardless of the runtime locale.
 */
export function formatEntryDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, day ?? 1);
  return `${WEEKDAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${day}, ${y}`;
}
