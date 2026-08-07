export default function StaticLaptopFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-center">
      {/* Lid / Screen */}
      <div className="relative w-[84%] rounded-t-xl border border-border-subtle bg-bg-surface-elevated p-[3px]">
        <div className="aspect-[16/10] rounded-lg bg-bg-primary">
          <div className="flex h-full items-center justify-center">
            <div className="h-px w-14 rounded-full bg-accent-blue/20" />
          </div>
        </div>
        {/* Camera */}
        <div className="absolute top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#2a2a38]" />
      </div>

      {/* Hinge */}
      <div className="h-2 w-[65%] rounded-b bg-gradient-to-b from-[#2a2a38] to-[#222230]" />

      {/* Base */}
      <div className="relative w-[90%] rounded-b-xl border border-t-0 border-border-subtle bg-bg-surface-elevated px-4 pb-3 pt-2">
        <div className="mx-auto h-3.5 w-[22%] rounded-md bg-[#222230]" />
        <div className="absolute bottom-1.5 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-accent-blue/30" />
      </div>
    </div>
  );
}
