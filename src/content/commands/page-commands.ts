import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Printer,
  RotateCcw,
  Search,
} from "lucide-react";
import type { Command } from "./types";

/**
 * Page navigation and action commands
 * These work entirely within the current page context (activeTab permission)
 */
export const pageCommands: Command[] = [
  {
    id: "page:reload",
    title: "Reload Page",
    subtitle: "Refresh the current page",
    icon: RotateCcw,
    keywords: ["refresh", "reload", "update"],
    shortcut: "⌘R",
    category: "page",
    action: () => {
      window.location.reload();
    },
  },
  {
    id: "navigation:back",
    title: "Go Back",
    subtitle: "Navigate to previous page",
    icon: ArrowLeft,
    keywords: ["back", "previous", "history"],
    shortcut: "⌘[",
    category: "navigation",
    action: () => {
      window.history.back();
    },
  },
  {
    id: "navigation:forward",
    title: "Go Forward",
    subtitle: "Navigate to next page",
    icon: ArrowRight,
    keywords: ["forward", "next", "history"],
    shortcut: "⌘]",
    category: "navigation",
    action: () => {
      window.history.forward();
    },
  },
  {
    id: "navigation:scroll-top",
    title: "Scroll to Top",
    subtitle: "Go to the top of the page",
    icon: ArrowUp,
    keywords: ["top", "scroll", "beginning", "start"],
    shortcut: "Home",
    category: "navigation",
    action: () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
  {
    id: "navigation:scroll-bottom",
    title: "Scroll to Bottom",
    subtitle: "Go to the bottom of the page",
    icon: ArrowDown,
    keywords: ["bottom", "scroll", "end"],
    shortcut: "End",
    category: "navigation",
    action: () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    },
  },
  {
    id: "page:find",
    title: "Find in Page",
    subtitle: "Open browser search",
    icon: Search,
    keywords: ["search", "find", "text"],
    shortcut: "⌘F",
    category: "page",
    action: () => {
      // Dispatch Ctrl+F / Cmd+F to trigger native find
      const event = new KeyboardEvent("keydown", {
        key: "f",
        code: "KeyF",
        ctrlKey: !navigator.platform.includes("Mac"),
        metaKey: navigator.platform.includes("Mac"),
        bubbles: true,
      });
      document.dispatchEvent(event);
    },
  },
  {
    id: "page:print",
    title: "Print Page",
    subtitle: "Open print dialog",
    icon: Printer,
    keywords: ["print", "pdf", "save"],
    shortcut: "⌘P",
    category: "page",
    action: () => {
      window.print();
    },
  },
];
