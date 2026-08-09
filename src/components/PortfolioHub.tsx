import HubExperience from "./HubExperience";
import StagePointerGlow from "./StagePointerGlow";

export default function PortfolioHub() {
  return (
    <section
      id="portfolio-hub"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_60%,_rgba(45,127,249,0.04)_0%,_transparent_60%)]"
      aria-labelledby="portfolio-hub-title"
    >
      {/* Thin technical grid lines — restrained */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-full w-px bg-accent-blue" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-accent-blue" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-accent-blue" />
      </div>

      {/* Stage corner brackets */}
      <div className="pointer-events-none absolute left-[8%] top-[12%] h-8 w-8 border-l border-t border-accent-blue/15" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[8%] top-[12%] h-8 w-8 border-r border-t border-accent-blue/15" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[8%] left-[8%] h-8 w-8 border-b border-l border-accent-blue/15" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[8%] right-[8%] h-8 w-8 border-b border-r border-accent-blue/15" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8 sm:pt-16 sm:pb-10 lg:pt-20 lg:pb-12">
        {/* Technical Hero Header — compact */}
        <div className="mb-3 text-center sm:mb-5">
          <p className="ty-eyebrow mb-1.5 text-accent-blue/60 hero-enter-kicker">
            LIN. SYSTEM
          </p>
          <h1
            id="portfolio-hub-title"
            className="ty-hero-title hero-enter-headline lg:whitespace-nowrap"
          >
            Creative Developer Environment
          </h1>
          <p className="ty-eyebrow mt-1.5 text-text-muted hero-enter-subtitle">
            CODE &times; DESIGN &times; CREATIVE TECHNOLOGY
          </p>
        </div>

        {/* Responsive Stage — wide product stage with floor glow */}
        <div className="relative mx-auto w-full max-w-xs sm:max-w-xl lg:max-w-4xl xl:max-w-5xl">
          {/* Floor underglow — restrained blue reflection */}
          <div className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-full bg-accent-blue/[0.06] blur-xl" aria-hidden="true" />
          {/* Gold calibration mark */}
          <div className="pointer-events-none absolute -left-3 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent-gold/40" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-3 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent-gold/40" aria-hidden="true" />

          <StagePointerGlow className="aspect-[3/2] sm:aspect-[16/10]">
            <HubExperience />
          </StagePointerGlow>
        </div>

        {/* Small status labels */}
        <div className="mt-3 flex items-center justify-center gap-4 sm:mt-4">
          <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-accent-blue/30">
            CORE ONLINE
          </span>
          <span className="h-px w-3 bg-accent-blue/10" aria-hidden="true" />
          <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-accent-blue/30">
            GRAPHICS READY
          </span>
          <span className="h-px w-3 bg-accent-blue/10" aria-hidden="true" />
          <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-accent-blue/30">
            ACCESS WAITING
          </span>
        </div>
      </div>
    </section>
  );
}
