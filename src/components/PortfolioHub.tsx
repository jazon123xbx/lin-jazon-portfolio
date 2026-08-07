import Link from "next/link";
import StaticLaptopFallback from "./StaticLaptopFallback";

const portfolioNavLinks = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Contact", href: "/#contact" },
];

export default function PortfolioHub() {
  return (
    <section id="portfolio-hub" aria-labelledby="portfolio-hub-title">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Section Header */}
        <div className="mb-10">
          <h2
            id="portfolio-hub-title"
            className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
          >
            Explore My Portfolio
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-text-secondary">
            An overview of my work with quick access to each section.
          </p>
        </div>

        {/* Responsive Stage */}
        <div className="mx-auto aspect-[4/3] w-full max-w-sm sm:aspect-[16/10] sm:max-w-2xl lg:max-w-[1120px]">
          <StaticLaptopFallback />
        </div>

        {/* Portfolio Navigation */}
        <nav aria-label="Portfolio sections" className="mt-8">
          <ul className="grid grid-cols-2 gap-3 sm:flex sm:justify-center sm:gap-5">
            {portfolioNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-[44px] items-center justify-center rounded-lg border border-border-subtle bg-bg-surface px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
