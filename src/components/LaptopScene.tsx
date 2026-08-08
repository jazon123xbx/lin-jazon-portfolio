"use client";

import LaptopPrototype from "./LaptopPrototype";

interface LaptopSceneProps {
  openRequested?: boolean;
  reducedMotion?: boolean;
  onOpened?: () => void;
}

export default function LaptopScene({ openRequested, reducedMotion, onOpened }: LaptopSceneProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={0.8} color="#e0eaff" />
      <LaptopPrototype openRequested={openRequested} reducedMotion={reducedMotion} onOpened={onOpened} />
    </>
  );
}
