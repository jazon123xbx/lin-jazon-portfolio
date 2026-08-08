import HubExperience from "./HubExperience";
import StagePointerGlow from "./StagePointerGlow";

export default function PortfolioHub() {
  return (
    <section
      id="portfolio-hub"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,_rgba(59,130,246,0.07)_0%,_transparent_65%)]"
      aria-labelledby="portfolio-hub-title"
    >
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14 lg:py-16 xl:py-12">
        {/* Section Header */}
        <div className="mb-3 text-center sm:mb-5">
          <h1
            id="portfolio-hub-title"
            className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
          >
            Explore My Portfolio
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            An interactive overview of my work with quick access to each section.
          </p>
        </div>

        {/* Responsive Stage with grounded shadow */}
        <StagePointerGlow className="mx-auto aspect-[3/2] w-full max-w-xs shadow-[0_25px_50px_-12px_rgba(30,58,95,0.18)] sm:aspect-[16/10] sm:max-w-xl lg:max-w-4xl xl:max-w-5xl">
          <HubExperience />
        </StagePointerGlow>
      </div>
    </section>
  );
}
