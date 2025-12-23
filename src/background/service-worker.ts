// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "toggle-command-palette") {
    return;
  }
  if (!tab?.id) {
    return;
  }
  await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_COMMAND_PALETTE" });
});
