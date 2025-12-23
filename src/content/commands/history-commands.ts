import { Clock } from "lucide-react";
import { commandRegistry } from "./registry";
import type { DynamicItem, HistoryItemMetadata } from "./types";

// Register the History category command
commandRegistry.registerCategory({
  id: "category-history",
  type: "category",
  title: "History",
  subtitle: "Search and open browsing history",
  icon: Clock,
  keywords: ["history", "recent", "visited"],
  category: "history",
});

// Register dynamic history items generator
commandRegistry.registerDynamicGenerator(
  "history",
  async (): Promise<DynamicItem[]> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "GET_HISTORY", query: "" },
        (response) => {
          if (!response?.history) {
            resolve([]);
            return;
          }

          const items: DynamicItem[] = response.history.map(
            (item: chrome.history.HistoryItem): DynamicItem => ({
              id: `history-${item.id}`,
              type: "dynamic",
              category: "history",
              title: item.title || item.url || "Untitled",
              subtitle: item.url,
              icon: Clock,
              keywords: ["history", item.title || "", item.url || ""],
              action: () => {
                if (item.url) {
                  window.open(item.url, "_blank");
                }
              },
              metadata: {
                lastVisitTime: item.lastVisitTime,
                visitCount: item.visitCount,
              } as HistoryItemMetadata,
            })
          );

          resolve(items);
        }
      );
    });
  }
);
