"use client";

import { useRef, useEffect, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export const OPEN_LID_ANGLE = -Math.PI * 0.18;
export const CLOSED_LID_ANGLE = Math.PI / 2;

const SCREEN_INTENSITY_FINAL = 0.15;
const SCREEN_INTENSITY_DARK = 0.015;
const TOTAL_DURATION = 1750;
const LID_START_MS = 150;
const LID_END_MS = 1400;
const SCREEN_START_MS = 850;
const SCREEN_END_MS = 1600;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Responsive scale based on Canvas width — returns a stable value. */
function getResponsiveScale(width: number): number {
  if (width < 480) return 1.35;
  if (width < 900) return 1.48;
  return 1.55;
}

interface LaptopPrototypeProps {
  openRequested?: boolean;
  reducedMotion?: boolean;
  onOpened?: () => void;
}

/** Structural handle — only the property useFrame mutates. */
interface LidPivotHandle {
  rotation: { x: number };
}

/** Structural handle — only the property useFrame mutates. */
interface ScreenMaterialHandle {
  emissiveIntensity: number;
}

function BaseBody() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[3.2, 0.12, 2.2]} />
      <meshStandardMaterial color="#38383f" roughness={0.65} metalness={0.28} />
    </mesh>
  );
}

function KeyboardSurface() {
  return (
    <mesh position={[0, 0.07, -0.15]}>
      <boxGeometry args={[2.6, 0.02, 1.4]} />
      <meshStandardMaterial color="#2c2c32" roughness={0.78} metalness={0.12} />
    </mesh>
  );
}

function Trackpad() {
  return (
    <mesh position={[0, 0.07, 0.6]}>
      <boxGeometry args={[0.9, 0.015, 0.55]} />
      <meshStandardMaterial color="#40404a" roughness={0.45} metalness={0.28} />
    </mesh>
  );
}

function Hinge() {
  return (
    <mesh position={[0, 0.06, -1.05]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.04, 0.04, 2.8, 8]} />
      <meshStandardMaterial color="#303038" roughness={0.42} metalness={0.42} />
    </mesh>
  );
}

function LidShell() {
  return (
    <mesh position={[0, 1.05, 0]}>
      <boxGeometry args={[3.1, 2.0, 0.08]} />
      <meshStandardMaterial color="#3c3c44" roughness={0.65} metalness={0.28} />
    </mesh>
  );
}

function ScreenBezel() {
  return (
    <mesh position={[0, 1.05, 0.045]}>
      <boxGeometry args={[2.85, 1.75, 0.01]} />
      <meshStandardMaterial color="#1c1c22" roughness={0.9} metalness={0.05} />
    </mesh>
  );
}

function ScreenSurface({ screenMatRef }: { screenMatRef?: MutableRefObject<ScreenMaterialHandle | null> }) {
  return (
    <mesh position={[0, 1.05, 0.055]}>
      <boxGeometry args={[2.7, 1.6, 0.005]} />
      <meshStandardMaterial
        ref={(el: ScreenMaterialHandle | null) => { if (screenMatRef) screenMatRef.current = el; }}
        color="#1e3a5f"
        roughness={0.3}
        metalness={0.1}
        emissive="#0a1929"
        emissiveIntensity={SCREEN_INTENSITY_DARK}
      />
    </mesh>
  );
}

function LidGroup({ screenMatRef }: { screenMatRef?: MutableRefObject<ScreenMaterialHandle | null> }) {
  return (
    <group>
      <LidShell />
      <ScreenBezel />
      <ScreenSurface screenMatRef={screenMatRef} />
    </group>
  );
}

function BaseGroup() {
  return (
    <group>
      <BaseBody />
      <KeyboardSurface />
      <Trackpad />
      <Hinge />
    </group>
  );
}

export default function LaptopPrototype({ openRequested = false, reducedMotion = false, onOpened }: LaptopPrototypeProps) {
  const lidPivotRef = useRef<LidPivotHandle | null>(null);
  const screenMatRef = useRef<ScreenMaterialHandle | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  const { invalidate, size } = useThree();

  // Keep ref current without causing re-renders.
  useEffect(() => {
    onOpenedRef.current = onOpened;
  }, [onOpened]);

  // Responsive scale — derived from Canvas size.width (non-hot selector, stable).
  const scale = getResponsiveScale(size.width);

  // Kick the demand loop when the trigger or reduced-motion flag changes.
  useEffect(() => {
    if (openRequested || reducedMotion) {
      invalidate();
    }
  }, [openRequested, reducedMotion, invalidate]);

  useFrame((state) => {
    if (completedRef.current) return;

    const lid = lidPivotRef.current;
    const mat = screenMatRef.current;
    if (!lid || !mat) return;

    // Waiting for user activation: hold closed and nearly dark.
    if (!openRequested) {
      lid.rotation.x = CLOSED_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_DARK;
      return;
    }

    // Reduced motion: snap to final values immediately, no loop.
    if (reducedMotion) {
      lid.rotation.x = OPEN_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_FINAL;
      completedRef.current = true;
      onOpenedRef.current?.();
      return;
    }

    // openRequested just became true — stamp the start once.
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.getElapsedTime() * 1000;
    }

    const elapsed = state.clock.getElapsedTime() * 1000 - startTimeRef.current;

    // Past total duration — set final values, stop loop.
    if (elapsed >= TOTAL_DURATION) {
      lid.rotation.x = OPEN_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_FINAL;
      completedRef.current = true;
      onOpenedRef.current?.();
      return;
    }

    // ── Lid angle ──
    // 0–150 ms: anticipation hold (closed, no overshoot).
    // 150–1400 ms: cubic ease-out from CLOSED → OPEN.
    let lidAngle: number;
    if (elapsed < LID_START_MS) {
      lidAngle = CLOSED_LID_ANGLE;
    } else if (elapsed < LID_END_MS) {
      const rawT = (elapsed - LID_START_MS) / (LID_END_MS - LID_START_MS);
      const t = easeOutCubic(rawT);
      lidAngle = CLOSED_LID_ANGLE + (OPEN_LID_ANGLE - CLOSED_LID_ANGLE) * t;
    } else {
      lidAngle = OPEN_LID_ANGLE;
    }

    // ── Screen intensity ──
    // 0–850 ms: nearly dark constant.
    // 850–1600 ms: eased interpolation → final 0.15.
    let intensity: number;
    if (elapsed < SCREEN_START_MS) {
      intensity = SCREEN_INTENSITY_DARK;
    } else if (elapsed < SCREEN_END_MS) {
      const rawT = (elapsed - SCREEN_START_MS) / (SCREEN_END_MS - SCREEN_START_MS);
      const t = easeOutCubic(rawT);
      intensity = SCREEN_INTENSITY_DARK + (SCREEN_INTENSITY_FINAL - SCREEN_INTENSITY_DARK) * t;
    } else {
      intensity = SCREEN_INTENSITY_FINAL;
    }

    lid.rotation.x = lidAngle;
    mat.emissiveIntensity = intensity;

    // Keep demand loop alive while animating.
    invalidate();
  });

  return (
    <group scale={scale} rotation={[-0.15, 0, 0]} position={[0, -0.3, 0]}>
      <BaseGroup />
      <group
        ref={(el: LidPivotHandle | null) => { lidPivotRef.current = el; }}
        position={[0, 0.06, -1.05]}
        rotation={[CLOSED_LID_ANGLE, 0, 0]}
      >
        <LidGroup screenMatRef={screenMatRef} />
      </group>
    </group>
  );
}
