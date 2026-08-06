interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  label,
  title,
  description,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-10 ${align === "center" ? "text-center" : "text-left"}`}
    >
      {label && (
        <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">
          {label}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-lg text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}
