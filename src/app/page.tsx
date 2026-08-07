import Link from "next/link";
import { about, projects, skillGroups, siteConfig } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";
import PortfolioHub from "@/components/PortfolioHub";

const featuredProjects = [
  projects.find((p) => p.id === "jay-the-barber"),
  projects.find((p) => p.id === "jazon-collective-market"),
  projects.find((p) => p.id === "godot-game-project"),
].filter(Boolean) as typeof projects;

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-grid">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl animate-fade-in-up">
              <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.2em] text-accent-gold">
                Student Developer and Digital Creator
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                Hi, I&apos;m{" "}
                <span className="gradient-text">{siteConfig.author}.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
                I build useful, creative, and meaningful digital experiences.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/#projects"
                  className="inline-flex items-center justify-center rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-dim"
                >
                  View My Work
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
                >
                  Contact Me
                </Link>
              </div>
            </div>

            {/* LJ Monogram */}
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-border-accent bg-bg-surface sm:h-64 sm:w-64">
              <span className="text-4xl font-bold text-accent-blue sm:text-5xl">
                LJ
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Hub */}
      <PortfolioHub />

      {/* Selected Projects */}
      <section id="projects" className="border-t border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            label="Projects"
            title="Selected Work"
            description="A selection of projects I have worked on across web and game development."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-t border-border-subtle bg-bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            label="Capabilities"
            title="What I Work With"
            description="Technologies and tools I use to bring ideas to life."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div
                key={group.category}
                className="rounded-xl border border-border-subtle bg-bg-primary p-6"
              >
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-gold">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="rounded-md bg-bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            label="About"
            title="A Little About Me"
            description={about.intro}
          />
          <div className="max-w-3xl space-y-6 text-text-secondary">
            <p>{about.journey}</p>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-gold">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.interests.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-gold">
                Values
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {about.values.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-text-muted">{about.careerGoals}</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-border-subtle bg-bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <SectionHeader
            label="Contact"
            title="Let's Connect"
            description="Have a project in mind or want to collaborate? I would love to hear from you."
            align="center"
          />
          <p className="mx-auto mb-8 max-w-md text-sm text-text-secondary">
            Currently open to new projects, collaborations, and learning opportunities.
          </p>
        </div>
      </section>
    </>
  );
}
