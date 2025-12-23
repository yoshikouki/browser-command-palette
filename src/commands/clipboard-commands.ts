import { ClipboardCopy, FileText, Link, Type } from "lucide-react";
import type { Command } from "./types";

/**
 * Clipboard commands
 * Copy various page information to clipboard
 */
export const clipboardCommands: Command[] = [
  {
    id: "clipboard:copy-url",
    title: "Copy URL",
    subtitle: "Copy current page URL to clipboard",
    icon: Link,
    keywords: ["copy", "url", "link", "address"],
    shortcut: "⌘⇧C",
    category: "clipboard",
    action: async () => {
      await navigator.clipboard.writeText(window.location.href);
    },
  },
  {
    id: "clipboard:copy-title",
    title: "Copy Title",
    subtitle: "Copy page title to clipboard",
    icon: Type,
    keywords: ["copy", "title", "name"],
    category: "clipboard",
    action: async () => {
      await navigator.clipboard.writeText(document.title);
    },
  },
  {
    id: "clipboard:copy-title-url",
    title: "Copy Title & URL",
    subtitle: "Copy as 'Title - URL' format",
    icon: ClipboardCopy,
    keywords: ["copy", "title", "url", "both"],
    category: "clipboard",
    action: async () => {
      const text = `${document.title} - ${window.location.href}`;
      await navigator.clipboard.writeText(text);
    },
  },
  {
    id: "clipboard:copy-markdown-link",
    title: "Copy as Markdown Link",
    subtitle: "Copy as [Title](URL) format",
    icon: FileText,
    keywords: ["copy", "markdown", "link", "md"],
    category: "clipboard",
    action: async () => {
      const markdown = `[${document.title}](${window.location.href})`;
      await navigator.clipboard.writeText(markdown);
    },
  },
  {
    id: "clipboard:copy-selection",
    title: "Copy Selection",
    subtitle: "Copy selected text to clipboard",
    icon: ClipboardCopy,
    keywords: ["copy", "selection", "text", "selected"],
    shortcut: "⌘C",
    category: "clipboard",
    action: async () => {
      const selection = window.getSelection()?.toString() || "";
      if (selection) {
        await navigator.clipboard.writeText(selection);
      }
    },
  },
];
