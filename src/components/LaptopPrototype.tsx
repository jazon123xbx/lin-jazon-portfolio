"use client";

import { useRef, useEffect, type MutableRefObject } from "react";
import { useFrame, useThree, Vector3 } from "@react-three/fiber";
import { isGlassQuadValid, type GlassQuad, type Point } from "@/lib/display-projection";

export const OPEN_LID_ANGLE = -Math.PI * 0.18;
export const CLOSED_LID_ANGLE = Math.PI / 2;

/* ── Glass dimensions — single source of truth ───────────────
   The visible screen mesh and the four projected front-face corners both use
   these values, so geometry cannot drift between the renderer and the bridge. */
export const GLASS_WIDTH = 2.75;
export const GLASS_HEIGHT = 1.65;
export const GLASS_DEPTH = 0.004;
export const GLASS_SURFACE_Y = 1.05;
export const GLASS_SURFACE_Z = 0.044;
const GLASS_FRONT_Z = GLASS_DEPTH / 2;

/** Mesh-local corners of the front (+z) glass face, in clockwise screen order. */
const GLASS_LOCAL_CORNERS = {
  topLeft: [-GLASS_WIDTH / 2, GLASS_HEIGHT / 2, GLASS_FRONT_Z],
  topRight: [GLASS_WIDTH / 2, GLASS_HEIGHT / 2, GLASS_FRONT_Z],
  bottomRight: [GLASS_WIDTH / 2, -GLASS_HEIGHT / 2, GLASS_FRONT_Z],
  bottomLeft: [-GLASS_WIDTH / 2, -GLASS_HEIGHT / 2, GLASS_FRONT_Z],
} as const;

/* Power-on finish: a restrained lift from the dark idle glass. Timing and the
   dark endpoint are unchanged; this only makes the settled screen read as lit. */
const SCREEN_INTENSITY_FINAL = 0.17;
const SCREEN_INTENSITY_DARK = 0.015;

/* Keyboard backlight suggestion: the recess between key rows lifts faintly and
   neutral-white with the existing opening progress, then holds one static
   settled value. Low and nonnegative; the key-row bars themselves stay dark
   and non-emissive, so no strip ever reads as a glowing bar. */
const KEYBOARD_RECESS_GLOW = 0.17;

/* ── Lid timeline (anticipation → controlled motion → settle) ── */
const ANTICIPATION_END_MS = 200;
const LID_START_MS = 200;
const LID_END_MS = 1500;
const SETTLE_END_MS = 1800;

/* ── Camera push ────────────────────────────────────────────── */
// Establish the exterior, then aim just below the transformed glass for reading headroom.
const CAMERA_START_POSITION: Vector3 = [0, 1.15, 7.2];
const CAMERA_READING_POSITION: [number, number, number] = [0, 1.15, 5.8];
const CAMERA_REFRAME_START_MS = 1100;
const CAMERA_PUSH_DURATION = 600;
const CAMERA_PUSH_FRACTION = 0.12;

function blendPoint(from: readonly number[], to: readonly number[], t: number): [number, number, number] {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
}

/* ── Glass corner projection bridge ─────────────────────────── */

interface MatrixLike { readonly elements: ArrayLike<number> }

/** Structural handle: the real glass mesh supplies these members. */
interface GlassMeshHandle {
  readonly matrixWorld: MatrixLike;
  updateWorldMatrix(updateParents: boolean, updateChildren: boolean): void;
}

interface ProjectableCamera {
  readonly projectionMatrix: MatrixLike;
  readonly matrixWorldInverse: MatrixLike;
  updateMatrixWorld(force?: boolean): void;
}

/** Apply a column-major 4x4 matrix to a homogeneous point. */
function applyMatrix4(e: ArrayLike<number>, p: readonly number[]): [number, number, number, number] {
  return [
    e[0] * p[0] + e[4] * p[1] + e[8] * p[2] + e[12],
    e[1] * p[0] + e[5] * p[1] + e[9] * p[2] + e[13],
    e[2] * p[0] + e[6] * p[1] + e[10] * p[2] + e[14],
    e[3] * p[0] + e[7] * p[1] + e[11] * p[2] + e[15],
  ];
}

