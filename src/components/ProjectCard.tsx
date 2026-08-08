import type { Project } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const statusColors: Record<Project["status"], string> = {
  Planning: "bg-text-muted/20 text-text-secondary",
  "In Development": "bg-accent-blue/20 text-accent-blue",
  Completed: "bg-green-500/20 text-green-400",
  "Case Study": "bg-accent-gold/20 text-accent-gold",
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group rounded-xl border border-border-subtle bg-bg-surface p-6 transition-all duration-300 hover:border-border-accent hover:bg-bg-surface-elevated glow-card active:scale-[0.98]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="ty-eyebrow text-text-muted">
          {project.category}
        </span>
        <span
          className={cn(
            "ty-chip shrink-0 rounded-full px-3 py-1",
            statusColors[project.status]
          )}
        >
          {project.status}
        </span>
      </div>

      {/* Title and description */}
      <h3 className="ty-card-title mb-2 text-text-primary transition-colors group-hover:text-accent-blue">
        {project.title}
      </h3>
      <p className="ty-body mb-4 text-text-secondary">
        {project.description}
      </p>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="ty-chip rounded-md bg-bg-primary px-2.5 py-1 text-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {project.detailsUrl && (
          <a
            href={project.detailsUrl}
            className="ty-action bg-accent-blue text-white hover:bg-accent-blue-dim"
          >
            View Details
          </a>
        )}
        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            className="ty-action border border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source Code
          </a>
        )}
      </div>
    </article>
  );
}
