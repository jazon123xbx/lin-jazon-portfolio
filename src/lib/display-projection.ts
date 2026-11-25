/**
 * Pure math for registering a semantic DOM display onto the four front-face
 * corners of the 3D glass. No DOM, React, Three.js or browser APIs are used
 * here: this module is deterministic and unit-testable with plain Node.
 *
 * Coordinates are CSS pixels relative to the WebGL canvas. The four quad
 * corners are ordered clockwise as seen on screen: top-left, top-right,
 * bottom-right, bottom-left (positive shoelace area in a y-down system).
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Painted rectangle in untransformed source coordinates (not a hit-area proxy). */
export interface SourceRect extends Size {
  center: Point;
}

export interface ProjectedRect extends Size {
  quad: GlassQuad;
}

export interface GlassQuad {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export type CornerName = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";

export const QUAD_CORNERS: readonly CornerName[] = [
  "topLeft",
  "topRight",
  "bottomRight",
  "bottomLeft",
];

/** Row-major 3x3 projective transform; h22 is normalized to 1. */
export interface Homography {
  h00: number;
  h01: number;
  h02: number;
  h10: number;
  h11: number;
  h12: number;
  h20: number;
  h21: number;
  h22: number;
}

export interface QuadValidityOptions {
  /** Minimum length of every edge, in CSS pixels. */
  minEdge?: number;
  /** Minimum absolute polygon area, in CSS pixels squared. */
  minArea?: number;
}

export interface FitOptions {
  /** Canvas size in CSS pixels, used to require all four corners visible. */
  canvas: Size;
  /** Intrinsic (untransformed) size of the display source rectangle. */
  source: Size;
  /** Minimum on-screen size of a 44x44 target after projection. Default 44. */
  minTarget?: number;
  /** Extra safety margin applied to the target requirement for entry. Default 1.08. */
  headroom?: number;
  /** Inset kept between a quad corner and the canvas edge. Default 4. */
  edgeInset?: number;
  /** Maximum allowed homography corner mapping error. Default 1 CSS px. */
  maxCornerError?: number;
}

export type GeometryFitOptions = Pick<FitOptions, "canvas" | "source" | "edgeInset" | "maxCornerError">;

export interface ProjectionGeometryEvaluation {
  /** The quad is a finite, convex, correctly wound quadrilateral. */
  valid: boolean;
  /** Valid plus visible corners and an accurate source transform; no target policy. */
  fits: boolean;
  /** Geometry has no target headroom policy, so this equals fits. */
  confident: boolean;
  reasons: string[];
  homography: Homography | null;
  matrix3d: string | null;
  /** Worst source-corner mapping error, in CSS pixels (0 when unavailable). */
  cornerError: number;
}

export interface ProjectionEvaluation extends ProjectionGeometryEvaluation {
  /** Geometry fits and the legacy synthetic target meets the minimum size. */
  fits: boolean;
  /** Fits with legacy target headroom, i.e. safe enough to enter projected mode. */
  confident: boolean;
  /** Projected size of a 44 CSS px target at the display center. */
  minTargetPx: number;
}

const EPS = 1e-9;

/* ── Quad primitives ─────────────────────────────────────────── */

export function quadToPoints(quad: GlassQuad): Point[] {
  return QUAD_CORNERS.map((name) => quad[name]);
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/** Positive for a clockwise (front-facing) quad in a y-down coordinate system. */
export function signedArea(points: readonly Point[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

/**
 * Rejects crossed, reversed, collapsed and non-finite quads. A valid quad is
 * convex, clockwise, large enough to carry a readable display, and has four
 * distinct corners.
 */
export function isGlassQuadValid(quad: GlassQuad | null | undefined, options: QuadValidityOptions = {}): boolean {
  if (!quad) return false;
  const minEdge = options.minEdge ?? 8;
  const minArea = options.minArea ?? 400;
  const pts = quadToPoints(quad);
  if (pts.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return false;
  for (let i = 0; i < pts.length; i++) {
    if (distance(pts[i], pts[(i + 1) % pts.length]) < minEdge) return false;
  }
  const area = signedArea(pts);
  if (!Number.isFinite(area) || area < minArea) return false;
  // All four consecutive cross products must share the front-facing sign.
  for (let i = 0; i < pts.length; i++) {
    if (cross(pts[i], pts[(i + 1) % pts.length], pts[(i + 2) % pts.length]) <= EPS) return false;
  }
  return true;
}

/* ── Linear algebra ──────────────────────────────────────────── */

/** Gaussian elimination with partial pivoting; returns null for singular systems. */
function solveSystem(matrix: readonly number[][], rhs: readonly number[]): number[] | null {
  const n = rhs.length;
  const m = matrix.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    }
    if (Math.abs(m[pivot][col]) < EPS) return null;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const scale = m[col][col];
    for (let c = col; c <= n; c++) m[col][c] /= scale;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = m[row][col];
      if (factor === 0) continue;
      for (let c = col; c <= n; c++) m[row][c] -= factor * m[col][c];
    }
  }
  return m.map((row) => row[n]);
}

/**
 * Direct 4-point homography (h22 normalized to 1). Returns null when the
 * correspondence is degenerate. `from` and `to` must be equally sized point
 * arrays; the first four pairs are used.
 */
export function computeHomography(from: readonly Point[], to: readonly Point[]): Homography | null {
  if (from.length < 4 || to.length < 4) return null;
  const rows: number[][] = [];
  const rhs: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = from[i];
    const { x: u, y: v } = to[i];
    if (![x, y, u, v].every(Number.isFinite)) return null;
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    rhs.push(u);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    rhs.push(v);
  }
  const h = solveSystem(rows, rhs);
  if (!h || h.some((v) => !Number.isFinite(v))) return null;
  return {
    h00: h[0], h01: h[1], h02: h[2],
    h10: h[3], h11: h[4], h12: h[5],
    h20: h[6], h21: h[7], h22: 1,
  };
}

/** Homography mapping the source rectangle (origin at 0,0) onto the glass quad. */
export function homographyFromRectangle(size: Size, quad: GlassQuad): Homography | null {
  const { width: w, height: h } = size;
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  if (!isGlassQuadValid(quad)) return null;
  return computeHomography(
    [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }],
    quadToPoints(quad)
  );
}

