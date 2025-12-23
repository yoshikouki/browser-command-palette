import type { LucideIcon } from "lucide-react";

export type CommandGroup = "tabs" | "bookmarks" | "history" | "navigation";

export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  keywords?: string[];
  shortcut?: string;
  group: CommandGroup;
  action: () => void | Promise<void>;
}

export interface TabInfo {
  id: number;
  windowId: number;
  title: string;
  url: string;
  favIconUrl?: string;
  pinned: boolean;
  active: boolean;
}

export interface BookmarkInfo {
  id: string;
  title: string;
  url: string;
}

export interface HistoryItem {
  id: string;
  title?: string;
  url: string;
  lastVisitTime?: number;
  visitCount?: number;
}
