import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { type Command as CommandType, commandRegistry } from "../../commands";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [commands, setCommands] = useState<CommandType[]>([]);

  // Reset state when palette closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // Load commands when palette opens
  useEffect(() => {
    if (open) {
      setCommands(commandRegistry.getAll());
    }
  }, [open]);

  // Handle command selection
  const handleSelect = (command: CommandType) => {
    command.action();
    onClose();
  };

  // Handle escape key
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
          <div className="flex items-center border-border border-b">
            <Command.Input
              autoFocus
              className="flex-1"
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              value={search}
            />
          </div>
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            {commands.map((item) => (
              <Command.Item
                key={item.id}
                onSelect={() => handleSelect(item)}
                value={`${item.title} ${item.subtitle || ""} ${item.keywords?.join(" ") || ""}`}
              >
                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate font-medium">{item.title}</span>
                  {item.subtitle && (
                    <span className="truncate text-muted-foreground text-xs">
                      {item.subtitle}
                    </span>
                  )}
                </div>
                {item.shortcut && (
                  <kbd className="ml-auto text-muted-foreground text-xs">
                    {item.shortcut}
                  </kbd>
                )}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
