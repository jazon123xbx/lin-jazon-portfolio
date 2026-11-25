import { CapabilityModule } from "./capability-module";

/**
 * Collection of capability modules.
 *
 * WHY: The page and the navigation both need modules by stable identity.
 * A registry keeps one lookup table and rejects duplicate ids or indexes,
 * which would otherwise make anchors or spotlight lookups ambiguous.
 */
export class CapabilityRegistry {
  readonly #modules: readonly CapabilityModule[];
  readonly #byId: ReadonlyMap<string, CapabilityModule>;
  readonly #byModuleIndex: ReadonlyMap<string, CapabilityModule>;

  constructor(modules: readonly CapabilityModule[]) {
    const byId = new Map<string, CapabilityModule>();
    const byModuleIndex = new Map<string, CapabilityModule>();

    for (const capability of modules) {
      if (byId.has(capability.id)) {
        throw new Error(`Duplicate capability module id "${capability.id}".`);
      }

      if (byModuleIndex.has(capability.moduleIndex)) {
        throw new Error(
          `Duplicate capability module index "${capability.moduleIndex}".`
        );
      }

      byId.set(capability.id, capability);
      byModuleIndex.set(capability.moduleIndex, capability);
    }

    this.#modules = Object.freeze([...modules]);
    this.#byId = byId;
    this.#byModuleIndex = byModuleIndex;
  }

  get size(): number {
    return this.#modules.length;
  }

  all(): readonly CapabilityModule[] {
    return this.#modules;
  }

  findById(id: string): CapabilityModule | undefined {
    return this.#byId.get(id);
  }

  findByModuleIndex(moduleIndex: string): CapabilityModule | undefined {
    return this.#byModuleIndex.get(moduleIndex);
  }

  /** Returns modules in the caller's requested order, failing on a typo. */
  select(moduleIndexes: readonly string[]): readonly CapabilityModule[] {
    return moduleIndexes.map((moduleIndex) => {
      const capability = this.#byModuleIndex.get(moduleIndex);

      if (!capability) {
        throw new Error(
          `Unknown capability module index "${moduleIndex}".`
        );
      }

      return capability;
    });
  }
}
