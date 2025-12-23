import { useEffect, useState } from "react";
import { CommandPalette } from "../components/command-palette";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for toggle message from background script
    const handleMessage = (message: { type: string }) => {
      if (message.type === "TOGGLE_COMMAND_PALETTE") {
        setIsOpen((prev) => !prev);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Also listen for keyboard shortcut as fallback
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "p") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <CommandPalette onClose={() => setIsOpen(false)} open={isOpen} />;
}
