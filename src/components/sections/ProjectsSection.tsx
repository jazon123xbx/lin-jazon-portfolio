/**
 * Projects section: renders the featured projects as a single showcase.
 * The page owns which projects are featured; this section owns layout and
 * the reveal animation. Project class instances cannot cross the
 * server/client boundary, so this server component flattens them to plain,
 * serializable snapshots exactly once before handing them to the client
 * showcase.
 */
import type { Project } from "@/data/portfolio";
import ProjectShowcase from "@/components/ProjectShowcase";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";

interface ProjectsSectionProps {
  projects: readonly Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const snapshots = projects.map((project) => project.toSnapshot());

  return (
    <section id="projects" className="relative border-t border-border-subtle">
      <span className="section-bg-word left-[-5%] top-[15%]" aria-hidden="true">
        WORK
      </span>

      <span className="section-coord right-6 top-6" aria-hidden="true">
        SEC.02 // PORTFOLIO
      </span>

      <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <SectionHeader
          label="Selected Work"
          title="Projects"
          description="A selection of projects I have worked on across web and game development."
        />

        <ProjectShowcase projects={snapshots} />
      </Reveal>
    </section>
  );
}