/**
 * Project the four actual front-face corners through the mesh's world matrix
 * and the camera's real inverse-view/projection matrices into canvas CSS px.
 * No lid/tilt/scale formula is re-derived here: the matrices are authoritative.
 */
function projectGlassQuad(
  mesh: GlassMeshHandle,
  cam: ProjectableCamera,
  size: { width: number; height: number }
): GlassQuad | null {
  // Lid angle and camera pose were written by this frame's updates; refresh the
  // world and inverse-view matrices before reading them (the renderer has not
  // performed its own update yet).
  mesh.updateWorldMatrix(true, false);
  cam.updateMatrixWorld(true);
  const world = mesh.matrixWorld.elements;
  const view = cam.matrixWorldInverse.elements;
  const projection = cam.projectionMatrix.elements;

  const toCss = (local: readonly number[]): Point | null => {
    const worldPoint = applyMatrix4(world, local);
    const viewPoint = applyMatrix4(view, [worldPoint[0], worldPoint[1], worldPoint[2]]);
    const clip = applyMatrix4(projection, [viewPoint[0], viewPoint[1], viewPoint[2]]);
    if (!Number.isFinite(clip[3]) || clip[3] <= 1e-6) return null; // behind camera / back-facing
    const nx = clip[0] / clip[3];
    const ny = clip[1] / clip[3];
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;
    return {
      x: (nx * 0.5 + 0.5) * size.width,
      y: (0.5 - ny * 0.5) * size.height,
    };
  };

  const topLeft = toCss(GLASS_LOCAL_CORNERS.topLeft);
  const topRight = toCss(GLASS_LOCAL_CORNERS.topRight);
  const bottomRight = toCss(GLASS_LOCAL_CORNERS.bottomRight);
  const bottomLeft = toCss(GLASS_LOCAL_CORNERS.bottomLeft);
  if (!topLeft || !topRight || !bottomRight || !bottomLeft) return null;
  const quad: GlassQuad = { topLeft, topRight, bottomRight, bottomLeft };
  // Convex, clockwise, finite and large enough. Viewing the glass from behind
  // reverses its winding, so the positive-area check rejects back faces too.
  return isGlassQuadValid(quad) ? quad : null;
}

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

/* ── Closed presentation (idle only) ──────────────────────────
   While the lid is closed the prototype is framed to read like the CSS
   fallback: a graphite wedge showing lid and base surface, centred just
   below the canvas middle. Width, tilt and lift derive continuously from
   the real canvas size and aspect — no viewport breakpoints — by projecting
   the closed silhouette through the idle camera. The presentation lives on
   an isolated wrapper group and blends back with the lid's own opening
   progress; at blend 1 the wrapper is exactly identity, so the open
   endpoint stays pixel-identical to the untouched root transform. */
const CLOSED_CAMERA_FOV_DEG = 32; // mirrors the Canvas camera fov
const CLOSED_WIDTH_FRACTION = 0.8; // closed silhouette as a share of canvas width
const CLOSED_TILT_DEPTH = 0.33; // wedge tilt: asin solve over canvas aspect
const CLOSED_TILT_BIAS = 0.14; // tilt bias toward the fallback's flat read
const CLOSED_TILT_MIN = 0.02; // keeps a hint of lid face on very wide canvases
const CLOSED_CENTER_Y = 0.52; // silhouette centre as a share of canvas height
const CLOSED_PIVOT_Y = -0.27; // closed stack centre in scene space

/* Idle camera basis: the Canvas start position, aimed at the origin. */
const CLOSED_CAM_START = CAMERA_START_POSITION as [number, number, number];
const CLOSED_CAM_DIST = Math.hypot(CLOSED_CAM_START[1], CLOSED_CAM_START[2]);
const CLOSED_VIEW_DIR: [number, number, number] = [
  0, -CLOSED_CAM_START[1] / CLOSED_CAM_DIST, -CLOSED_CAM_START[2] / CLOSED_CAM_DIST,
];
const CLOSED_VIEW_UP: [number, number, number] = [
  0, CLOSED_CAM_START[2] / CLOSED_CAM_DIST, -CLOSED_CAM_START[1] / CLOSED_CAM_DIST,
];

