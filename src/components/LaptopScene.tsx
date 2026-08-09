"use client";

import LaptopPrototype from "./LaptopPrototype";

interface LaptopSceneProps {
  openRequested?: boolean;
  reducedMotion?: boolean;
  onOpened?: () => void;
  cameraPush?: boolean;
}

export default function LaptopScene({ openRequested, reducedMotion, onOpened, cameraPush }: LaptopSceneProps) {
  return (
    <>
      {/* Key light — cool white from upper right */}
      <directionalLight position={[4, 6, 5]} intensity={0.75} color="#e0eaff" />
      {/* Fill light — subtle blue from left for depth */}
      <directionalLight position={[-3, 4, 2]} intensity={0.25} color="#4a7ab5" />
      {/* Rim light — electric blue accent from behind */}
      <directionalLight position={[0, 3, -4]} intensity={0.3} color="#2d7ff9" />
      {/* Ambient — low for contrast */}
      <ambientLight intensity={0.45} />
      {/* Ground bounce — warm subtle */}
      <pointLight position={[0, -1, 2]} intensity={0.15} color="#c9a84c" distance={5} />
      <LaptopPrototype openRequested={openRequested} reducedMotion={reducedMotion} onOpened={onOpened} cameraPush={cameraPush} />
    </>
  );
}
