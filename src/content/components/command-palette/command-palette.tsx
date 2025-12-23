import { Command } from "cmdk";
import { Bookmark, Clock, Layers, Pin, PinOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { BookmarkInfo, HistoryItem, TabInfo } from "./types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkInfo[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    // Fetch tabs
    chrome.runtime.sendMessage({ type: "GET_TABS" }, (response) => {
      if (response?.tabs) {
        setTabs(
          response.tabs.map((tab: chrome.tabs.Tab) => ({
            id: tab.id,
            windowId: tab.windowId,
            title: tab.title || "",
            url: tab.url || "",
            favIconUrl: tab.favIconUrl,
            pinned: tab.pinned,
            active: tab.active,
          }))
        );
      }
    });

    // Fetch bookmarks
    chrome.runtime.sendMessage({ type: "GET_BOOKMARKS" }, (response) => {
      if (response?.bookmarks) {
        setBookmarks(
          response.bookmarks.map((b: chrome.bookmarks.BookmarkTreeNode) => ({
            id: b.id,
            title: b.title,
            url: b.url || "",
          }))
        );
      }
    });

    // Fetch history
    chrome.runtime.sendMessage(
      { type: "GET_HISTORY", query: "" },
      (response) => {
        if (response?.history) {
          setHistory(
            response.history.map((h: chrome.history.HistoryItem) => ({
              id: h.id,
              title: h.title,
              url: h.url || "",
              lastVisitTime: h.lastVisitTime,
              visitCount: h.visitCount,
            }))
          );
        }
      }
    );
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleSwitchTab = (tab: TabInfo) => {
    chrome.runtime.sendMessage({
      type: "SWITCH_TAB",
      tabId: tab.id,
      windowId: tab.windowId,
    });
    onClose();
  };

  const handleCloseTab = (tab: TabInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: "CLOSE_TAB", tabId: tab.id });
    setTabs((prev) => prev.filter((t) => t.id !== tab.id));
  };

  const handlePinTab = (tab: TabInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({
      type: "PIN_TAB",
      tabId: tab.id,
      pinned: !tab.pinned,
    });
    setTabs((prev) =>
      prev.map((t) => (t.id === tab.id ? { ...t, pinned: !t.pinned } : t))
    );
  };

  const handleOpenBookmark = (bookmark: BookmarkInfo) => {
    window.open(bookmark.url, "_blank");
    onClose();
  };

  const handleOpenHistory = (item: HistoryItem) => {
    window.open(item.url, "_blank");
    onClose();
  };

  if (!open) {
    return null;
  }

  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="command-palette-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={`command-palette-container ${isDarkMode ? "dark" : ""}`}>
        <Command shouldFilter>
          <Command.Input
            autoFocus
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            value={search}
          />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            {tabs.length > 0 && (
              <Command.Group heading="Tabs">
                {tabs.map((tab) => (
                  <Command.Item
                    key={`tab-${tab.id}`}
                    onSelect={() => handleSwitchTab(tab)}
                    value={`tab ${tab.title} ${tab.url}`}
                  >
                    <Layers className="h-4 w-4" />
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate font-medium">{tab.title}</span>
                      <span className="truncate text-muted-foreground text-xs">
                        {tab.url}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="rounded p-1 hover:bg-secondary"
                        onClick={(e) => handlePinTab(tab, e)}
                        title={tab.pinned ? "Unpin tab" : "Pin tab"}
                        type="button"
                      >
                        {tab.pinned ? (
                          <PinOff className="h-3 w-3" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        className="rounded p-1 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => handleCloseTab(tab, e)}
                        title="Close tab"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {bookmarks.length > 0 && (
              <Command.Group heading="Bookmarks">
                {bookmarks.slice(0, 20).map((bookmark) => (
                  <Command.Item
                    key={`bookmark-${bookmark.id}`}
                    onSelect={() => handleOpenBookmark(bookmark)}
                    value={`bookmark ${bookmark.title} ${bookmark.url}`}
                  >
                    <Bookmark className="h-4 w-4" />
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate">{bookmark.title}</span>
                      <span className="truncate text-muted-foreground text-xs">
                        {bookmark.url}
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {history.length > 0 && (
              <Command.Group heading="History">
                {history.slice(0, 20).map((item) => (
                  <Command.Item
                    key={`history-${item.id}`}
                    onSelect={() => handleOpenHistory(item)}
                    value={`history ${item.title} ${item.url}`}
                  >
                    <Clock className="h-4 w-4" />
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate">{item.title || item.url}</span>
                      <span className="truncate text-muted-foreground text-xs">
                        {item.url}
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
