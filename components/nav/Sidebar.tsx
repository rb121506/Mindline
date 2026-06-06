"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";
import { ThemeToggle } from "./ThemeToggle";
import { logout } from "@/app/actions/auth";
import { LogoutIcon, PlusIcon, SearchIcon } from "@/components/icons";

function openPalette() {
  window.dispatchEvent(new Event("open-command-palette"));
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/40 px-4 py-6 backdrop-blur-xl md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember text-lg shadow-glow">
          📓
        </span>
        <span className="font-serif text-xl font-semibold tracking-tight">
          Mindline
        </span>
      </Link>

      <Link
        href="/entry/new"
        className="group mt-7 flex items-center justify-center gap-2 rounded-xl bg-ember px-3 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-[0.98]"
      >
        <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
        New entry
      </Link>

      <button
        onClick={openPalette}
        className="mt-2 flex items-center gap-2.5 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      <nav className="mt-7 flex flex-1 flex-col gap-1">
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-ember" />
              )}
              <Icon
                className={`h-[18px] w-[18px] transition-colors ${
                  active ? "text-accent" : ""
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-card/50 p-1.5">
        <ThemeToggle />
        <form action={logout}>
          <button
            type="submit"
            title="Sign out"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
