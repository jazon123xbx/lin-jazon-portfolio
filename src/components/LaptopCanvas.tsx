"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import LaptopScene from "./LaptopScene";

interface LaptopCanvasProps {
  onReady?: () => void;
  onFailure?: () => void;
  openRequested?: boolean;
  reducedMotion?: boolean;
  onOpened?: () => void;
}

function LifecycleObserver({ onReady, onFailure }: Pick<LaptopCanvasProps, "onReady" | "onFailure">) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onFailure?.();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);

    // Signal ready after mount and listener attachment
    onReady?.();

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, [gl, onReady, onFailure]);

  return null;
}

export default function LaptopCanvas({ onReady, onFailure, openRequested, reducedMotion, onOpened }: LaptopCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: 35, position: [0, 0.6, 7], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ width: "100%", height: "100%" }}
    >
      <LifecycleObserver onReady={onReady} onFailure={onFailure} />
      <LaptopScene openRequested={openRequested} reducedMotion={reducedMotion} onOpened={onOpened} />
    </Canvas>
  );
}
