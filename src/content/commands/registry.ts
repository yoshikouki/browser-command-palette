import type { Command, CommandCategory } from "./types";

/**
 * Command Registry
 *
 * Simple, scalable command management.
 * - All commands are registered at initialization
 * - Flat list with category metadata for filtering
 * - Optimized for search across hundreds of commands
 */
class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  /**
   * Register a single command
   */
  register(command: Command): void {
    if (this.commands.has(command.id)) {
      console.warn(`Command "${command.id}" already registered, skipping.`);
      return;
    }
    this.commands.set(command.id, command);
  }

  /**
   * Register multiple commands at once
   */
  registerAll(commands: Command[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }

  /**
   * Get all commands
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands filtered by category
   */
  getByCategory(category: CommandCategory): Command[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }

  /**
   * Get a specific command by ID
   */
  get(id: string): Command | undefined {
    return this.commands.get(id);
  }

  /**
   * Remove a command by ID
   */
  unregister(id: string): boolean {
    return this.commands.delete(id);
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
  }

  /**
   * Get total command count
   */
  get size(): number {
    return this.commands.size;
  }
}

// Singleton instance
export const commandRegistry = new CommandRegistry();
