/**
 * Capabilities section: the six LIN.OS modules rendered as informational
 * articles. The page passes the module list; each article keeps its anchor
 * id and the skill-module card styling for navigation and the deferred
 * hash handoff. Modules are non-interactive: no buttons, spotlight hooks,
 * or overlay.
 */
import type { SkillGroup } from "@/data/portfolio";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";

interface CapabilitiesSectionProps {
  modules: readonly SkillGroup[];
}

export default function CapabilitiesSection({
  modules,
}: CapabilitiesSectionProps) {
  return (
    <section id="capabilities" className="relative border-t border-border-subtle bg-bg-surface">
      <div className="pointer-events-none absolute inset-0 overflow-clip" aria-hidden="true">
        <span className="section-bg-word right-[-5%] top-[20%]">MODULES</span>
      </div>

      <span className="section-coord left-6 top-6" aria-hidden="true">
        SEC.03 // SYS.MODULES
      </span>

      <Reveal className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <SectionHeader
          label="Capabilities"
          title="LIN.OS Modules"
          description="Technologies and tools I use to bring ideas to life."
        />
        <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((group) => (
            <article
              key={group.id}
              id={group.id}
              className="skill-module min-w-0 rounded-lg border border-border-subtle bg-bg-primary px-5 py-4"
            >
              <div className="flex min-w-0 flex-col items-start gap-2">
                <span className="font-mono text-xs font-semibold leading-4 tracking-[0.16em] text-accent-blue">
                  {group.moduleIndex}
                </span>
                <h3 className="min-w-0 text-base font-semibold leading-6 text-accent-gold sm:text-lg">
                  {group.category}
                </h3>
              </div>
              <ul className="mt-3 flex min-w-0 list-none flex-wrap gap-2 p-0">
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="min-w-0 max-w-full whitespace-normal break-words rounded-md border border-border-subtle bg-bg-surface px-2 py-1 font-mono text-sm leading-5 text-text-secondary"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
