import { contactMethods, siteConfig } from "@/data/portfolio";

const STATIC_LABELS = new Set(["Email", "WhatsApp", "Backup Number"]);
const EXTERNAL_LABELS = new Set(["Facebook", "GitHub", "LinkedIn"]);

export default function ContactOutro() {
  return (
    <div className="relative">
      {/* Big editorial statement */}
      <p className="max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
        Have an idea?{" "}
        <span className="text-text-muted">Let&apos;s build</span>{" "}
        <span className="gradient-text">something useful.</span>
      </p>

      <p className="ty-body mt-6 max-w-md text-text-secondary">
        Currently open to new projects, collaborations, and learning
        opportunities.
      </p>

      {/* Contact methods */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contactMethods.map((method) => {
          const isStatic = STATIC_LABELS.has(method.label);
          const isExternal = EXTERNAL_LABELS.has(method.label);

          if (isStatic) {
            return (
              <div
                key={method.label}
                className="rounded-xl border border-border-subtle bg-bg-primary p-5 text-left"
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
              className="group/contact edge-glow relative overflow-hidden rounded-xl border border-border-subtle bg-bg-primary p-5 text-left transition-colors duration-300 hover:border-border-accent"
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
            >
              <span className="ty-eyebrow text-accent-gold">
                {method.label}
              </span>
              <p className="ty-body mt-2 flex items-center gap-2 text-text-secondary transition-colors group-hover/contact:text-text-primary">
                {method.value}
                {isExternal && (
                  <span
                    aria-hidden="true"
                    className="arrow-nudge text-accent-blue opacity-0 transition-opacity group-hover/contact:opacity-100"
                  >
                    &rarr;
                  </span>
                )}
              </p>
            </a>
          );
        })}
      </div>

      {/* Strong signature ending */}
      <div className="mt-16 flex items-center justify-between border-t border-border-subtle pt-8">
        <span className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          {siteConfig.name}
        </span>
        <span className="ty-index text-text-muted">CREATIVE DEVELOPER</span>
      </div>
    </div>
  );
}
