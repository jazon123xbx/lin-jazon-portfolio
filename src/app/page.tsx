import Link from "next/link";
import { about, aboutIdentity, featuredProjects, skillGroups, siteConfig, contactMethods } from "@/data/portfolio";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";
import PortfolioHub from "@/components/PortfolioHub";
import ProfilePortrait from "@/components/ProfilePortrait";
import Reveal from "@/components/Reveal";
import SystemThread from "@/components/SystemThread";
import ContactIcons from "@/components/ContactIcons";
import ProjectArtwork from "@/components/ProjectArtwork";

export default function Home() {
  return (
    <>
      {/* ── Portfolio Hub — first fold ─────────────────────────── */}
      <PortfolioHub />

      {/* ── About ──────────────────────────────────────────────── */}
      <section id="about" className="relative overflow-hidden bg-grid">
        {/* Background word */}
        <span className="section-bg-word right-[-5%] top-[10%]" aria-hidden="true">
          ABOUT
        </span>

        {/* Coordinate label */}
        <span className="section-coord left-6 top-6" aria-hidden="true">
          SEC.01 // 24.0°N
        </span>

        {/* Signal line */}
        <div className="section-signal-line left-0 top-1/2 h-px w-full" aria-hidden="true" />

        <Reveal>
          <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-8 sm:pt-28 sm:pb-10 lg:pt-36 lg:pb-12">
            {/* Desktop: 35/65 two-column — left portrait+identity, right heading+narrative
                Mobile: heading+intro → portrait → identity (via order classes) */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:items-start">
              {/* ── Left: portrait + identity — mobile order-2, desktop left ── */}
              <div className="order-2 lg:order-1 flex flex-col items-center gap-6 sm:w-[224px] lg:mx-auto">
                {/* Portrait with 4:5 technical frame */}
                <div className="relative w-full">
                  {/* Technical frame brackets */}
                  <div className="pointer-events-none absolute -left-3 -top-3 h-6 w-6 border-l border-t border-accent-blue/20" aria-hidden="true" />
                  <div className="pointer-events-none absolute -right-3 -top-3 h-6 w-6 border-r border-t border-accent-blue/20" aria-hidden="true" />
                  <div className="pointer-events-none absolute -bottom-3 -left-3 h-6 w-6 border-b border-l border-accent-blue/20" aria-hidden="true" />
                  <div className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-accent-blue/20" aria-hidden="true" />
                  <ProfilePortrait src="/images/lin-profile.png" alt="Lin — Creative Developer & Problem Solver" />
                  {/* Technical label — decorative */}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-accent-blue/30" aria-hidden="true">
                    PORTRAIT // SEC.01
                  </span>
                </div>

                {/* Identity record — compact 2-col layout, mapped from source */}
                <dl className="pointer-events-none w-full rounded-md border border-border-subtle bg-bg-primary/80 px-3 py-2.5">
                  <span className="mb-2 block text-[8px] font-mono uppercase tracking-widest text-accent-gold/60" aria-hidden="true">
                    PROFILE // IDENTITY RECORD
                  </span>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {aboutIdentity.map((field, i) => (
                      <div
                        key={field.label}
                        className={`min-w-0 border-t border-accent-blue/10 pt-1.5 first:border-0 first:pt-0 ${
                          i === 0 || i === 3 ? "col-span-2" : ""
                        }`}
                      >
                        <dt className="text-[8px] font-mono uppercase tracking-wider text-accent-blue/50">
                          {field.label}
                        </dt>
                        <dd className="text-[10px] font-mono normal-case text-text-primary/90 min-w-0 break-words">
                          {field.value}
                        </dd>
                      </div>
                    ))}
                  </div>
                  <span className="mt-2 block text-right text-[7px] font-mono text-accent-blue/20" aria-hidden="true">
                    ID RECORD
                  </span>
                </dl>
              </div>

              {/* ── Right: heading + narrative — mobile order-1, desktop right ── */}
              <div className="order-1 lg:order-2">
                <span className="ty-eyebrow mb-4 inline-block text-accent-gold">
                  About
                </span>
                <h2 className="ty-hero text-text-primary">
                  Hi, I&apos;m{" "}
                  <span className="gradient-text">{siteConfig.author}.</span>
                </h2>
                <p className="text-base font-semibold leading-snug text-text-secondary sm:text-lg">
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
            </div>
          </div>

          {/* Supporting Content — editorial layout */}
          <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-6 sm:mt-4">
            {/* Journey */}
            <div className="max-w-3xl">
              <h3 className="ty-sub mb-2 text-accent-gold">
                Journey
              </h3>
              <p className="ty-body text-text-secondary">
                {about.journey}
              </p>
            </div>

            {/* Interests + Values — asymmetric grid */}
            <Reveal variant="stagger" className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <h3 className="ty-sub mb-2 text-accent-gold">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {about.interests.map((item) => (
                    <span
                      key={item}
                      className="ty-chip rounded-md border border-border-subtle bg-bg-surface-elevated px-3 py-1.5 text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <h3 className="ty-sub mb-2 text-accent-gold">
                  Values
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {about.values.map((value) => (
                    <li
                      key={value}
                      className="flex items-start gap-2.5 rounded-md border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-secondary"
                    >
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Career Direction */}
            <Reveal variant="clip-wipe">
              <div className="max-w-3xl rounded-lg border border-border-subtle bg-bg-surface px-6 py-5">
                <h3 className="ty-sub mb-2 text-accent-gold">
                  Career Direction
                </h3>
                <p className="ty-body text-text-secondary">
                  {about.careerGoals}
                </p>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </section>

      {/* ── SystemThread connector ── */}
      <SystemThread />

      {/* ── Selected Projects ──────────────────────────────────── */}
      <section id="projects" className="relative border-t border-border-subtle">
        {/* Background word */}
        <span className="section-bg-word left-[-5%] top-[15%]" aria-hidden="true">
          WORK
        </span>

        {/* Coordinate label */}
        <span className="section-coord right-6 top-6" aria-hidden="true">
          SEC.02 // PORTFOLIO
        </span>

        <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader
            label="Selected Work"
            title="Projects"
            description="A selection of projects I have worked on across web and game development."
          />

          {/* Alternating full-width editorial rows */}
          <div className="space-y-8">
            {featuredProjects.map((project, index) => (
              <Reveal key={project.id} variant="bracket-expand" delay={index * 100}>
                <div className="group/project grid grid-cols-1 gap-6 rounded-lg border border-border-subtle bg-bg-surface p-5 transition-all duration-300 hover:border-border-accent hover:bg-bg-surface-elevated sm:p-6 lg:grid-cols-12">
                  {/* Artwork — alternate sides: 01 left, 02 right, 03 left */}
                  <div className={`lg:col-span-7 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                    <ProjectArtwork projectId={project.id} className="aspect-[4/3]" />
                  </div>

                  {/* Content — alternate sides */}
                  <div className={`flex flex-col justify-center lg:col-span-5 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    {/* Project number */}
                    <span className="mb-2 text-[10px] font-mono text-accent-blue/30" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <ProjectCard project={project} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── SystemThread connector ── */}
      <SystemThread />

      {/* ── Capabilities ───────────────────────────────────────── */}
      <section id="capabilities" className="relative border-t border-border-subtle bg-bg-surface">
        {/* Background word */}
        <span className="section-bg-word right-[-5%] top-[20%]" aria-hidden="true">
          MODULES
        </span>

        {/* Coordinate label */}
        <span className="section-coord left-6 top-6" aria-hidden="true">
          SEC.03 // SYS.MODULES
        </span>

        <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader
            label="Capabilities"
            title="LIN.OS Modules"
            description="Technologies and tools I use to bring ideas to life."
          />
          {/* Compact indexed registers */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div
                key={group.category}
                className="skill-module group rounded-lg border border-border-subtle bg-bg-primary px-5 py-4 transition-colors hover:border-border-accent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="ty-eyebrow text-accent-blue">
                      {group.moduleIndex}
                    </span>
                    <span className="ty-sub text-accent-gold">
                      {group.category}
                    </span>
                  </div>
                  <span className="ty-chip rounded bg-accent-blue/10 px-2 py-0.5 text-accent-blue/60">
                    REGISTERED
                  </span>
                </div>
                {/* Skill names only — no levels */}
                <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
                  {group.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="font-mono text-[10px] text-text-muted"
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

      {/* ── SystemThread connector ── */}
      <SystemThread />

      {/* ── Contact ────────────────────────────────────────────── */}
      <section id="contact" className="relative border-t border-border-subtle bg-bg-surface">
        {/* Background word */}
        <span className="section-bg-word left-[10%] top-[10%]" aria-hidden="true">
          COMM
        </span>

        {/* Coordinate label */}
        <span className="section-coord right-6 top-6" aria-hidden="true">
          SEC.04 // COMM.LINK
        </span>

        <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader
            label="Contact"
            title="HAVE AN IDEA?"
            description="Let's build something useful."
          />
          <ContactIcons methods={contactMethods} />
        </Reveal>
      </section>
    </>
  );
}
