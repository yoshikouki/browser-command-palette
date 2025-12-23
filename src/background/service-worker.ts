// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-command-palette") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_COMMAND_PALETTE" });
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_TABS") {
    chrome.tabs.query({}).then((tabs) => {
      sendResponse({ tabs });
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === "SWITCH_TAB") {
    chrome.tabs.update(message.tabId, { active: true });
    chrome.windows.update(message.windowId, { focused: true });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "CLOSE_TAB") {
    chrome.tabs.remove(message.tabId).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "PIN_TAB") {
    chrome.tabs.update(message.tabId, { pinned: message.pinned }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "GET_BOOKMARKS") {
    chrome.bookmarks.getTree().then((tree) => {
      sendResponse({ bookmarks: flattenBookmarks(tree) });
    });
    return true;
  }

  if (message.type === "GET_HISTORY") {
    chrome.history
      .search({
        text: message.query || "",
        maxResults: 100,
        startTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
      })
      .then((history) => {
        sendResponse({ history });
      });
    return true;
  }

  return false;
});

// Flatten bookmark tree into a flat array
function flattenBookmarks(
  nodes: chrome.bookmarks.BookmarkTreeNode[]
): chrome.bookmarks.BookmarkTreeNode[] {
  const result: chrome.bookmarks.BookmarkTreeNode[] = [];

  function traverse(node: chrome.bookmarks.BookmarkTreeNode) {
    if (node.url) {
      result.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return result;
}
