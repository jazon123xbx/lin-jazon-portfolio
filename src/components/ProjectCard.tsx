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
    <article className="group rounded-xl border border-border-subtle bg-bg-surface p-6 transition-all duration-300 hover:border-border-accent glow-card">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {project.category}
        </span>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            statusColors[project.status]
          )}
        >
          {project.status}
        </span>
      </div>

      {/* Title and description */}
      <h3 className="mb-2 text-xl font-bold text-text-primary transition-colors group-hover:text-accent-blue">
        {project.title}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-text-secondary">
        {project.description}
      </p>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-bg-surface-elevated px-2.5 py-1 text-xs text-text-secondary"
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
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue-dim"
          >
            View Details
          </a>
        )}
        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
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
