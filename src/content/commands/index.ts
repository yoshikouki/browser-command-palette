// Import all command modules to register them
import "./tab-commands";
import "./bookmark-commands";
import "./history-commands";

// Re-export registry and types
export { commandRegistry } from "./registry";
export type * from "./types";
