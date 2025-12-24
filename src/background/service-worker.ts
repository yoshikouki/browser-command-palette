// Import content script path (crxjs resolves this to the correct path)
import contentScript from "../content/content-script.ts?script";

// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "toggle-command-palette") {
    return;
  }
  if (!tab?.id) {
    return;
  }
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [contentScript],
  });
});
