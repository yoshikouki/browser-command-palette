import type {
  CategoryCommand,
  Command,
  CommandCategory,
  DynamicItem,
  StaticCommand,
} from "./types";

class CommandRegistry {
  private readonly staticCommands: Map<string, StaticCommand> = new Map();
  private readonly categoryCommands: Map<string, CategoryCommand> = new Map();
  private readonly dynamicItemGenerators: Map<
    CommandCategory,
    () => Promise<DynamicItem[]>
  > = new Map();

  // Register a static command
  registerStatic(command: StaticCommand): void {
    this.staticCommands.set(command.id, command);
  }

  // Register a category command
  registerCategory(command: CategoryCommand): void {
    this.categoryCommands.set(command.id, command);
  }

  // Register a generator for dynamic items
  registerDynamicGenerator(
    category: CommandCategory,
    generator: () => Promise<DynamicItem[]>
  ): void {
    this.dynamicItemGenerators.set(category, generator);
  }

  // Get all static commands
  getStaticCommands(): StaticCommand[] {
    return Array.from(this.staticCommands.values());
  }

  // Get all category commands
  getCategoryCommands(): CategoryCommand[] {
    return Array.from(this.categoryCommands.values());
  }

  // Get commands for initial view (categories + static commands)
  getInitialCommands(): Command[] {
    return [...this.getCategoryCommands(), ...this.getStaticCommands()];
  }

  // Get dynamic items for a specific category
  getDynamicItems(category: CommandCategory): Promise<DynamicItem[]> {
    const generator = this.dynamicItemGenerators.get(category);
    if (!generator) {
      return Promise.resolve([]);
    }
    return generator();
  }

  // Get all searchable items (for search mode)
  async getAllSearchableItems(): Promise<Command[]> {
    const staticCommands = this.getStaticCommands();
    const categoryCommands = this.getCategoryCommands();

    const dynamicItemPromises = Array.from(
      this.dynamicItemGenerators.entries()
    ).map(([_, generator]) => generator());

    const dynamicItemsArrays = await Promise.all(dynamicItemPromises);
    const allDynamicItems = dynamicItemsArrays.flat();

    return [...categoryCommands, ...staticCommands, ...allDynamicItems];
  }

  // Clear all commands (useful for testing or reset)
  clear(): void {
    this.staticCommands.clear();
    this.categoryCommands.clear();
    this.dynamicItemGenerators.clear();
  }
}

// Singleton instance
export const commandRegistry = new CommandRegistry();
