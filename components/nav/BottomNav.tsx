"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavItem } from "./navItems";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border/70 bg-card/80 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      {NAV_ITEMS.map((item) => (
        <NavTab key={item.href} item={item} active={isActive(pathname, item.href)} />
      ))}
    </nav>
  );
}

function NavTab({ item, active }: { item: NavItem; active: boolean }) {
  const { href, label, Icon } = item;
  return (
    <Link
      href={href}
      className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
        active ? "text-accent" : "text-muted-foreground"
      }`}
    >
      {active && (
        <span className="absolute top-0 h-0.5 w-8 rounded-full bg-ember" />
      )}
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