/** Transform handle of the isolated presentation wrapper group. */
interface PresentationHandle {
  rotation: { x: number };
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

/** Closed idle presentation held by the wrapper group. */
interface ClosedPresentation {
  tiltX: number;
  scale: number;
  offsetY: number;
}

/**
 * Derive the closed presentation from the real canvas size. The closed
 * silhouette (base slab, closed lid shell and its protruding hinge, after
 * the existing root transform) is projected through the idle camera in NDC;
 * the total scale is solved so the silhouette spans CLOSED_WIDTH_FRACTION of
 * the canvas width, the forward tilt follows the canvas aspect (shallow on
 * wide canvases, steep on narrow ones, saturating face-on) so the visible
 * thickness tracks the CSS fallback's share of canvas height, and the lift
 * centres the silhouette just below the canvas middle. Pure math, cheap
 * enough to run on every frame that needs it.
 */
function getClosedPresentation(width: number, height: number): ClosedPresentation {
  const aspect = width / Math.max(1, height);
  const beta = Math.max(CLOSED_TILT_MIN, Math.asin(Math.min(1, CLOSED_TILT_DEPTH / aspect)) - CLOSED_TILT_BIAS);
  const tiltX = beta + 0.15; // cancels the root group's built-in back-tilt
  const tanHalfY = Math.tan((CLOSED_CAMERA_FOV_DEG / 2) * (Math.PI / 180));
  const openScale = getResponsiveScale(width);
  const cosTilt = Math.cos(tiltX);
  const sinTilt = Math.sin(tiltX);
  const cosRoot = Math.cos(-0.15);
  const sinRoot = Math.sin(-0.15);
  const silhouette: Array<[number, number, number]> = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    silhouette.push([sx * 1.65, sy * 0.05, sz * 1.125]); // base slab
    // Closed lid: Rx(π/2) maps lid-local height (1.05 ± 1.0) to z about the
    // pivot at z=-1.05, i.e. world z = ±1.0; y = pivot y ∓ half thickness.
    silhouette.push([sx * 1.575, 0.06 - sz * 0.0325, sy * 1.0]); // closed lid shell
    silhouette.push([sx * 1.585, 0.06 - sz * 0.034, sy * 1.01]); // lid edge accent
    silhouette.push([sx * 1.45, 0.05 + sy * 0.035, -1.08 + sz * 0.035]); // hinge barrel
  }
  // Model point -> NDC: root transform, then wrapper (tilt+scale about the
  // closed stack centre plus lift), then the idle camera aimed at the origin.
  const project = (v: readonly [number, number, number], wrapper: number, py: number): [number, number, number] => {
    const ly = openScale * (v[1] * cosRoot - v[2] * sinRoot) - 0.3;
    const lz = openScale * (v[1] * sinRoot + v[2] * cosRoot);
    const ay = ly - CLOSED_PIVOT_Y;
    const wy = (ay * cosTilt - lz * sinTilt) * wrapper + CLOSED_PIVOT_Y + py;
    const wz = (ay * sinTilt + lz * cosTilt) * wrapper;
    const ry = wy - CLOSED_CAM_START[1];
    const rz = wz - CLOSED_CAM_START[2];
    const depth = ry * CLOSED_VIEW_DIR[1] + rz * CLOSED_VIEW_DIR[2];
    const ny = (ry * CLOSED_VIEW_UP[1] + rz * CLOSED_VIEW_UP[2]) / (depth * tanHalfY);
    return [(v[0] * openScale * wrapper) / (depth * tanHalfY * aspect), ny, depth];
  };
  // Solve the wrapper scale (on top of the existing root scale) by fixed point
  // (a nearer silhouette magnifies more) and lift the silhouette so its centre
  // sits just below the canvas middle.
  let wrapper = (CLOSED_WIDTH_FRACTION * 2 * CLOSED_CAM_START[2] * tanHalfY * aspect) / (3.3 * openScale);
  let py = 0;
  for (let i = 0; i < 10; i++) {
    let nx0 = Infinity;
    let nx1 = -Infinity;
    let ny0 = Infinity;
    let ny1 = -Infinity;
    let depthSum = 0;
    for (const v of silhouette) {
      const [nx, ny, depth] = project(v, wrapper, py);
      if (nx < nx0) nx0 = nx;
      if (nx > nx1) nx1 = nx;
      if (ny < ny0) ny0 = ny;
      if (ny > ny1) ny1 = ny;
      depthSum += depth;
    }
    wrapper = Math.min(6, Math.max(0.05, wrapper * (CLOSED_WIDTH_FRACTION * 2) / Math.max(1e-6, nx1 - nx0)));
    // A rigid lift moves the NDC centre by lift / (depth * tanHalfY).
    py += (1 - 2 * CLOSED_CENTER_Y - (ny0 + ny1) / 2) * (depthSum / silhouette.length) * tanHalfY;
  }
  return { tiltX, scale: wrapper, offsetY: py };
}

