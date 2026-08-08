interface StaticLaptopFallbackProps {
  open?: boolean;
}

export default function StaticLaptopFallback({ open = false }: StaticLaptopFallbackProps) {
  return (
    <div
      className="mx-auto flex w-full max-w-[720px] flex-col items-center"
      style={{ perspective: "900px" }}
    >
      {/* Lid / Screen */}
      {open ? (
        <div
          className="relative w-[84%] rounded-t-xl border border-border-subtle bg-[#3e3e44] p-[3px]"
          style={{
            transformOrigin: "bottom center",
            transform: "rotateX(0deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="aspect-[16/10] rounded-lg bg-bg-primary">
            <div className="flex h-full items-center justify-center">
              <div className="h-px w-14 rounded-full bg-accent-blue/20" />
            </div>
          </div>
          {/* Camera */}
          <div className="absolute top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#1c1c22]" />
        </div>
      ) : (
        <div aria-hidden="true" className="relative w-[84%] rounded-t-xl border border-transparent p-[3px]">
          <div className="aspect-[16/10]" />
          <div className="absolute bottom-0 left-0 h-5 w-full rounded-t-xl border border-border-subtle bg-[#3e3e44]" />
        </div>
      )}

      {/* Hinge */}
      <div className="h-2 w-[65%] rounded-b bg-gradient-to-b from-[#2e2e38] to-[#2a2a32]" />

      {/* Base */}
      <div className="relative w-[90%] rounded-b-xl border border-t-0 border-border-subtle bg-[#3a3a40] px-4 pb-3 pt-2">
        <div className="mx-auto h-3.5 w-[22%] rounded-md bg-[#303036]" />
        <div className="absolute bottom-1.5 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-accent-blue/30" />
      </div>
    </div>
  );
}
