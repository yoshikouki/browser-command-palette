import { clipboardCommands } from "./clipboard-commands";
import { pageCommands } from "./page-commands";
import { commandRegistry } from "./registry";

// Register all built-in commands
commandRegistry.registerAll([...pageCommands, ...clipboardCommands]);

// Re-export registry and types
export { commandRegistry } from "./registry";
export type * from "./types";
