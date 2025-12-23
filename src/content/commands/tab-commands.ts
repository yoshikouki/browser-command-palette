import { Layers, Pin, PinOff, X } from "lucide-react";
import { commandRegistry } from "./registry";
import type { DynamicItem, TabItemMetadata } from "./types";

// Register the Tabs category command
commandRegistry.registerCategory({
  id: "category-tabs",
  type: "category",
  title: "Tabs",
  subtitle: "Search and switch between open tabs",
  icon: Layers,
  keywords: ["tab", "switch", "window"],
  category: "tabs",
});

// Register dynamic tab items generator
commandRegistry.registerDynamicGenerator(
  "tabs",
  async (): Promise<DynamicItem[]> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_TABS" }, (response) => {
        if (!response?.tabs) {
          resolve([]);
          return;
        }

        const items: DynamicItem[] = response.tabs.map(
          (tab: chrome.tabs.Tab): DynamicItem => ({
            id: `tab-${tab.id}`,
            type: "dynamic",
            category: "tabs",
            title: tab.title || "Untitled",
            subtitle: tab.url,
            icon: Layers,
            keywords: ["tab", tab.title || "", tab.url || ""],
            action: () => {
              chrome.runtime.sendMessage({
                type: "SWITCH_TAB",
                tabId: tab.id,
                windowId: tab.windowId,
              });
            },
            metadata: {
              tabId: tab.id,
              windowId: tab.windowId,
              pinned: tab.pinned,
              active: tab.active,
              favIconUrl: tab.favIconUrl,
            } as TabItemMetadata,
          })
        );

        resolve(items);
      });
    });
  }
);

// Helper functions for tab actions
export function createCloseTabAction(tabId: number): () => void {
  return () => {
    chrome.runtime.sendMessage({ type: "CLOSE_TAB", tabId });
  };
}

export function createPinTabAction(
  tabId: number,
  currentlyPinned: boolean
): () => void {
  return () => {
    chrome.runtime.sendMessage({
      type: "PIN_TAB",
      tabId,
      pinned: !currentlyPinned,
    });
  };
}

export const tabActionIcons = {
  close: X,
  pin: Pin,
  unpin: PinOff,
};
