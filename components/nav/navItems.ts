import type { ComponentType, SVGProps } from "react";
import {
  CalendarIcon,
  ChartIcon,
  ChatIcon,
  HomeIcon,
  SearchIcon,
  SettingsIcon,
} from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/insights", label: "Insights", Icon: ChartIcon },
  { href: "/chat", label: "Chat", Icon: ChatIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

/** Items shown only in the desktop sidebar (not the mobile bottom nav). */
export const SIDEBAR_EXTRA_ITEMS: NavItem[] = [
  { href: "/search", label: "Search", Icon: SearchIcon },
];
