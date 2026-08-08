/**
 * Decorative system-identity layer for the portfolio hub.
 * Purely presentational: pointer-events-none and aria-hidden so it
 * never intercepts interaction with the laptop stage beneath it.
 */
export default function HubIdentity() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 select-none"
    >
      {/* Ambient drifting grid */}
      <div className="bg-grid-drift absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Top-left identity */}
      <div className="absolute left-0 top-0 hidden sm:block">
        <span className="ty-index text-text-muted">LIN. SYSTEM</span>
      </div>

      {/* Top-right status */}
      <div className="absolute right-0 top-0 hidden items-center gap-2 sm:flex">
        <span className="status-dot h-1.5 w-1.5 rounded-full bg-accent-blue" />
        <span className="ty-index text-text-muted">ONLINE</span>
      </div>

      {/* Bottom-left tagline */}
      <div className="absolute bottom-0 left-0 hidden md:block">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-text-muted">
          CODE <span className="text-accent-blue">&times;</span> DESIGN{" "}
          <span className="text-accent-blue">&times;</span> CREATIVE TECHNOLOGY
        </span>
      </div>

      {/* Bottom-right label */}
      <div className="absolute bottom-0 right-0 hidden md:block">
        <span className="ty-index text-text-muted">CREATIVE DEV ENV</span>
      </div>
    </div>
  );
}
