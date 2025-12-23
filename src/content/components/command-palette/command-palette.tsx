import { Command } from "cmdk";
import { ChevronRight, Pin, PinOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type CommandCategory,
  type Command as CommandType,
  commandRegistry,
  type DynamicItem,
  type TabItemMetadata,
} from "../../commands";
import {
  createCloseTabAction,
  createPinTabAction,
} from "../../commands/tab-commands";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

type ViewMode = "initial" | "category" | "search";

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("initial");
  const [currentCategory, setCurrentCategory] =
    useState<CommandCategory | null>(null);
  const [initialCommands, setInitialCommands] = useState<CommandType[]>([]);
  const [categoryItems, setCategoryItems] = useState<DynamicItem[]>([]);
  const [searchResults, setSearchResults] = useState<CommandType[]>([]);

  // Reset state when palette closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setViewMode("initial");
      setCurrentCategory(null);
      setCategoryItems([]);
      setSearchResults([]);
    }
  }, [open]);

  // Load initial commands when palette opens
  useEffect(() => {
    if (open && viewMode === "initial") {
      setInitialCommands(commandRegistry.getInitialCommands());
    }
  }, [open, viewMode]);

  // Load category items when a category is selected
  useEffect(() => {
    if (viewMode === "category" && currentCategory) {
      commandRegistry.getDynamicItems(currentCategory).then(setCategoryItems);
    }
  }, [viewMode, currentCategory]);

  // Search mode: load all searchable items
  useEffect(() => {
    if (viewMode === "search" && search.length > 0) {
      commandRegistry.getAllSearchableItems().then(setSearchResults);
    }
  }, [viewMode, search]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.length > 0 && viewMode !== "search") {
      setViewMode("search");
    } else if (value.length === 0 && viewMode === "search") {
      setViewMode(currentCategory ? "category" : "initial");
    }
  };

  // Handle command selection
  const handleSelect = (command: CommandType) => {
    if (command.type === "category") {
      setCurrentCategory(command.category);
      setViewMode("category");
      setSearch("");
    } else if (command.type === "static" || command.type === "dynamic") {
      command.action();
      onClose();
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (viewMode === "category") {
      setViewMode("initial");
      setCurrentCategory(null);
      setCategoryItems([]);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewMode === "category") {
          e.preventDefault();
          handleBack();
        } else {
          onClose();
        }
      } else if (
        e.key === "Backspace" &&
        search === "" &&
        viewMode === "category"
      ) {
        e.preventDefault();
        handleBack();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, viewMode, search, onClose]);

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

  // Determine which items to display
  const getDisplayItems = (): CommandType[] => {
    if (viewMode === "search") {
      return searchResults;
    }
    if (viewMode === "category") {
      return categoryItems;
    }
    return initialCommands;
  };

  const displayItems = getDisplayItems();

  // Get placeholder text
  const getPlaceholder = (): string => {
    if (viewMode === "category" && currentCategory) {
      return `Search ${currentCategory}...`;
    }
    return "Type a command or search...";
  };

  return (
    <div
      className="command-palette-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape" && viewMode === "initial") {
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={`command-palette-container ${isDarkMode ? "dark" : ""}`}>
        <Command shouldFilter={viewMode === "search"}>
          <div className="flex items-center border-border border-b">
            {viewMode === "category" && (
              <button
                className="px-3 py-4 text-muted-foreground hover:text-foreground"
                onClick={handleBack}
                type="button"
              >
                ←
              </button>
            )}
            <Command.Input
              autoFocus
              className="flex-1"
              onValueChange={handleSearchChange}
              placeholder={getPlaceholder()}
              value={search}
            />
          </div>
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            {displayItems.map((item) => (
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
                {item.type === "category" && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {item.type === "dynamic" && item.category === "tabs" && (
                  <TabActions item={item} />
                )}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

// Tab-specific action buttons
function TabActions({ item }: { item: DynamicItem }) {
  const metadata = item.metadata as TabItemMetadata | undefined;
  if (!metadata) {
    return null;
  }

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    createPinTabAction(metadata.tabId, metadata.pinned)();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    createCloseTabAction(metadata.tabId)();
  };

  return (
    <div className="flex gap-1">
      <button
        className="rounded p-1 hover:bg-secondary"
        onClick={handlePin}
        title={metadata.pinned ? "Unpin tab" : "Pin tab"}
        type="button"
      >
        {metadata.pinned ? (
          <PinOff className="h-3 w-3" />
        ) : (
          <Pin className="h-3 w-3" />
        )}
      </button>
      <button
        className="rounded p-1 hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleClose}
        title="Close tab"
        type="button"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
