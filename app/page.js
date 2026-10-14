"use client";

import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import { dashboardMarkup } from "./dashboard-markup";
import { initializeDashboard } from "./dashboard";

const iconComponents = {
  menu: Menu,
  "layout-dashboard": LayoutDashboard,
  "folder-open": FolderOpen,
  "message-square": MessageSquare,
  "users-round": UsersRound,
  calendar: Calendar,
  "chevron-down": ChevronDown,
  check: Check,
  settings: Settings,
  search: Search,
  bell: Bell,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
};

export default function HomePage() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const iconRoots = [];

    host.querySelectorAll("[data-lucide]").forEach((slot) => {
      const Icon = iconComponents[slot.dataset.lucide];
      if (!Icon) return;
      const iconRoot = createRoot(slot);
      iconRoot.render(<Icon aria-hidden="true" focusable="false" />);
      iconRoots.push(iconRoot);
    });

    initializeDashboard();
    return () => iconRoots.forEach((iconRoot) => iconRoot.unmount());
  }, []);

  return <div ref={hostRef} dangerouslySetInnerHTML={{ __html: dashboardMarkup }} />;
}