export function mapPoint(h: Homography, p: Point): Point {
  const w = h.h20 * p.x + h.h21 * p.y + h.h22;
  if (!Number.isFinite(w) || Math.abs(w) < EPS) return { x: NaN, y: NaN };
  return {
    x: (h.h00 * p.x + h.h01 * p.y + h.h02) / w,
    y: (h.h10 * p.x + h.h11 * p.y + h.h12) / w,
  };
}

/**
 * CSS matrix3d (column-major arguments) for a 2D homography. With
 * `transform-origin: 0 0`, mapping local (x,y,0) through this matrix divides
 * by the homogeneous w term and yields exactly mapPoint(h, {x,y}).
 */
export function matrix3dFromHomography(h: Homography): string {
  return (
    `matrix3d(${h.h00}, ${h.h10}, 0, ${h.h20}, ` +
    `${h.h01}, ${h.h11}, 0, ${h.h21}, ` +
    `0, 0, 1, 0, ` +
    `${h.h02}, ${h.h12}, 0, ${h.h22})`
  );
}

/** Worst corner mapping error in CSS pixels. */
export function maxCornerError(h: Homography, from: readonly Point[], to: readonly Point[]): number {
  let worst = 0;
  for (let i = 0; i < Math.min(from.length, to.length); i++) {
    const mapped = mapPoint(h, from[i]);
    const err = distance(mapped, to[i]);
    if (!Number.isFinite(err)) return Infinity;
    worst = Math.max(worst, err);
  }
  return worst;
}

export function rectangleCorners(size: Size): Point[] {
  return [
    { x: 0, y: 0 },
    { x: size.width, y: 0 },
    { x: size.width, y: size.height },
    { x: 0, y: size.height },
  ];
}

/** Local projected size of a `2*delta` box, via central differences of the homography. */
export function localScale(h: Homography, at: Point, delta = 22): { x: number; y: number } {
  const px = mapPoint(h, { x: at.x + delta, y: at.y });
  const mx = mapPoint(h, { x: at.x - delta, y: at.y });
  const py = mapPoint(h, { x: at.x, y: at.y + delta });
  const my = mapPoint(h, { x: at.x, y: at.y - delta });
  return {
    x: distance(px, mx) / (2 * delta),
    y: distance(py, my) / (2 * delta),
  };
}

/**
 * Projects all four painted corners. Dimensions are conservative perpendicular
 * separations between opposing edges, not an axis-aligned bounding box or a
 * center-scale estimate. Rejects off-source rectangles and projective poles.
 */