interface LaptopPrototypeProps {
  openRequested?: boolean;
  reducedMotion?: boolean;
  onOpened?: () => void;
  cameraPush?: boolean;
  /** Stable geometry callback: receives the four glass corners in canvas CSS
   * pixels after lid/camera updates, or null when the glass is not readable. */
  onGlassQuad?: (quad: GlassQuad | null) => void;
}

interface LidPivotHandle {
  rotation: { x: number };
}

interface ScreenMaterialHandle {
  emissiveIntensity: number;
}

interface KeyboardMaterialHandle {
  emissiveIntensity: number;
}

/* ── Geometry components ────────────────────────────────────── */

function BaseBody() {
  return (
    <group>
      {/* Main base slab — thinner, slightly wider. Neutral graphite satin;
          no emissive term: activation light lives in the keyboard recess. */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.3, 0.1, 2.25]} />
        <meshStandardMaterial color="#41464e" roughness={0.54} metalness={0.4} />
      </mesh>
      {/* Front edge chamfer — thin accent strip, restrained highlight */}
      <mesh position={[0, 0.035, 1.1]}>
        <boxGeometry args={[3.3, 0.03, 0.04]} />
        <meshStandardMaterial color="#89919c" roughness={0.32} metalness={0.52} />
      </mesh>
      {/* Rear vent strip */}
      <mesh position={[0, 0.035, -1.08]}>
        <boxGeometry args={[2.4, 0.02, 0.06]} />
        <meshStandardMaterial color="#2e2e36" roughness={0.7} metalness={0.2} />
      </mesh>
    </group>
  );
}

