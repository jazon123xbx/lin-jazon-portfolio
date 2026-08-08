import type { SkillGroup } from "@/data/portfolio";

interface CapabilityModulesProps {
  groups: SkillGroup[];
}

/**
 * Indexed capability rows. Each row shows a category with an animated
 * indicator line and its tech labels. Hover lifts labels toward the
 * accent color (desktop); fully readable at rest and on touch.
 */
export default function CapabilityModules({ groups }: CapabilityModulesProps) {
  return (
    <ul className="divide-y divide-border-subtle border-y border-border-subtle">
      {groups.map((group, i) => (
        <li
          key={group.category}
          className="group/cap grid gap-4 py-6 md:grid-cols-[auto_1fr_2fr] md:items-center md:gap-8"
        >
          {/* Index + indicator */}
          <div className="flex items-center gap-4">
            <span className="ty-index text-text-muted transition-colors group-hover/cap:text-accent-blue">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="hidden h-px w-8 origin-left scale-x-100 bg-border-subtle transition-all duration-300 group-hover/cap:w-12 group-hover/cap:bg-accent-blue md:block" />
          </div>

          {/* Category */}
          <h3 className="ty-sub text-text-primary transition-colors group-hover/cap:text-accent-gold">
            {group.category}
          </h3>

          {/* Tech labels */}
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <span
                key={skill.name}
                className="ty-chip rounded-md border border-border-subtle bg-bg-primary px-3 py-1.5 text-text-secondary transition-colors duration-300 hover:border-border-accent hover:text-text-primary"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
