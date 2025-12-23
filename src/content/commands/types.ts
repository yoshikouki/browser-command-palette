import type { LucideIcon } from "lucide-react";

export type CommandCategory = "tabs" | "bookmarks" | "history" | "navigation";

export interface BaseCommand {
  id: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  keywords?: string[];
  shortcut?: string;
}

// Static command: always visible, fixed action
export interface StaticCommand extends BaseCommand {
  type: "static";
  action: () => void | Promise<void>;
}

// Category command: navigates to a list of dynamic items
export interface CategoryCommand extends BaseCommand {
  type: "category";
  category: CommandCategory;
}

// Tab-specific metadata
export interface TabItemMetadata {
  tabId: number;
  windowId: number;
  pinned: boolean;
  active: boolean;
  favIconUrl?: string;
}

// Bookmark-specific metadata
export interface BookmarkItemMetadata {
  bookmarkId: string;
}

// History-specific metadata
export interface HistoryItemMetadata {
  lastVisitTime?: number;
  visitCount?: number;
}

// Union of all metadata types
export type ItemMetadata =
  | TabItemMetadata
  | BookmarkItemMetadata
  | HistoryItemMetadata;

// Dynamic item: generated from data (tabs, bookmarks, etc.)
export interface DynamicItem extends BaseCommand {
  type: "dynamic";
  category: CommandCategory;
  action: () => void | Promise<void>;
  metadata?: ItemMetadata;
}

export type Command = StaticCommand | CategoryCommand | DynamicItem;
