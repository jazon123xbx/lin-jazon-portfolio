"use client";

import LaptopPrototype from "./LaptopPrototype";
import type { GlassQuad } from "@/lib/display-projection";

interface LaptopSceneProps {
  openRequested?: boolean;
  reducedMotion?: boolean;
  onOpened?: () => void;
  cameraPush?: boolean;
  onGlassQuad?: (quad: GlassQuad | null) => void;
}

export default function LaptopScene({ openRequested, reducedMotion, onOpened, cameraPush, onGlassQuad }: LaptopSceneProps) {
  return (
    <>
      {/* Neutral premium studio: white key, cool-gray fill, and a desaturated
          cool rim for silhouette separation. Blue dominance removed from the
          fill/rim so graphite planes read neutral; no new lights or shadows. */}
      <directionalLight position={[4, 6, 5]} intensity={1.22} color="#f7f8fa" />
      <directionalLight position={[-3, 4, 2]} intensity={0.4} color="#e3e8ef" />
      <directionalLight position={[0, 3, -4]} intensity={0.28} color="#9aadc6" />
      <ambientLight intensity={0.38} />
      <pointLight position={[0, -1, 2]} intensity={0.1} color="#dce1e7" distance={5} />
      <LaptopPrototype openRequested={openRequested} reducedMotion={reducedMotion} onOpened={onOpened} cameraPush={cameraPush} onGlassQuad={onGlassQuad} />
    </>
  );
}
