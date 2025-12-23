import { Bookmark } from "lucide-react";
import { commandRegistry } from "./registry";
import type { BookmarkItemMetadata, DynamicItem } from "./types";

// Register the Bookmarks category command
commandRegistry.registerCategory({
  id: "category-bookmarks",
  type: "category",
  title: "Bookmarks",
  subtitle: "Search and open bookmarks",
  icon: Bookmark,
  keywords: ["bookmark", "saved", "favorite"],
  category: "bookmarks",
});

// Register dynamic bookmark items generator
commandRegistry.registerDynamicGenerator(
  "bookmarks",
  (): Promise<DynamicItem[]> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_BOOKMARKS" }, (response) => {
        if (!response?.bookmarks) {
          resolve([]);
          return;
        }

        const items: DynamicItem[] = response.bookmarks.map(
          (bookmark: chrome.bookmarks.BookmarkTreeNode): DynamicItem => ({
            id: `bookmark-${bookmark.id}`,
            type: "dynamic",
            category: "bookmarks",
            title: bookmark.title || "Untitled",
            subtitle: bookmark.url,
            icon: Bookmark,
            keywords: ["bookmark", bookmark.title || "", bookmark.url || ""],
            action: () => {
              if (bookmark.url) {
                window.open(bookmark.url, "_blank");
              }
            },
            metadata: {
              bookmarkId: bookmark.id,
            } as BookmarkItemMetadata,
          })
        );

        resolve(items);
      });
    });
  }
);
