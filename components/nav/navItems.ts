import type { ComponentType, SVGProps } from "react";
import {
  CalendarIcon,
  ChartIcon,
  HomeIcon,
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
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];
