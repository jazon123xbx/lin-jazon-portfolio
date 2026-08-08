"use client";

import { useRef } from "react";
import type { Project } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const statusColors: Record<Project["status"], string> = {
  Planning: "bg-text-muted/20 text-text-secondary",
  "In Development": "bg-accent-blue/20 text-accent-blue",
  Completed: "bg-green-500/20 text-green-400",
  "Case Study": "bg-accent-gold/20 text-accent-gold",
};

interface ProjectShowcaseProps {
  projects: Project[];
}

export default function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  return (
    <ul className="flex flex-col gap-5">
      {projects.map((project, i) => (
        <ProjectRow key={project.id} project={project} index={i} />
      ))}
    </ul>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reversed = index % 2 === 1;

  // Desktop-only pointer tilt. matchMedia gate keeps it off on touch.
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--tilt-y", `${px * 4}deg`);
    el.style.setProperty("--tilt-x", `${-py * 4}deg`);
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--tilt-x", "0deg");
  };

  return (
    <li>
      <div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="group/proj tilt-card edge-glow relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface"
      >
        <div
          className={cn(
            "flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-center lg:gap-12",
            reversed && "lg:flex-row-reverse"
          )}
        >
          {/* Oversized index */}
          <div className="shrink-0">
            <span className="block font-mono text-5xl font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(45,127,249,0.4)] sm:text-6xl lg:text-7xl">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="ty-eyebrow text-text-muted">{project.category}</span>
              <span
                className={cn(
                  "ty-chip shrink-0 rounded-full px-3 py-1",
                  statusColors[project.status]
                )}
              >
                {project.status}
              </span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-text-primary transition-colors group-hover/proj:text-accent-blue sm:text-3xl">
              {project.title}
            </h3>

            <p className="ty-body mt-3 max-w-xl text-pretty text-text-secondary">
              {project.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="ty-chip rounded-md bg-bg-primary px-2.5 py-1 text-text-muted transition-colors group-hover/proj:text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Trailing marker */}
          <div className="hidden shrink-0 items-center gap-2 self-end lg:flex lg:self-center">
            <span className="ty-index text-text-muted transition-colors group-hover/proj:text-accent-blue">
              VIEW
            </span>
            <span
              aria-hidden="true"
              className="arrow-nudge text-accent-blue"
            >
              &rarr;
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
