import Reveal from "@/components/Reveal";

interface SectionShellProps {
  index: string;
  label: string;
  title: React.ReactNode;
  description?: string;
  /** Giant faint decorative word behind the header. */
  megaWord: string;
  /** Horizontal side the mega word anchors to. */
  megaAlign?: "left" | "right";
  align?: "left" | "center";
  children: React.ReactNode;
  className?: string;
}

/**
 * Editorial section wrapper: numbered index, growing accent line,
 * a giant faint decorative word, and a staggered entrance sequence
 * driven by the existing Reveal + `.seq` CSS pipeline.
 */
export default function SectionShell({
  index,
  label,
  title,
  description,
  megaWord,
  megaAlign = "right",
  align = "left",
  children,
  className = "",
}: SectionShellProps) {
  return (
    <Reveal className={`relative mx-auto max-w-6xl px-6 py-20 sm:py-28 ${className}`}>
      {/* Giant faint decorative word */}
      <span
        aria-hidden="true"
        className={`ty-mega absolute -top-2 z-0 hidden select-none sm:block ${
          megaAlign === "right" ? "right-2" : "left-2"
        }`}
      >
        {megaWord}
      </span>

      <div className={`seq relative z-10 ${align === "center" ? "text-center" : ""}`}>
        {/* Index row */}
        <div
          className={`mb-5 flex items-center gap-3 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          <span className="ty-index">{index}</span>
          <span className="line-grow h-px w-10 bg-accent-blue/60" />
          <span className="ty-eyebrow text-accent-gold">{label}</span>
        </div>

        {/* Title */}
        <h2 className="ty-hero max-w-3xl text-balance text-text-primary">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p
            className={`ty-body mt-4 max-w-2xl text-pretty text-text-secondary ${
              align === "center" ? "mx-auto" : ""
            }`}
          >
            {description}
          </p>
        )}

        {/* Section content */}
        <div className="mt-12">{children}</div>
      </div>
    </Reveal>
  );
}
