/**
 * ContactNetwork — lightweight CSS/SVG network/globe visual for
 * the Contact section right zone. Decorative only, aria-hidden.
 */
export default function ContactNetwork({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 300 300" fill="none" className="h-full w-full max-h-[320px]">
        {/* Outer ring */}
        <circle cx="150" cy="150" r="120" stroke="rgba(45,127,249,0.08)" strokeWidth="1" />
        <circle cx="150" cy="150" r="90" stroke="rgba(45,127,249,0.06)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="60" stroke="rgba(45,127,249,0.04)" strokeWidth="0.5" />

        {/* Latitude lines */}
        <ellipse cx="150" cy="150" rx="120" ry="40" stroke="rgba(45,127,249,0.06)" strokeWidth="0.5" />
        <ellipse cx="150" cy="150" rx="90" ry="30" stroke="rgba(45,127,249,0.04)" strokeWidth="0.5" />

        {/* Longitude arcs */}
        <ellipse cx="150" cy="150" rx="40" ry="120" stroke="rgba(45,127,249,0.06)" strokeWidth="0.5" />
        <ellipse cx="150" cy="150" rx="80" ry="120" stroke="rgba(45,127,249,0.04)" strokeWidth="0.5" />

        {/* Network nodes */}
        {[
          { cx: 150, cy: 150, r: 4, fill: "rgba(45,127,249,0.3)" },
          { cx: 90, cy: 110, r: 3, fill: "rgba(45,127,249,0.2)" },
          { cx: 210, cy: 120, r: 3, fill: "rgba(45,127,249,0.2)" },
          { cx: 120, cy: 190, r: 2.5, fill: "rgba(201,168,76,0.2)" },
          { cx: 200, cy: 180, r: 2.5, fill: "rgba(45,127,249,0.15)" },
          { cx: 70, cy: 150, r: 2, fill: "rgba(45,127,249,0.12)" },
          { cx: 230, cy: 150, r: 2, fill: "rgba(45,127,249,0.12)" },
          { cx: 150, cy: 80, r: 2, fill: "rgba(201,168,76,0.15)" },
          { cx: 150, cy: 220, r: 2, fill: "rgba(45,127,249,0.1)" },
        ].map((node, i) => (
          <circle key={i} cx={node.cx} cy={node.cy} r={node.r} fill={node.fill} />
        ))}

        {/* Network connections */}
        <line x1="150" y1="150" x2="90" y2="110" stroke="rgba(45,127,249,0.08)" strokeWidth="0.5" />
        <line x1="150" y1="150" x2="210" y2="120" stroke="rgba(45,127,249,0.08)" strokeWidth="0.5" />
        <line x1="150" y1="150" x2="120" y2="190" stroke="rgba(45,127,249,0.06)" strokeWidth="0.5" />
        <line x1="150" y1="150" x2="200" y2="180" stroke="rgba(45,127,249,0.06)" strokeWidth="0.5" />
        <line x1="90" y1="110" x2="70" y2="150" stroke="rgba(45,127,249,0.05)" strokeWidth="0.5" />
        <line x1="210" y1="120" x2="230" y2="150" stroke="rgba(45,127,249,0.05)" strokeWidth="0.5" />
        <line x1="150" y1="150" x2="150" y2="80" stroke="rgba(201,168,76,0.06)" strokeWidth="0.5" />
        <line x1="150" y1="150" x2="150" y2="220" stroke="rgba(45,127,249,0.05)" strokeWidth="0.5" />

        {/* Cross connections */}
        <line x1="90" y1="110" x2="120" y2="190" stroke="rgba(45,127,249,0.04)" strokeWidth="0.5" />
        <line x1="210" y1="120" x2="200" y2="180" stroke="rgba(45,127,249,0.04)" strokeWidth="0.5" />

        {/* Central glow */}
        <circle cx="150" cy="150" r="20" fill="rgba(45,127,249,0.04)" />
        <circle cx="150" cy="150" r="8" fill="rgba(45,127,249,0.08)" />

        {/* Technical labels */}
        <text x="150" y="260" textAnchor="middle" fill="rgba(45,127,249,0.15)" fontSize="8" fontFamily="monospace" letterSpacing="0.15em">
          COMM.NETWORK
        </text>
        <text x="150" y="272" textAnchor="middle" fill="rgba(255,255,255,0.06)" fontSize="6" fontFamily="monospace" letterSpacing="0.1em">
          LIN.SYSTEM v1.0
        </text>

        {/* Corner markers */}
        <rect x="30" y="30" width="8" height="1" fill="rgba(201,168,76,0.15)" />
        <rect x="30" y="30" width="1" height="8" fill="rgba(201,168,76,0.15)" />
        <rect x="262" y="30" width="8" height="1" fill="rgba(201,168,76,0.15)" />
        <rect x="269" y="30" width="1" height="8" fill="rgba(201,168,76,0.15)" />
        <rect x="30" y="269" width="8" height="1" fill="rgba(201,168,76,0.15)" />
        <rect x="30" y="262" width="1" height="8" fill="rgba(201,168,76,0.15)" />
        <rect x="262" y="269" width="8" height="1" fill="rgba(201,168,76,0.15)" />
        <rect x="269" y="262" width="1" height="8" fill="rgba(201,168,76,0.15)" />
      </svg>
    </div>
  );
}