export function projectSourceRect(h: Homography, source: Size, rect: SourceRect): ProjectedRect | null {
  const { width, height, center } = rect;
  if (![source.width, source.height, width, height, center.x, center.y].every(Number.isFinite) ||
      source.width <= 0 || source.height <= 0 || width <= 0 || height <= 0) return null;
  const left = center.x - width / 2;
  const top = center.y - height / 2;
  const right = center.x + width / 2;
  const bottom = center.y + height / 2;
  if (left < 0 || top < 0 || right > source.width || bottom > source.height) return null;
  const corners = [{ x: left, y: top }, { x: right, y: top }, { x: right, y: bottom }, { x: left, y: bottom }];
  const denominators = corners.map((p) => h.h20 * p.x + h.h21 * p.y + h.h22);
  if (!denominators.every((w) => Number.isFinite(w) && Math.abs(w) >= EPS && Math.sign(w) === Math.sign(denominators[0]))) return null;
  const [topLeft, topRight, bottomRight, bottomLeft] = corners.map((p) => mapPoint(h, p));
  const quad = { topLeft, topRight, bottomRight, bottomLeft };
  if (!isGlassQuadValid(quad, { minEdge: EPS, minArea: EPS })) return null;
  const separation = (a: Point, b: Point, c: Point, d: Point) => Math.min(
    Math.abs(cross(a, b, c)) / distance(a, b),
    Math.abs(cross(a, b, d)) / distance(a, b),
    Math.abs(cross(c, d, a)) / distance(c, d),
    Math.abs(cross(c, d, b)) / distance(c, d),
  );
  return {
    quad,
    width: separation(topLeft, bottomLeft, topRight, bottomRight),
    height: separation(topLeft, topRight, bottomLeft, bottomRight),
  };
}

/** Four distinct, nonoverlapping painted navigation targets: 44px stay / 47.52px entry. */
export function evaluateProjectedTargets(h: Homography, source: Size, rects: readonly SourceRect[]): { fits: boolean; confident: boolean } {
  const rejected = { fits: false, confident: false };
  if (rects.length !== 4 || Array.from(rects).some((rect) => !rect)) return rejected;
  const projected = rects.map((rect) => projectSourceRect(h, source, rect));
  if (projected.some((rect) => rect === null)) return rejected;
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      if (Math.abs(rects[i].center.x - rects[j].center.x) < (rects[i].width + rects[j].width) / 2 &&
          Math.abs(rects[i].center.y - rects[j].center.y) < (rects[i].height + rects[j].height) / 2) return rejected;
    }
  }
  const meets = (minimum: number) => projected.every((rect) => rect !== null && rect.width >= minimum && rect.height >= minimum);
  return { fits: meets(44), confident: meets(44 * 1.08) };
}

/* ── Pure fit evaluation ─────────────────────────────────────── */

/**
 * Evaluates only quad validity, source mapping and canvas containment. Target
 * eligibility is a separate policy; geometry alone does not prove readability.
 */
export function evaluateProjectionGeometry(quad: GlassQuad | null, options: GeometryFitOptions): ProjectionGeometryEvaluation {
  const inset = options.edgeInset ?? 4;
  const maxError = options.maxCornerError ?? 1;
  const reasons: string[] = [];
  const base: ProjectionGeometryEvaluation = {
    valid: false, fits: false, confident: false, reasons,
    homography: null, matrix3d: null, cornerError: 0,
  };
  if (!isGlassQuadValid(quad)) {
    reasons.push("quad invalid");
    return base;
  }
  const q = quad as GlassQuad;
  base.valid = true;
  const h = homographyFromRectangle(options.source, q);
  if (!h) {
    reasons.push("homography singular");
    return base;
  }
  base.homography = h;
  base.matrix3d = matrix3dFromHomography(h);
  base.cornerError = maxCornerError(h, rectangleCorners(options.source), quadToPoints(q));
  if (!Number.isFinite(base.cornerError) || base.cornerError > maxError) {
    reasons.push("corner mapping error too large");
  }

  const pts = quadToPoints(q);
  const cw = options.canvas.width;
  const ch = options.canvas.height;
  if (!Number.isFinite(cw) || !Number.isFinite(ch) || cw <= 0 || ch <= 0) {
    reasons.push("canvas size invalid");
  } else if (pts.some((p) => p.x < inset || p.y < inset || p.x > cw - inset || p.y > ch - inset)) {
    reasons.push("glass corner outside canvas");
  }

  base.fits = reasons.length === 0;
  base.confident = base.fits;
  return base;
}

/**
 * Legacy fit policy: geometry plus a synthetic source target (44 CSS px by
 * default). Existing callers retain the same stay/entry thresholds. Call
 * evaluateProjectionGeometry when applying a separate actual-target policy.
 */
export function evaluateProjection(quad: GlassQuad | null, options: FitOptions): ProjectionEvaluation {
  const geometry = evaluateProjectionGeometry(quad, options);
  const base: ProjectionEvaluation = { ...geometry, minTargetPx: 0 };
  const h = base.homography;
  if (!h) return base;
  const minTarget = options.minTarget ?? 44;
  const headroom = options.headroom ?? 1.08;
  const center = { x: options.source.width / 2, y: options.source.height / 2 };
  const scale = localScale(h, center);
  base.minTargetPx = minTarget * Math.min(scale.x, scale.y);
  if (!Number.isFinite(base.minTargetPx) || base.minTargetPx < minTarget) {
    base.reasons.push("target below minimum size");
  }

  base.fits = base.reasons.length === 0;
  base.confident = base.fits && base.minTargetPx >= minTarget * headroom;
  return base;
}
