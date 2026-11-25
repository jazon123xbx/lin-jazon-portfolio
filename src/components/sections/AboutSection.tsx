/**
 * About section: portrait, identity record, narrative, and supporting content.
 * The page passes the about copy, identity fields, and author name, so this
 * component stays presentational and can be reused with different content.
 */
import Link from "next/link";
import ProfilePortrait from "@/components/ProfilePortrait";
import Reveal from "@/components/Reveal";

interface AboutSectionProps {
  about: {
    journey: string;
    interests: readonly string[];
    values: readonly string[];
    careerGoals: string;
  };
  identity: readonly { label: string; value: string }[];
  author: string;
}

export default function AboutSection({
  about,
  identity,
  author,
}: AboutSectionProps) {
  return (
    <section id="about" className="relative overflow-hidden bg-grid">
      <span className="section-bg-word right-[-5%] top-[10%]" aria-hidden="true">
        ABOUT
      </span>

      <span className="section-coord left-6 top-6" aria-hidden="true">
        SEC.01 // 24.0°N
      </span>

      <div className="section-signal-line left-0 top-1/2 h-px w-full" aria-hidden="true" />

      <Reveal>
        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-8 sm:pt-28 sm:pb-10 lg:pt-36 lg:pb-12">
          {/* Mobile shows the heading first; desktop uses the 35/65 split. */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:items-start">
            <div className="order-2 lg:order-1 flex flex-col items-center gap-6 sm:w-[224px] lg:mx-auto">
              <div className="relative w-full">
                <div className="pointer-events-none absolute -left-3 -top-3 h-6 w-6 border-l border-t border-accent-blue/20" aria-hidden="true" />
                <div className="pointer-events-none absolute -right-3 -top-3 h-6 w-6 border-r border-t border-accent-blue/20" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-3 -left-3 h-6 w-6 border-b border-l border-accent-blue/20" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-accent-blue/20" aria-hidden="true" />
                <ProfilePortrait src="/images/profile/lin-professional-headshot.png" alt="Lin wearing a navy blazer, white shirt, and tie." />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-accent-blue/30" aria-hidden="true">
                  PORTRAIT // SEC.01
                </span>
              </div>

              <dl className="pointer-events-none w-full rounded-md border border-border-subtle bg-bg-primary/80 px-3 py-2.5">
                <span className="mb-2 block text-[8px] font-mono uppercase tracking-widest text-accent-gold/60" aria-hidden="true">
                  PROFILE // IDENTITY RECORD
                </span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {identity.map((field, i) => (
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

            <div className="order-1 lg:order-2">
              <span className="ty-eyebrow mb-4 inline-block text-accent-gold">
                About
              </span>
              <h2 className="ty-hero text-text-primary">
                Hi, I&apos;m{" "}
                <span className="gradient-text">{author}.</span>
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

        <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-6 sm:mt-4">
          <div className="max-w-3xl">
            <h3 className="ty-sub mb-2 text-accent-gold">
              Journey
            </h3>
            <p className="ty-body text-text-secondary">
              {about.journey}
            </p>
          </div>

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
  );
}
