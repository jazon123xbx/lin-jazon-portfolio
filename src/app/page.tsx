import Link from "next/link";
import { about, projects, skillGroups, siteConfig, contactMethods } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";
import PortfolioHub from "@/components/PortfolioHub";
import ProfilePortrait from "@/components/ProfilePortrait";
import Reveal from "@/components/Reveal";

const featuredProjects = [
  projects.find((p) => p.id === "tcgc-student-master"),
  projects.find((p) => p.id === "jazon-collective-market"),
  projects.find((p) => p.id === "blazingheart"),
].filter(Boolean) as typeof projects;

export default function Home() {
  return (
    <>
      {/* Portfolio Hub — first fold */}
      <PortfolioHub />

      {/* About */}
      <section id="about" className="relative overflow-hidden bg-grid">
        <Reveal>
        {/* Profile / Intro */}
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-8 sm:pt-28 sm:pb-10 lg:pt-36 lg:pb-12">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl animate-fade-in-up">
              <span className="ty-eyebrow mb-4 inline-block text-accent-gold">
                About
              </span>
              <h2 className="ty-hero text-text-primary">
                Hi, I&apos;m{" "}
                <span className="gradient-text">{siteConfig.author}.</span>
              </h2>
              <p className="mt-4 text-base font-semibold leading-snug text-accent-blue sm:text-lg">
                Creative Developer &amp; Problem Solver
              </p>
              <p className="ty-body mt-5 text-text-secondary">
                I build useful, creative, and meaningful digital experiences.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/#projects"
                  className="inline-flex items-center justify-center rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-blue-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
                >
                  View My Work
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
                >
                  Contact Me
                </Link>
              </div>
            </div>

            <ProfilePortrait src="/images/lin-profile.png" alt="Lin — Creative Developer & Problem Solver" />
          </div>
        </div>

        {/* Supporting Content */}
        <div className="mx-auto max-w-6xl space-y-8 px-6 sm:mt-4">
          {/* Journey */}
          <div className="max-w-3xl">
            <h3 className="ty-sub mb-2 text-accent-gold">
              Journey
            </h3>
            <p className="ty-body text-text-secondary">
              {about.journey}
            </p>
          </div>

          {/* Interests + Values */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="ty-sub mb-2 text-accent-gold">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.interests.map((item) => (
                  <span
                    key={item}
                    className="ty-chip rounded-full border border-border-subtle bg-bg-surface-elevated px-3 py-1.5 text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="ty-sub mb-2 text-accent-gold">
                Values
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {about.values.map((value) => (
                  <li
                    key={value}
                    className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-secondary"
                  >
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Career Direction */}
          <div className="max-w-3xl rounded-xl border border-border-subtle bg-bg-surface px-6 py-5">
            <h3 className="ty-sub mb-2 text-accent-gold">
              Career Direction
            </h3>
            <p className="ty-body text-text-secondary">
              {about.careerGoals}
            </p>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Selected Projects */}
      <section id="projects" className="border-t border-border-subtle">
        <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader
            label="Projects"
            title="Selected Work"
            description="A selection of projects I have worked on across web and game development."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-t border-border-subtle bg-bg-surface">
        <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader
            label="Capabilities"
            title="What I Work With"
            description="Technologies and tools I use to bring ideas to life."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div
                key={group.category}
                className="card rounded-xl border border-border-subtle bg-bg-primary p-6"
              >
                <h3 className="ty-sub mb-3 text-accent-gold">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="ty-chip rounded-md bg-bg-surface-elevated px-3 py-1.5 text-text-secondary"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-border-subtle bg-bg-surface">
        <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20 text-center">
          <SectionHeader
            label="Contact"
            title="Let's Connect"
            description="Have a project in mind or want to collaborate? I would love to hear from you."
            align="center"
          />
          <p className="ty-body mx-auto mb-8 max-w-md text-text-secondary">
            Currently open to new projects, collaborations, and learning opportunities.
          </p>
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contactMethods.map((method) => {
              const isStatic = method.label === "Email" || method.label === "WhatsApp" || method.label === "Backup Number";
              const isExternal = method.label === "Facebook" || method.label === "GitHub" || method.label === "LinkedIn";

              if (isStatic) {
                return (
                  <div
                    key={method.label}
                    className="card rounded-xl border border-border-subtle bg-bg-primary p-5 text-left transition-all duration-300 hover:border-border-accent"
                  >
                    <span className="ty-eyebrow text-accent-gold">
                      {method.label}
                    </span>
                    <p className="ty-body mt-2 text-text-secondary">
                      {method.value}
                    </p>
                  </div>
                );
              }

              return (
                <a
                  key={method.label}
                  href={method.href}
                  className="card group rounded-xl border border-border-subtle bg-bg-primary p-5 text-left transition-all duration-300 hover:border-border-accent"
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  <span className="ty-eyebrow text-accent-gold">
                    {method.label}
                  </span>
                  <p className="ty-body mt-2 text-text-secondary transition-colors group-hover:text-text-primary">
                    {method.value}
                  </p>
                </a>
              );
            })}
          </div>
        </Reveal>
      </section>
    </>
  );
}