function KeyboardSurface({ recessMatRef }: { recessMatRef?: MutableRefObject<KeyboardMaterialHandle | null> }) {
  return (
    <group>
      {/* Keyboard recess — grouped key treatment. The recess itself is the only
          emissive keyboard surface: a faint neutral-white backlight suggestion
          driven by opening progress (see updateFrame). The row bars stay dark. */}
      <mesh position={[0, 0.065, -0.18]}>
        <boxGeometry args={[2.7, 0.015, 1.35]} />
        <meshStandardMaterial
          ref={(el: KeyboardMaterialHandle | null) => { if (recessMatRef) recessMatRef.current = el; }}
          color="#23262b"
          roughness={0.88}
          metalness={0.05}
          emissive="#eef2f7"
          emissiveIntensity={0}
        />
      </mesh>
      {/* Key rows — subtle grouped blocks instead of individual meshes.
          Deliberately non-emissive so they never read as four glowing strips. */}
      {[0, 1, 2, 3].map((row) => (
        <mesh key={`kr${row}`} position={[0, 0.075, -0.55 + row * 0.25]}>
          <boxGeometry args={[2.4, 0.008, 0.18]} />
          <meshStandardMaterial color="#30333a" roughness={0.85} metalness={0.06} />
        </mesh>
      ))}
      {/* Spacebar */}
      <mesh position={[0, 0.075, 0.45]}>
        <boxGeometry args={[1.2, 0.008, 0.14]} />
        <meshStandardMaterial color="#33363c" roughness={0.84} metalness={0.06} />
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
        <meshStandardMaterial color="#4b5059" roughness={0.38} metalness={0.3} />
      </mesh>
      {/* Touchpad border accent */}
      <mesh position={[0, 0.07, 0.72]}>
        <boxGeometry args={[1.12, 0.005, 0.54]} />
        <meshStandardMaterial color="#626a75" roughness={0.34} metalness={0.28} transparent opacity={0.35} />
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
        <meshStandardMaterial color="#5a626d" roughness={0.38} metalness={0.5} />
      </mesh>
      {/* Hinge caps */}
      <mesh position={[-1.45, 0.05, -1.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#89919b" roughness={0.34} metalness={0.52} />
      </mesh>
      <mesh position={[1.45, 0.05, -1.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#89919b" roughness={0.34} metalness={0.52} />
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
      {/* Main lid — thinner profile. Satin graphite: darker and rougher than
          before so the key light reads as a soft sheen, not a silver mirror. */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[3.15, 2.0, 0.065]} />
        <meshStandardMaterial color="#4b515a" roughness={0.5} metalness={0.38} />
      </mesh>
      {/* Lid edge accent — thin perimeter line, restrained highlight */}
      <mesh position={[0, 1.05, 0.034]}>
        <boxGeometry args={[3.17, 2.02, 0.003]} />
        <meshStandardMaterial color="#7d848e" roughness={0.34} metalness={0.5} />
      </mesh>
    </group>
  );
}

function ScreenBezel() {
  return (
    <group>
      {/* Inner bezel — thinner for premium look, matte */}
      <mesh position={[0, 1.05, 0.038]}>
        <boxGeometry args={[2.9, 1.8, 0.008]} />
        <meshStandardMaterial color="#0f141b" roughness={0.86} metalness={0.05} />
      </mesh>
      {/* Camera dot */}
      <mesh position={[0, 1.92, 0.044]}>
        <cylinderGeometry args={[0.01, 0.01, 0.003, 8]} />
        <meshStandardMaterial color="#222228" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
}

function ScreenSurface({
  screenMatRef,
  glassRef,
}: {
  screenMatRef?: MutableRefObject<ScreenMaterialHandle | null>;
  glassRef?: MutableRefObject<GlassMeshHandle | null>;
}) {
  return (
    <mesh
      position={[0, GLASS_SURFACE_Y, GLASS_SURFACE_Z]}
      ref={(el: GlassMeshHandle | null) => { if (glassRef) glassRef.current = el; }}
    >
      <boxGeometry args={[GLASS_WIDTH, GLASS_HEIGHT, GLASS_DEPTH]} />
      <meshStandardMaterial
        ref={(el: ScreenMaterialHandle | null) => { if (screenMatRef) screenMatRef.current = el; }}
        color="#101b28"
        roughness={0.34}
        metalness={0.08}
        emissive="#0a1929"
        emissiveIntensity={SCREEN_INTENSITY_DARK}
      />
    </mesh>
  );
}

function LidGroup({
  screenMatRef,
  glassRef,
}: {
  screenMatRef?: MutableRefObject<ScreenMaterialHandle | null>;
  glassRef?: MutableRefObject<GlassMeshHandle | null>;
}) {
  return (
    <group>
      <LidShell />
      <ScreenBezel />
      <ScreenSurface screenMatRef={screenMatRef} glassRef={glassRef} />
    </group>
  );
}

function BaseGroup({ recessMatRef }: { recessMatRef?: MutableRefObject<KeyboardMaterialHandle | null> }) {
  return (
    <group>
      <BaseBody />
      <KeyboardSurface recessMatRef={recessMatRef} />
      <Trackpad />
      <Hinge />
      <LedIndicator />
    </group>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export default function LaptopPrototype({ openRequested = false, reducedMotion = false, onOpened, cameraPush = false, onGlassQuad }: LaptopPrototypeProps) {
  const lidPivotRef = useRef<LidPivotHandle | null>(null);
  const presentationRef = useRef<PresentationHandle | null>(null);
  const glassRef = useRef<GlassMeshHandle | null>(null);
  const screenMatRef = useRef<ScreenMaterialHandle | null>(null);
  const recessMatRef = useRef<KeyboardMaterialHandle | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const cameraPushStartRef = useRef<number | null>(null);
  const cameraPushDoneRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  const onGlassQuadRef = useRef(onGlassQuad);
  const { invalidate, size, camera } = useThree();

  useEffect(() => {
    onOpenedRef.current = onOpened;
  }, [onOpened]);

  useEffect(() => {
    onGlassQuadRef.current = onGlassQuad;
  }, [onGlassQuad]);

  // A canvas resize changes the derived closed presentation; the demand loop
  // needs an explicit frame to show it (the open presentation is unaffected).
  useEffect(() => {
    invalidate();
  }, [size.width, size.height, invalidate]);

  // Write the isolated presentation wrapper. blend 0 holds the closed
  // presentation; blend 1 (or a null presentation) is exactly identity, so
  // blended frames interpolate linearly back to the untouched root transform.
  const applyPresentation = (pres: ClosedPresentation | null, blend: number) => {
    const group = presentationRef.current;
    if (!group) return;
    const rest = 1 - blend;
    group.rotation.x = pres ? pres.tiltX * rest : 0;
    group.position.x = 0;
    group.position.y = pres ? pres.offsetY * rest : 0;
    group.position.z = 0;
    const wrapperScale = pres ? 1 + (pres.scale - 1) * rest : 1;
    group.scale.x = wrapperScale;
    group.scale.y = wrapperScale;
    group.scale.z = wrapperScale;
  };

  const scale = getResponsiveScale(size.width);
  const glassY = GLASS_SURFACE_Y * Math.cos(OPEN_LID_ANGLE) - GLASS_SURFACE_Z * Math.sin(OPEN_LID_ANGLE) + 0.06;
  const glassZ = GLASS_SURFACE_Y * Math.sin(OPEN_LID_ANGLE) + GLASS_SURFACE_Z * Math.cos(OPEN_LID_ANGLE) - 1.05;
  const glassCenter: [number, number, number] = [0,
    (glassY * Math.cos(-0.15) - glassZ * Math.sin(-0.15)) * scale - 0.3,
    (glassY * Math.sin(-0.15) + glassZ * Math.cos(-0.15)) * scale];
  const readingAim: [number, number, number] = [0, glassCenter[1] - 0.5, glassCenter[2]];
  const finalPosition = blendPoint(CAMERA_READING_POSITION, glassCenter, CAMERA_PUSH_FRACTION);

  useEffect(() => {
    if (openRequested || reducedMotion || cameraPush) {
      invalidate();
    }
  }, [openRequested, reducedMotion, cameraPush, invalidate]);

  // Existing lid/camera update logic, unchanged; extracted so the geometry
  // bridge can publish after every frame (including early-return paths).
  const updateFrame = (state: { clock: { getElapsedTime(): number } }) => {
    if (completedRef.current && !cameraPush && !reducedMotion) {
      applyPresentation(null, 1);
      camera.position.set(...CAMERA_READING_POSITION);
      camera.lookAt(...readingAim);
      return;
    }

    const lid = lidPivotRef.current;
    const mat = screenMatRef.current;
    const recess = recessMatRef.current;
    if (!lid || !mat) return;

    /* ── Waiting for activation: hold closed, dark screen, dark recess ── */
    if (!openRequested) {
      applyPresentation(getClosedPresentation(size.width, size.height), 0);
      lid.rotation.x = CLOSED_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_DARK;
      if (recess) recess.emissiveIntensity = 0;
      return;
    }

    /* ── Reduced motion: snap everything in one frame ── */
    if (reducedMotion) {
      applyPresentation(null, 1);
      /* Lid + screen */
      lid.rotation.x = OPEN_LID_ANGLE;
      mat.emissiveIntensity = SCREEN_INTENSITY_FINAL;
      if (recess) recess.emissiveIntensity = KEYBOARD_RECESS_GLOW;
      /* Camera */
      camera.position.set(...(cameraPush ? finalPosition : CAMERA_READING_POSITION));
      camera.lookAt(...readingAim);
      cameraPushDoneRef.current = cameraPush;
      if (!completedRef.current) onOpenedRef.current?.();
      completedRef.current = true;
      return;
    }

    /* ── Lid opening animation ── */
    if (!completedRef.current) {
      if (startTimeRef.current === null) {
        startTimeRef.current = state.clock.getElapsedTime() * 1000;
      }

      const elapsed = state.clock.getElapsedTime() * 1000 - startTimeRef.current;
      const framingT = easeInOutQuad(Math.min(1, Math.max(0,
        (elapsed - CAMERA_REFRAME_START_MS) / (SETTLE_END_MS - CAMERA_REFRAME_START_MS)
      )));
      camera.position.set(...blendPoint(CAMERA_START_POSITION as [number, number, number], CAMERA_READING_POSITION, framingT));
      camera.lookAt(...blendPoint([0, 0, 0], readingAim, framingT));

      if (elapsed >= SETTLE_END_MS) {
        /* Animation complete — final values (static and idempotent) */
        applyPresentation(null, 1);
        lid.rotation.x = OPEN_LID_ANGLE;
        mat.emissiveIntensity = SCREEN_INTENSITY_FINAL;
        if (recess) recess.emissiveIntensity = KEYBOARD_RECESS_GLOW;
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

        /* ── Keyboard recess backlight suggestion ──
           Low, neutral-white, nonnegative, and tied only to the existing lid
           opening progress. No new timeline, timer, RAF, or state: this runs in
           the frame that is already rendering the opening. Settles to one
           static value. */
        if (recess) {
          if (elapsed < LID_START_MS) {
            /* Lid still closed or compressing: dark */
            recess.emissiveIntensity = 0;
          } else if (elapsed < LID_END_MS) {
            /* Faint lift following the eased opening progress */
            const rawT = (elapsed - LID_START_MS) / (LID_END_MS - LID_START_MS);
            recess.emissiveIntensity = Math.max(0, KEYBOARD_RECESS_GLOW * easeOutCubic(rawT));
          } else {
            /* Settle window: lid effectively open — hold the settled glow */
            recess.emissiveIntensity = KEYBOARD_RECESS_GLOW;
          }
        }

        /* ── Closed presentation blend: the wrapper eases back to the root
              transform on the lid's own opening window, so the whole opening
              reads as one motion and the original framing is fully restored
              before the camera reframe, display registration and push. ── */
        applyPresentation(
          getClosedPresentation(size.width, size.height),
          easeOutCubic(Math.min(1, Math.max(0,
            (elapsed - LID_START_MS) / (CAMERA_REFRAME_START_MS - LID_START_MS)
          )))
        );

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
        camera.position.set(...finalPosition);
        camera.lookAt(...readingAim);
        cameraPushDoneRef.current = true;
      } else {
        const rawT = elapsed / CAMERA_PUSH_DURATION;
        const t = easeInOutQuad(rawT);

        // Finish the final 12% dolly inside the shell's existing 700ms push phase.
        camera.position.set(...blendPoint(CAMERA_READING_POSITION, finalPosition, t));
        camera.lookAt(...readingAim);
        invalidate();
      }
    }
  };

  const publishGlassQuad = () => {
    const mesh = glassRef.current;
    const quad = mesh ? projectGlassQuad(mesh, camera, size) : null;
    onGlassQuadRef.current?.(quad);
  };

  useFrame((state) => {
    updateFrame(state);
    // Always after the frame's lid/camera writes, including early returns.
    publishGlassQuad();
  });

  /* Isolated closed-presentation wrapper: pivot (+c) and restore (-c) are
     static, the middle group is written only by the frame loop and is exactly
     identity whenever the blend is done, so the root group below — the
     protected open transform — is untouched at the open endpoint. */
  return (
    <group position={[0, CLOSED_PIVOT_Y, 0]}>
      <group ref={(el: PresentationHandle | null) => { presentationRef.current = el; }}>
        <group position={[0, -CLOSED_PIVOT_Y, 0]}>
          <group scale={scale} rotation={[-0.15, 0, 0]} position={[0, -0.3, 0]}>
            <BaseGroup recessMatRef={recessMatRef} />
            <group
              ref={(el: LidPivotHandle | null) => { lidPivotRef.current = el; }}
              position={[0, 0.06, -1.05]}
              rotation={[CLOSED_LID_ANGLE, 0, 0]}
            >
              <LidGroup screenMatRef={screenMatRef} glassRef={glassRef} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
