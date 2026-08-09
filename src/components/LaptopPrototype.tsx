"use client";

import { useRef, useEffect, type MutableRefObject } from "react";
import { useFrame, useThree, Vector3 } from "@react-three/fiber";

export const OPEN_LID_ANGLE = -Math.PI * 0.18;
export const CLOSED_LID_ANGLE = Math.PI / 2;

const SCREEN_INTENSITY_FINAL = 0.15;
const SCREEN_INTENSITY_DARK = 0.015;

/* ── Lid timeline (anticipation → controlled motion → settle) ── */
const ANTICIPATION_END_MS = 200;
const LID_START_MS = 200;
const LID_END_MS = 1500;
const SETTLE_END_MS = 1800;

/* ── Camera push ────────────────────────────────────────────── */
const CAMERA_START_POSITION: Vector3 = [0, 0.55, 7.2];
const CAMERA_END_POSITION: Vector3 = [0, 0.45, 5.5];
const CAMERA_PUSH_DURATION = 900;

/* ── Easing helpers ─────────────────────────────────────────── */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Smooth ease with slight overshoot for settle */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Responsive scale based on Canvas width */
function getResponsiveScale(width: number): number {
  if (width < 480) return 1.35;
  if (width < 900) return 1.48;
  return 1.55;
}

interface LaptopPrototypeProps {
  openRequested?: boolean;
  reducedMotion?: boolean;
  onOpened?: () => void;
  cameraPush?: boolean;
}

interface LidPivotHandle {
  rotation: { x: number };
}

interface ScreenMaterialHandle {
  emissiveIntensity: number;
}

interface BaseMaterialHandle {
  emissiveIntensity: number;
}

/* ── Geometry components ────────────────────────────────────── */

function BaseBody({ baseMatRef }: { baseMatRef?: MutableRefObject<BaseMaterialHandle | null> }) {
  return (
    <group>
      {/* Main base slab — thinner, slightly wider */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.3, 0.1, 2.25]} />
        <meshStandardMaterial
          ref={(el: BaseMaterialHandle | null) => { if (baseMatRef) baseMatRef.current = el; }}
          color="#3a3a42"
          roughness={0.58}
          metalness={0.32}
          emissive="#1a3a6a"
          emissiveIntensity={0}
        />
      </mesh>
      {/* Front edge chamfer — thin accent strip */}
      <mesh position={[0, 0.035, 1.1]}>
        <boxGeometry args={[3.3, 0.03, 0.04]} />
        <meshStandardMaterial color="#45454e" roughness={0.4} metalness={0.35} />
      </mesh>
      {/* Rear vent strip */}
      <mesh position={[0, 0.035, -1.08]}>
        <boxGeometry args={[2.4, 0.02, 0.06]} />
        <meshStandardMaterial color="#2e2e36" roughness={0.7} metalness={0.2} />
      </mesh>
    </group>
  );
}

function KeyboardSurface() {
  return (
    <group>
      {/* Keyboard recess — grouped key treatment */}
      <mesh position={[0, 0.065, -0.18]}>
        <boxGeometry args={[2.7, 0.015, 1.35]} />
        <meshStandardMaterial color="#2a2a32" roughness={0.82} metalness={0.08} />
      </mesh>
      {/* Key rows — subtle grouped blocks instead of individual meshes */}
      {[0, 1, 2, 3].map((row) => (
        <mesh key={`kr${row}`} position={[0, 0.075, -0.55 + row * 0.25]}>
          <boxGeometry args={[2.4, 0.008, 0.18]} />
          <meshStandardMaterial color="#35353d" roughness={0.75} metalness={0.1} />
        </mesh>
      ))}
      {/* Spacebar */}
      <mesh position={[0, 0.075, 0.45]}>
        <boxGeometry args={[1.2, 0.008, 0.14]} />
        <meshStandardMaterial color="#38383f" roughness={0.72} metalness={0.12} />
      </mesh>
    </group>
  );
}

