interface StaticLaptopFallbackProps {
  open?: boolean;
  hoverReady?: boolean;
  activating?: boolean;
}

export default function StaticLaptopFallback({ open = false, hoverReady = false, activating = false }: StaticLaptopFallbackProps) {
  return (
    <div
      className="mx-auto flex w-full max-w-[720px] flex-col items-center"
      style={{ perspective: "900px" }}
    >
      {/* Lid / Screen */}
      {open ? (
        <div
          className="relative w-[84%] rounded-t-lg border border-[#3a3a44] bg-[#3e3e46] p-[3px]"
          style={{
            transformOrigin: "bottom center",
            transform: "rotateX(0deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="aspect-[16/10] rounded-md bg-bg-primary">
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
      <div className="relative h-1.5 w-[65%] rounded-b bg-gradient-to-b from-[#2e2e38] to-[#2a2a32]">
        {/* Activation pulse on hinge */}
        {activating && (
          <div className="absolute inset-0 rounded-b bg-accent-blue/10 animate-pulse" aria-hidden="true" />
        )}
      </div>

      {/* Base */}
      <div className="relative w-[90%] rounded-b-lg border border-t-0 border-[#3a3a44] bg-[#3a3a42] px-4 pb-3 pt-2">
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
