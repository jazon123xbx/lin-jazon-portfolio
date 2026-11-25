import { assertNonEmptyText, assertSlug } from "./validation";

/**
 * Capability module domain model.
 *
 * WHY: Each LIN.OS module now owns a stable anchor id. That keeps navigation
 * links, the vanilla spotlight script, and the React cards pointing at the
 * same module even if a display label changes later.
 */

export type SkillLevel =
  | "Currently Learning"
  | "Familiar"
  | "Project Experience"
  | "Comfortable";

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface CapabilityModuleInput {
  /** URL-safe anchor id, for example "frontend-development". */
  id: string;
  /** Display index used by the spotlight script, for example "MOD-01". */
  moduleIndex: string;
  category: string;
  skills: readonly Skill[];
}

const SKILL_LEVELS: readonly SkillLevel[] = [
  "Currently Learning",
  "Familiar",
  "Project Experience",
  "Comfortable",
];

const MODULE_INDEX_PATTERN = /^MOD-\d{2}$/;

export class CapabilityModule {
  readonly id: string;
  readonly moduleIndex: string;
  readonly category: string;
  readonly skills: readonly Skill[];

  constructor(input: CapabilityModuleInput) {
    this.id = assertSlug(input.id, "Capability module id");

    const moduleIndex = assertNonEmptyText(
      input.moduleIndex,
      "Capability module index"
    );

    if (!MODULE_INDEX_PATTERN.test(moduleIndex)) {
      throw new Error(
        `Capability module index "${moduleIndex}" must look like "MOD-01".`
      );
    }

    this.moduleIndex = moduleIndex;
    this.category = assertNonEmptyText(
      input.category,
      "Capability module category"
    );

    if (input.skills.length === 0) {
      throw new Error(`Capability module "${this.id}" must list at least one skill.`);
    }

    const names = new Set<string>();

    this.skills = Object.freeze(
      input.skills.map((skill) => {
        const name = assertNonEmptyText(skill.name, "Skill name");

        if (!SKILL_LEVELS.includes(skill.level)) {
          throw new Error(`Unsupported skill level "${skill.level}".`);
        }

        if (names.has(name)) {
          throw new Error(
            `Duplicate skill "${name}" in capability module "${this.id}".`
          );
        }

        names.add(name);

        return Object.freeze({ name, level: skill.level });
      })
    );
  }

  get skillNames(): readonly string[] {
    return this.skills.map((skill) => skill.name);
  }

  hasSkill(name: string): boolean {
    const needle = name.trim().toLowerCase();

    return this.skills.some(
      (skill) => skill.name.toLowerCase() === needle
    );
  }
}
