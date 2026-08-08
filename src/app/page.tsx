import Link from "next/link";
import { about, projects, skillGroups, siteConfig } from "@/data/portfolio";
import PortfolioHub from "@/components/PortfolioHub";
import ProfilePortrait from "@/components/ProfilePortrait";
import SectionShell from "@/components/SectionShell";
import ProjectShowcase from "@/components/ProjectShowcase";
import CapabilityModules from "@/components/CapabilityModules";
import ContactOutro from "@/components/ContactOutro";

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

      {/* 01 — About */}
      <section id="about" className="relative overflow-hidden bg-grid">
        <SectionShell
          index="01"
          label="About"
          megaWord="ABOUT"
          megaAlign="right"
          title={
            <>
              Hi, I&apos;m{" "}
              <span className="gradient-text">{siteConfig.author}.</span>
            </>
          }
          description="I build useful, creative, and meaningful digital experiences."
        >
          <div className="flex flex-col gap-12">
            {/* Intro + portrait */}
            <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-base font-semibold leading-snug text-accent-blue sm:text-lg">
                  Creative Developer &amp; Problem Solver
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

              <ProfilePortrait
                src="/images/lin-profile.png"
                alt="Lin — Creative Developer & Problem Solver"
              />
            </div>

            {/* Journey */}
            <div className="max-w-3xl">
              <h3 className="ty-sub mb-2 text-accent-gold">Journey</h3>
              <p className="ty-body text-text-secondary">{about.journey}</p>
            </div>

            {/* Interests + Values */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="ty-sub mb-3 text-accent-gold">Interests</h3>
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
                <h3 className="ty-sub mb-3 text-accent-gold">Values</h3>
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
              <h3 className="ty-sub mb-2 text-accent-gold">Career Direction</h3>
              <p className="ty-body text-text-secondary">
                {about.careerGoals}
              </p>
            </div>
          </div>
        </SectionShell>
      </section>

      {/* 02 — Projects */}
      <section id="projects" className="relative overflow-hidden border-t border-border-subtle">
        <SectionShell
          index="02"
          label="Projects"
          megaWord="WORK"
          megaAlign="left"
          title="Selected Work"
          description="A selection of projects I have worked on across web and game development."
        >
          <ProjectShowcase projects={featuredProjects} />
        </SectionShell>
      </section>

      {/* 03 — Capabilities */}
      <section
        id="capabilities"
        className="relative overflow-hidden border-t border-border-subtle bg-bg-surface"
      >
        <SectionShell
          index="03"
          label="Capabilities"
          megaWord="STACK"
          megaAlign="right"
          title="What I Work With"
          description="Technologies and tools I use to bring ideas to life."
        >
          <CapabilityModules groups={skillGroups} />
        </SectionShell>
      </section>

      {/* 04 — Contact */}
      <section
        id="contact"
        className="relative overflow-hidden border-t border-border-subtle bg-bg-surface"
      >
        <SectionShell
          index="04"
          label="Contact"
          megaWord="CONTACT"
          megaAlign="left"
          title="Let's Connect"
        >
          <ContactOutro />
        </SectionShell>
      </section>
    </>
  );
}
