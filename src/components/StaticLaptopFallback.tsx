interface StaticLaptopFallbackProps {
  open?: boolean;
  hoverReady?: boolean;
  activating?: boolean;
}

export default function StaticLaptopFallback({ open = false, hoverReady = false, activating = false }: StaticLaptopFallbackProps) {
  if (!open) {
    return (
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[26%] w-[78%] rounded-xl border border-[#777b85] bg-gradient-to-br from-[#626670] via-[#383c45] to-[#252830] shadow-[0_16px_0_-5px_#1b1e26,0_19px_0_-5px_#777b85,0_24px_35px_#050509]" style={{ transform: "perspective(900px) rotateX(52deg)" }}>
          <span className="absolute inset-x-3 bottom-1 h-px bg-accent-blue/30" />
          <span className={`absolute bottom-0 left-1/2 h-0.5 w-3 -translate-x-1/2 bg-accent-blue/60 ${activating ? "animate-pulse" : ""}`} />
        </div>
      </div>
    );
  }
  return (
    <div
      className="hub-fallback flex flex-col items-center"
      aria-hidden="true"
      style={{ perspective: "900px" }}
    >
      {/* Lid / Screen */}
      {open ? (
        <div
          className="hub-fallback-lid relative w-full rounded-t-xl border border-[#77818e] bg-[#484f5a] p-2"
          style={{
            transformOrigin: "bottom center",
            transform: "rotateX(0deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="h-full rounded-md border border-[#11151c] bg-[#101b28]">
            <div className="flex h-full items-center justify-center">
              <div className="h-px w-14 rounded-full bg-accent-blue/15" />
            </div>
          </div>
          {/* Camera dot */}
          <div className="absolute top-1.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#222228]" />
        </div>
      ) : (
        <div aria-hidden="true" className="relative w-[84%] rounded-t-lg border border-transparent p-[3px]">
          <div className="aspect-[16/10]" />
          <div className="absolute bottom-0 left-0 h-5 w-full rounded-t-lg border border-[#3a3a44] bg-[#3e3e46]" />
        </div>
      )}

      {/* Hinge */}
      <div className="relative h-1.5 w-[85%] rounded-b border-x border-[#747c88] bg-gradient-to-b from-[#4b535f] to-[#252a32]">
        {/* Activation pulse on hinge */}
        {activating && (
          <div className="absolute inset-0 rounded-b bg-accent-blue/10 animate-pulse" aria-hidden="true" />
        )}
      </div>

      {/* Base */}
      <div className="relative w-[106%] rounded-b-lg border border-t-0 border-[#69717d] bg-[#3c414a] px-4 pb-3 pt-2 shadow-[0_3px_0_#252a32]">
        {/* Keyboard grouped keys */}
        <div className="mx-auto mb-1.5 flex w-[60%] flex-col gap-1">
          <div className="flex justify-center gap-[2px]">
            {[0,1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className="h-1.5 w-2 rounded-[1px] bg-[#303038]" />
            ))}
          </div>
          <div className="flex justify-center gap-[2px]">
            {[0,1,2,3,4,5,6,7].map((i) => (
              <div key={i} className="h-1.5 w-2 rounded-[1px] bg-[#303038]" />
            ))}
          </div>
          <div className="mx-auto h-1.5 w-[45%] rounded-[1px] bg-[#303038]" />
        </div>
        {/* Wide touchpad */}
        <div className="mx-auto h-2.5 w-[26%] rounded-sm bg-[#40404a]" />
        {/* LED indicator */}
        <div
          className={`
            absolute bottom-1.5 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full transition-colors duration-300
            ${activating ? "bg-accent-blue shadow-[0_0_6px_rgba(45,127,249,0.5)]" : ""}
            ${hoverReady && !activating ? "bg-accent-blue/60" : ""}
            ${!hoverReady && !activating ? "bg-accent-blue/30" : ""}
          `}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
