import type { LucideIcon } from "lucide-react";

/**
 * Command categories for filtering and organization
 */
export type CommandCategory = "navigation" | "clipboard" | "page" | "custom";

/**
 * Base command definition
 * All commands are static - no dynamic generation from external APIs
 */
export interface Command {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Lucide icon component */
  icon?: LucideIcon;
  /** Search keywords (in addition to title) */
  keywords?: string[];
  /** Keyboard shortcut hint (display only) */
  shortcut?: string;
  /** Category for filtering */
  category: CommandCategory;
  /** Command action - runs in content script context */
  action: () => void | Promise<void>;
}

/**
 * Command definition without id (for factory functions)
 */
export type CommandDefinition = Omit<Command, "id">;

/**
 * Stored custom command (persisted in chrome.storage)
 */
export interface StoredCustomCommand {
  id: string;
  title: string;
  url: string;
  keywords?: string[];
  createdAt: number;
}
