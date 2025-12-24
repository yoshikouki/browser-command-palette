// Import content script path (crxjs resolves this to the correct path)
import contentScript from "../content/content-script.ts?script";

async function injectCommandPalette(tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [contentScript],
  });
}

// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "toggle-command-palette") {
    return;
  }
  if (!tab?.id) {
    return;
  }
  await injectCommandPalette(tab.id);
});

// Listen for runtime messages (for testing)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "INJECT_COMMAND_PALETTE" && message.tabId) {
    injectCommandPalette(message.tabId)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});
