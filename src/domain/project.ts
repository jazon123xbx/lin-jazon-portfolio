import { assertNonEmptyText, assertSlug } from "./validation";

/**
 * Project domain model.
 *
 * WHY: A project used to be only an object shape. Giving it a class lets one
 * place own the rules that make a project valid, and lets the rest of the app
 * work with a stable, read-only object instead of a mutable literal.
 */

export type ProjectStatus =
  | "Planning"
  | "In Development"
  | "Completed"
  | "Case Study";

export type MediaType = "image" | "video";

export interface ProjectMedia {
  type: MediaType;
  src: string;
  alt: string;
  label?: string;
  width?: number;
  height?: number;
}

export interface ProjectInput {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: readonly string[];
  status: ProjectStatus;
  media: readonly ProjectMedia[];
  detailsUrl?: string;
  sourceUrl?: string;
}

/** Plain, mutable copy of a project, safe to hand to a client boundary. */
export interface ProjectSnapshot {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: ProjectStatus;
  media: ProjectMedia[];
  detailsUrl?: string;
  sourceUrl?: string;
}

const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "Planning",
  "In Development",
  "Completed",
  "Case Study",
];

const MEDIA_TYPES: readonly MediaType[] = ["image", "video"];

function freezeMedia(media: readonly ProjectMedia[]): readonly ProjectMedia[] {
  return Object.freeze(
    media.map((item) => {
      if (!MEDIA_TYPES.includes(item.type)) {
        throw new Error(`Unsupported project media type "${item.type}".`);
      }

      const copy: ProjectMedia = {
        type: item.type,
        src: assertNonEmptyText(item.src, "project media src"),
        alt: assertNonEmptyText(item.alt, "project media alt"),
      };

      if (item.label !== undefined) {
        if (typeof item.label !== "string") {
          throw new Error("project media label must be a string.");
        }
        copy.label = assertNonEmptyText(item.label, "project media label");
      }

      if (item.width !== undefined || item.height !== undefined) {
        for (const dimension of [item.width, item.height]) {
          if (
            typeof dimension !== "number" ||
            !Number.isFinite(dimension) ||
            !Number.isInteger(dimension) ||
            dimension <= 0
          ) {
            throw new Error(
              "project media width and height must both be finite positive integers."
            );
          }
        }
        copy.width = item.width;
        copy.height = item.height;
      }

      return Object.freeze(copy);
    })
  );
}

export class Project {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly status: ProjectStatus;
  readonly media: readonly ProjectMedia[];
  readonly detailsUrl?: string;
  readonly sourceUrl?: string;

  constructor(input: ProjectInput) {
    this.id = assertSlug(input.id, "Project id");
    this.title = assertNonEmptyText(input.title, "Project title");
    this.description = assertNonEmptyText(
      input.description,
      "Project description"
    );
    this.category = assertNonEmptyText(input.category, "Project category");

    if (!PROJECT_STATUSES.includes(input.status)) {
      throw new Error(`Unsupported project status "${input.status}".`);
    }

    this.status = input.status;

    // Copy the collections so later changes outside the class cannot alter a
    // project after it has been constructed.
    this.tags = Object.freeze(
      input.tags.map((tag) => assertNonEmptyText(tag, "Project tag"))
    );
    this.media = freezeMedia(input.media);

    this.detailsUrl = input.detailsUrl?.trim() || undefined;
    this.sourceUrl = input.sourceUrl?.trim() || undefined;
  }

  get hasMedia(): boolean {
    return this.media.length > 0;
  }

  get hasLinks(): boolean {
    return Boolean(this.detailsUrl || this.sourceUrl);
  }

  /** Used by ProjectRepository.search so search rules live with the project. */
  matches(query: string): boolean {
    const needle = query.trim().toLowerCase();

    if (needle.length === 0) {
      return true;
    }

    return [
      this.title,
      this.description,
      this.category,
      this.status,
      ...this.tags,
    ].some((value) => value.toLowerCase().includes(needle));
  }

  /**
   * WHY: React Server Components cannot pass class instances across a
   * server/client boundary. This method makes that conversion explicit.
   */
  toSnapshot(): ProjectSnapshot {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      tags: [...this.tags],
      status: this.status,
      media: this.media.map((item) => ({ ...item })),
      detailsUrl: this.detailsUrl,
      sourceUrl: this.sourceUrl,
    };
  }
}
