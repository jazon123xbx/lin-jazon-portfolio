import Link from "next/link";
import { about, projects, skillGroups, siteConfig } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-grid">
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
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-dim"
                >
                  View My Work
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
                >
                  Contact Me
                </Link>
              </div>
            </div>

            {/* Monogram placeholder */}
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-border-accent bg-bg-surface sm:h-64 sm:w-64">
              <span className="text-4xl font-bold text-accent-blue sm:text-5xl">
                LJ
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="border-t border-border-subtle bg-bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            label="About"
            title="A Little About Me"
            description={about.intro}
          />
          <Link
            href="/about"
            className="inline-flex items-center text-sm font-medium text-accent-blue transition-colors hover:text-accent-blue-dim"
          >
            Read more
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            label="Projects"
            title="Featured Work"
            description="A selection of projects I've worked on across web, mobile, and game development."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/projects"
              className="inline-flex items-center text-sm font-medium text-accent-blue transition-colors hover:text-accent-blue-dim"
            >
              View all projects
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Preview */}
      <section className="border-t border-border-subtle bg-bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            label="Skills"
            title="What I Work With"
            description="Technologies and tools I use to bring ideas to life."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.slice(0, 3).map((group) => (
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
          <div className="mt-10">
            <Link
              href="/skills"
              className="inline-flex items-center text-sm font-medium text-accent-blue transition-colors hover:text-accent-blue-dim"
            >
              View all skills
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <SectionHeader
            label="Contact"
            title="Let's Connect"
            description="Have a project in mind or want to collaborate? I'd love to hear from you."
            align="center"
          />
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-accent-blue px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-dim"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
