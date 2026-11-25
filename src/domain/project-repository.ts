import { Project } from "./project";

export interface ProjectRepositoryOptions {
  /** Ordered ids that should appear in the featured project section. */
  featuredIds?: readonly string[];
}

/**
 * Collection of projects.
 *
 * WHY: The page should ask a repository for the projects it needs instead of
 * filtering a raw array inline. The repository also protects its internal
 * collection and guarantees that ids stay unique.
 */
export class ProjectRepository {
  readonly #projects: readonly Project[];
  readonly #featuredIds: ReadonlySet<string>;

  constructor(
    projects: readonly Project[],
    options: ProjectRepositoryOptions = {}
  ) {
    const ids = new Set<string>();

    for (const project of projects) {
      if (ids.has(project.id)) {
        throw new Error(`Duplicate project id "${project.id}".`);
      }

      ids.add(project.id);
    }

    const featuredIds = options.featuredIds ?? [];

    for (const id of featuredIds) {
      if (!ids.has(id)) {
        throw new Error(
          `Featured project id "${id}" does not exist in the repository.`
        );
      }
    }

    this.#projects = Object.freeze([...projects]);
    this.#featuredIds = new Set(featuredIds);
  }

  get size(): number {
    return this.#projects.length;
  }

  all(): readonly Project[] {
    return this.#projects;
  }

  findById(id: string): Project | undefined {
    return this.#projects.find((project) => project.id === id);
  }

  featured(): readonly Project[] {
    if (this.#featuredIds.size === 0) {
      return this.#projects;
    }

    // Filtering keeps the repository's authored order, which is also the
    // visual order used by the projects section.
    return this.#projects.filter((project) =>
      this.#featuredIds.has(project.id)
    );
  }

  search(query: string): readonly Project[] {
    return this.#projects.filter((project) => project.matches(query));
  }
}
