"use client";

import { useRef, useEffect, useMemo, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export const OPEN_LID_ANGLE = -Math.PI * 0.18;
export const CLOSED_LID_ANGLE = Math.PI / 2;

const SCREEN_INTENSITY_FINAL = 0.15;
const SCREEN_INTENSITY_DARK = 0.015;
const SCREEN_INTENSITY_BOOT = 0.55; // brief bright flash as the panel powers on
const TOTAL_DURATION = 1750;
const LID_START_MS = 150;
const LID_END_MS = 1400;
const SCREEN_START_MS = 850;
const SCREEN_END_MS = 1600;
const SCREEN_BOOT_PEAK_MS = 1080; // where the power-on flash peaks

// LED emissive levels
const LED_IDLE = 0.9;
const LED_ACTIVE = 3.2;

// Camera framing
const CAMERA_Z_BASE = 7;
const CAMERA_Z_PUSH = 6.35; // gentle push-in once opened
const CAMERA_Y_BASE = 0.6;
const CAMERA_Y_PUSH = 0.72;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Spring-like ease with a small settle overshoot. Stays within safe bounds
 * (peaks ~6% past target near t≈0.7, then settles to exactly 1 at t=1).
 */
function easeOutBackSoft(t: number): number {
  const c1 = 1.15;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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

interface GroupHandle {
  rotation: { x: number; y: number; z: number };
  position: { y: number };
}

/** Structural handle — only the property useFrame mutates. */
interface MaterialHandle {
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

/** Electric-blue power LED on the front lip of the base. */
function PowerLed({ ledMatRef }: { ledMatRef?: MutableRefObject<MaterialHandle | null> }) {
  return (
    <mesh position={[0.95, 0.02, 1.08]}>
      <boxGeometry args={[0.09, 0.02, 0.02]} />
      <meshStandardMaterial
        ref={(el: MaterialHandle | null) => { if (ledMatRef) ledMatRef.current = el; }}
        color="#0a1929"
        emissive="#2d7ff9"
        emissiveIntensity={LED_IDLE}
        roughness={0.4}
        metalness={0.1}
      />
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

function ScreenSurface({ screenMatRef }: { screenMatRef?: MutableRefObject<MaterialHandle | null> }) {
  return (
    <mesh position={[0, 1.05, 0.055]}>
      <boxGeometry args={[2.7, 1.6, 0.005]} />
      <meshStandardMaterial
        ref={(el: MaterialHandle | null) => { if (screenMatRef) screenMatRef.current = el; }}
        color="#1e3a5f"
        roughness={0.3}
        metalness={0.1}
        emissive="#0a1929"
        emissiveIntensity={SCREEN_INTENSITY_DARK}
      />
    </mesh>
  );
}

/** Thin blue edge strip along the screen top — the hinge/edge reflection. */
function ScreenEdgeGlow({ edgeMatRef }: { edgeMatRef?: MutableRefObject<MaterialHandle | null> }) {
  return (
    <mesh position={[0, 1.88, 0.05]}>
      <boxGeometry args={[2.7, 0.03, 0.006]} />
      <meshStandardMaterial
        ref={(el: MaterialHandle | null) => { if (edgeMatRef) edgeMatRef.current = el; }}
        color="#0a1929"
        emissive="#2d7ff9"
        emissiveIntensity={0.2}
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}

function LidGroup({
  screenMatRef,
  edgeMatRef,
}: {
  screenMatRef?: MutableRefObject<MaterialHandle | null>;
  edgeMatRef?: MutableRefObject<MaterialHandle | null>;
}) {
  return (
    <group>
      <LidShell />
      <ScreenBezel />
      <ScreenSurface screenMatRef={screenMatRef} />
      <ScreenEdgeGlow edgeMatRef={edgeMatRef} />
    </group>
  );
}

function BaseGroup({ ledMatRef }: { ledMatRef?: MutableRefObject<MaterialHandle | null> }) {
  return (
    <group>
      <BaseBody />
      <KeyboardSurface />
      <Trackpad />
      <Hinge />
      <PowerLed ledMatRef={ledMatRef} />
    </group>
  );
}

export default function LaptopPrototype({ openRequested = false, reducedMotion = false, onOpened }: LaptopPrototypeProps) {
  const rootRef = useRef<GroupHandle | null>(null);
  const lidPivotRef = useRef<LidPivotHandle | null>(null);
  const screenMatRef = useRef<MaterialHandle | null>(null);
  const edgeMatRef = useRef<MaterialHandle | null>(null);
  const ledMatRef = useRef<MaterialHandle | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  const pointerRef = useRef({ x: 0, y: 0 });
  const { invalidate, size, camera } = useThree();

  // Fine-pointer detection (idle parallax only for mouse users).
  const finePointer = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const baseRotX = -0.15;

  // Keep ref current without causing re-renders.
  useEffect(() => {
    onOpenedRef.current = onOpened;
  }, [onOpened]);

  // Responsive scale — derived from Canvas size.width (non-hot selector, stable).
  const scale = getResponsiveScale(size.width);

  // Pointer parallax input (fine-pointer, pre-open only). Normalized -1..1.
  useEffect(() => {
    if (!finePointer || reducedMotion) return;
    const handle = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointerRef.current = { x: nx, y: ny };
      if (!openRequested) invalidate();
    };
    window.addEventListener("pointermove", handle, { passive: true });
    return () => window.removeEventListener("pointermove", handle);
  }, [finePointer, reducedMotion, openRequested, invalidate]);

  // Drive a gentle idle demand loop while closed (skipped for reduced motion).
  useEffect(() => {
    if (openRequested || reducedMotion) return;
    let raf = 0;
    const tick = () => {
      invalidate();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [openRequested, reducedMotion, invalidate]);

  // Kick the demand loop when the trigger or reduced-motion flag changes.
  useEffect(() => {
    if (openRequested || reducedMotion) {
      invalidate();
    }
  }, [openRequested, reducedMotion, invalidate]);

  useFrame((state) => {
    const root = rootRef.current;
    const lid = lidPivotRef.current;
    const mat = screenMatRef.current;
    const edge = edgeMatRef.current;
    const led = ledMatRef.current;
    if (!root || !lid || !mat) return;

    const t = state.clock.getElapsedTime();

    // ── Reduced motion: snap to final, no decorative movement ──
    if (reducedMotion) {
      if (openRequested) {
        lid.rotation.x = OPEN_LID_ANGLE;
        mat.emissiveIntensity = SCREEN_INTENSITY_FINAL;
        if (edge) edge.emissiveIntensity = 1.4;
        if (led) led.emissiveIntensity = LED_ACTIVE;
        camera.position.z = CAMERA_Z_PUSH;
        camera.position.y = CAMERA_Y_PUSH;
        camera.lookAt(0, 0.3, 0);
        if (!completedRef.current) {
          completedRef.current = true;
          onOpenedRef.current?.();
        }
      } else {
        lid.rotation.x = CLOSED_LID_ANGLE;
        mat.emissiveIntensity = SCREEN_INTENSITY_DARK;
        root.rotation.x = baseRotX;
        root.rotation.y = 0;
        root.position.y = -0.3;
      }
      return;
    }

    // ── Idle / closed: breathing float + pointer parallax + LED pulse ──
    if (!openRequested) {
      const floatY = Math.sin(t * 1.1) * 0.03;
      root.position.y = -0.3 + floatY;

      // Subtle pointer-reactive depth (fine pointer only).
      const px = finePointer ? pointerRef.current.x : 0;
      const py = finePointer ? pointerRef.current.y : 0;
      root.rotation.y += (px * 0.12 - root.rotation.y) * 0.06;
      root.rotation.x += (baseRotX + py * 0.05 + Math.sin(t * 0.9) * 0.01 - root.rotation.x) * 0.06;

      lid.rotation.x = CLOSED_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_DARK;

      // Slow breathing pulse on the power LED.
      if (led) led.emissiveIntensity = LED_IDLE + Math.sin(t * 2.2) * 0.35;
      if (edge) edge.emissiveIntensity = 0.18 + Math.sin(t * 1.6) * 0.08;

      // Keep camera at baseline framing.
      camera.position.z += (CAMERA_Z_BASE - camera.position.z) * 0.08;
      camera.position.y += (CAMERA_Y_BASE - camera.position.y) * 0.08;
      camera.lookAt(0, 0.3, 0);
      return;
    }

    // ── Opening sequence ──
    if (completedRef.current) {
      // Settled: keep gentle life on the LED/edge, hold framing.
      if (led) led.emissiveIntensity = LED_ACTIVE + Math.sin(t * 3) * 0.25;
      return;
    }

    // Settle root back to neutral framing during the open.
    root.rotation.y += (0 - root.rotation.y) * 0.1;
    root.rotation.x += (baseRotX - root.rotation.x) * 0.1;

    if (startTimeRef.current === null) {
      startTimeRef.current = t * 1000;
    }
    const elapsed = t * 1000 - startTimeRef.current;

    // Past total duration — final values, stop opening logic.
    if (elapsed >= TOTAL_DURATION) {
      lid.rotation.x = OPEN_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_FINAL;
      if (edge) edge.emissiveIntensity = 1.4;
      if (led) led.emissiveIntensity = LED_ACTIVE;
      root.position.y = -0.3;
      camera.position.z = CAMERA_Z_PUSH;
      camera.position.y = CAMERA_Y_PUSH;
      camera.lookAt(0, 0.3, 0);
      completedRef.current = true;
      onOpenedRef.current?.();
      return;
    }

    // Phase 1 — Activate: LED brightens + power float settle (0–150 ms).
    const activateT = Math.min(elapsed / LID_START_MS, 1);
    if (led) led.emissiveIntensity = LED_IDLE + (LED_ACTIVE - LED_IDLE) * activateT;
    root.position.y += (-0.3 - root.position.y) * 0.2;

    // ── Lid angle: spring ease-out with soft overshoot ──
    let lidAngle: number;
    if (elapsed < LID_START_MS) {
      lidAngle = CLOSED_LID_ANGLE;
    } else if (elapsed < LID_END_MS) {
      const rawT = (elapsed - LID_START_MS) / (LID_END_MS - LID_START_MS);
      const eased = easeOutBackSoft(rawT);
      lidAngle = CLOSED_LID_ANGLE + (OPEN_LID_ANGLE - CLOSED_LID_ANGLE) * eased;
    } else {
      lidAngle = OPEN_LID_ANGLE;
    }
    lid.rotation.x = lidAngle;

    // ── Screen power-on: dark → bright boot flash → settle ──
    let intensity: number;
    if (elapsed < SCREEN_START_MS) {
      intensity = SCREEN_INTENSITY_DARK;
    } else if (elapsed < SCREEN_BOOT_PEAK_MS) {
      const rawT = (elapsed - SCREEN_START_MS) / (SCREEN_BOOT_PEAK_MS - SCREEN_START_MS);
      intensity = SCREEN_INTENSITY_DARK + (SCREEN_INTENSITY_BOOT - SCREEN_INTENSITY_DARK) * easeOutCubic(rawT);
    } else if (elapsed < SCREEN_END_MS) {
      const rawT = (elapsed - SCREEN_BOOT_PEAK_MS) / (SCREEN_END_MS - SCREEN_BOOT_PEAK_MS);
      intensity = SCREEN_INTENSITY_BOOT + (SCREEN_INTENSITY_FINAL - SCREEN_INTENSITY_BOOT) * easeOutCubic(rawT);
    } else {
      intensity = SCREEN_INTENSITY_FINAL;
    }
    mat.emissiveIntensity = intensity;

    // Edge glow sweeps up with the boot.
    if (edge) {
      const edgeT = Math.min(Math.max((elapsed - SCREEN_START_MS) / (SCREEN_END_MS - SCREEN_START_MS), 0), 1);
      edge.emissiveIntensity = 0.2 + edgeT * 1.4;
    }

    // ── Camera: gentle push-in during opening ──
    const camT = easeOutCubic(Math.min(elapsed / TOTAL_DURATION, 1));
    camera.position.z = CAMERA_Z_BASE + (CAMERA_Z_PUSH - CAMERA_Z_BASE) * camT;
    camera.position.y = CAMERA_Y_BASE + (CAMERA_Y_PUSH - CAMERA_Y_BASE) * camT;
    camera.lookAt(0, 0.3, 0);

    // Keep demand loop alive while animating.
    invalidate();
  });

  return (
    <group
      ref={(el: GroupHandle | null) => { rootRef.current = el; }}
      scale={scale}
      rotation={[baseRotX, 0, 0]}
      position={[0, -0.3, 0]}
    >
      <BaseGroup ledMatRef={ledMatRef} />
      <group
        ref={(el: LidPivotHandle | null) => { lidPivotRef.current = el; }}
        position={[0, 0.06, -1.05]}
        rotation={[CLOSED_LID_ANGLE, 0, 0]}
      >
        <LidGroup screenMatRef={screenMatRef} edgeMatRef={edgeMatRef} />
      </group>
    </group>
  );
}