function Trackpad() {
  return (
    <group>
      {/* Wide touchpad */}
      <mesh position={[0, 0.065, 0.72]}>
        <boxGeometry args={[1.1, 0.01, 0.52]} />
        <meshStandardMaterial color="#42424c" roughness={0.38} metalness={0.32} />
      </mesh>
      {/* Touchpad border accent */}
      <mesh position={[0, 0.07, 0.72]}>
        <boxGeometry args={[1.12, 0.005, 0.54]} />
        <meshStandardMaterial color="#50505a" roughness={0.35} metalness={0.3} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Hinge() {
  return (
    <group>
      {/* Main hinge barrel */}
      <mesh position={[0, 0.05, -1.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 2.9, 12]} />
        <meshStandardMaterial color="#32323c" roughness={0.38} metalness={0.48} />
      </mesh>
      {/* Hinge caps */}
      <mesh position={[-1.45, 0.05, -1.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#3a3a44" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[1.45, 0.05, -1.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#3a3a44" roughness={0.35} metalness={0.5} />
      </mesh>
    </group>
  );
}

function LedIndicator() {
  return (
    <group>
      {/* LED dot */}
      <mesh position={[0, 0.06, 0.88]}>
        <cylinderGeometry args={[0.012, 0.012, 0.004, 8]} />
        <meshStandardMaterial
          color="#2d7ff9"
          emissive="#2d7ff9"
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* Subtle LED glow ring */}
      <mesh position={[0, 0.062, 0.88]}>
        <ringGeometry args={[0.014, 0.02, 16]} />
        <meshStandardMaterial
          color="#2d7ff9"
          emissive="#2d7ff9"
          emissiveIntensity={0.15}
          transparent
          opacity={0.4}
          side={2}
        />
      </mesh>
    </group>
  );
}

function LidShell() {
  return (
    <group>
      {/* Main lid — thinner profile */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[3.15, 2.0, 0.065]} />
        <meshStandardMaterial color="#3e3e46" roughness={0.55} metalness={0.35} />
      </mesh>
      {/* Lid edge accent — thin perimeter line */}
      <mesh position={[0, 1.05, 0.034]}>
        <boxGeometry args={[3.17, 2.02, 0.003]} />
        <meshStandardMaterial color="#4a4a54" roughness={0.3} metalness={0.4} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function ScreenBezel() {
  return (
    <group>
      {/* Inner bezel — thinner for premium look */}
      <mesh position={[0, 1.05, 0.038]}>
        <boxGeometry args={[2.9, 1.8, 0.008]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.92} metalness={0.03} />
      </mesh>
      {/* Camera dot */}
      <mesh position={[0, 1.92, 0.044]}>
        <cylinderGeometry args={[0.01, 0.01, 0.003, 8]} />
        <meshStandardMaterial color="#222228" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
}

function ScreenSurface({ screenMatRef }: { screenMatRef?: MutableRefObject<ScreenMaterialHandle | null> }) {
  return (
    <mesh position={[0, 1.05, 0.044]}>
      <boxGeometry args={[2.75, 1.65, 0.004]} />
      <meshStandardMaterial
        ref={(el: ScreenMaterialHandle | null) => { if (screenMatRef) screenMatRef.current = el; }}
        color="#1c3852"
        roughness={0.25}
        metalness={0.08}
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

function BaseGroup({ baseMatRef }: { baseMatRef?: MutableRefObject<BaseMaterialHandle | null> }) {
  return (
    <group>
      <BaseBody baseMatRef={baseMatRef} />
      <KeyboardSurface />
      <Trackpad />
      <Hinge />
      <LedIndicator />
    </group>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export default function LaptopPrototype({ openRequested = false, reducedMotion = false, onOpened, cameraPush = false }: LaptopPrototypeProps) {
  const lidPivotRef = useRef<LidPivotHandle | null>(null);
  const screenMatRef = useRef<ScreenMaterialHandle | null>(null);
  const baseMatRef = useRef<BaseMaterialHandle | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const cameraPushStartRef = useRef<number | null>(null);
  const cameraPushDoneRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  const { invalidate, size, camera } = useThree();

  useEffect(() => {
    onOpenedRef.current = onOpened;
  }, [onOpened]);

  const scale = getResponsiveScale(size.width);

  useEffect(() => {
    if (openRequested || reducedMotion || cameraPush) {
      invalidate();
    }
  }, [openRequested, reducedMotion, cameraPush, invalidate]);

  useFrame((state) => {
    if (completedRef.current && !cameraPush) return;

    const lid = lidPivotRef.current;
    const mat = screenMatRef.current;
    const baseMat = baseMatRef.current;
    if (!lid || !mat) return;

    /* ── Waiting for activation: hold closed, dark screen ── */
    if (!openRequested) {
      lid.rotation.x = CLOSED_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_DARK;
      if (baseMat) baseMat.emissiveIntensity = 0;
      return;
    }

    /* ── Reduced motion: snap everything in one frame ── */
    if (reducedMotion && !completedRef.current) {
      /* Lid + screen */
      lid.rotation.x = OPEN_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_FINAL;
      if (baseMat) baseMat.emissiveIntensity = 0;
      /* Camera */
      if (cameraPush) {
        camera.position.set(...CAMERA_END_POSITION);
        cameraPushDoneRef.current = true;
      }
      completedRef.current = true;
      onOpenedRef.current?.();
      return;
    }

    /* After reduced-motion snap: nothing left to do */
    if (reducedMotion) return;

    /* ── Lid opening animation ── */
    if (!completedRef.current) {
      if (startTimeRef.current === null) {
        startTimeRef.current = state.clock.getElapsedTime() * 1000;
      }

      const elapsed = state.clock.getElapsedTime() * 1000 - startTimeRef.current;

      if (elapsed >= SETTLE_END_MS) {
        /* Animation complete — final values */
        lid.rotation.x = OPEN_LID_ANGLE;
        mat.emissiveIntensity = SCREEN_INTENSITY_FINAL;
        if (baseMat) baseMat.emissiveIntensity = 0;
        completedRef.current = true;
        onOpenedRef.current?.();
      } else {
        /* ── Lid angle with anticipation + settle ── */
        let lidAngle: number;

        if (elapsed < ANTICIPATION_END_MS) {
          /* Anticipation: brief hold at closed */
          lidAngle = CLOSED_LID_ANGLE;
        } else if (elapsed < LID_START_MS) {
          /* Tiny compression before opening */
          const rawT = (elapsed - ANTICIPATION_END_MS) / (LID_START_MS - ANTICIPATION_END_MS);
          lidAngle = CLOSED_LID_ANGLE + 0.02 * rawT;
        } else if (elapsed < LID_END_MS) {
          /* Main opening: smooth ease-out */
          const rawT = (elapsed - LID_START_MS) / (LID_END_MS - LID_START_MS);
          const t = easeOutCubic(rawT);
          lidAngle = CLOSED_LID_ANGLE + (OPEN_LID_ANGLE - CLOSED_LID_ANGLE) * t;
        } else if (elapsed < SETTLE_END_MS) {
          /* Settle: tiny overshoot and return */
          const rawT = (elapsed - LID_END_MS) / (SETTLE_END_MS - LID_END_MS);
          const t = easeOutBack(rawT);
          const overshoot = 0.015;
          lidAngle = OPEN_LID_ANGLE + overshoot * (1 - t);
        } else {
          lidAngle = OPEN_LID_ANGLE;
        }

        /* ── Screen intensity: dark until opening completes, then final ── */
        const intensity = elapsed < SETTLE_END_MS ? SCREEN_INTENSITY_DARK : SCREEN_INTENSITY_FINAL;

        /* ── Base LED pulse during activation phase ── */
        if (baseMat) {
          if (elapsed < LID_END_MS) {
            /* Pulsing blue glow on base during opening */
            const pulse = Math.sin((elapsed / 200) * Math.PI) * 0.15 + 0.1;
            baseMat.emissiveIntensity = pulse;
          } else {
            baseMat.emissiveIntensity = 0;
          }
        }

        lid.rotation.x = lidAngle;
        mat.emissiveIntensity = intensity;
        invalidate();
      }
    }

    /* ── Camera push ── */
    if (cameraPush && !cameraPushDoneRef.current && completedRef.current) {
      if (cameraPushStartRef.current === null) {
        cameraPushStartRef.current = state.clock.getElapsedTime() * 1000;
      }

      const elapsed = state.clock.getElapsedTime() * 1000 - cameraPushStartRef.current;

      if (elapsed >= CAMERA_PUSH_DURATION) {
        camera.position.set(...CAMERA_END_POSITION);
        cameraPushDoneRef.current = true;
      } else {
        const rawT = elapsed / CAMERA_PUSH_DURATION;
        const t = easeInOutQuad(rawT);

        camera.position.set(
          CAMERA_START_POSITION[0] + (CAMERA_END_POSITION[0] - CAMERA_START_POSITION[0]) * t,
          CAMERA_START_POSITION[1] + (CAMERA_END_POSITION[1] - CAMERA_START_POSITION[1]) * t,
          CAMERA_START_POSITION[2] + (CAMERA_END_POSITION[2] - CAMERA_START_POSITION[2]) * t
        );
        invalidate();
      }
    }
  });

  return (
    <group scale={scale} rotation={[-0.15, 0, 0]} position={[0, -0.3, 0]}>
      <BaseGroup baseMatRef={baseMatRef} />
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
