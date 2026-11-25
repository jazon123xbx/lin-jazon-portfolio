import test from "node:test";
import assert from "node:assert/strict";
// Node 24 strips TS types at runtime and requires explicit .ts specifiers;
// the repository tsconfig uses bundler resolution without that opt-in flag.
// @ts-expect-error explicit .ts extension is required by the Node test runner
import { computeHomography, evaluateProjection, evaluateProjectionGeometry, evaluateProjectedTargets, homographyFromRectangle, isGlassQuadValid, mapPoint, matrix3dFromHomography, maxCornerError, projectSourceRect, quadToPoints, rectangleCorners, type GlassQuad, type Homography, type Point, type Size, type SourceRect } from "../src/lib/display-projection.ts";

const source: Size = { width: 400, height: 200 };
const canvas: Size = { width: 1000, height: 600 };
const fit = { canvas, source, edgeInset: 0 };

function rectQuad(x: number, y: number, w: number, h: number): GlassQuad {
  return {
    topLeft: { x, y },
    topRight: { x: x + w, y },
    bottomRight: { x: x + w, y: y + h },
    bottomLeft: { x, y: y + h },
  };
}

function close(a: number, b: number, tol = 1e-6): void {
  assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);
}

function cornersMatch(quad: GlassQuad, h: NonNullable<ReturnType<typeof homographyFromRectangle>>, tol = 1e-6): void {
  const from = rectangleCorners(source);
  const to = quadToPoints(quad);
  for (let i = 0; i < 4; i++) {
    const mapped = mapPoint(h, from[i]);
    close(mapped.x, to[i].x, tol);
    close(mapped.y, to[i].y, tol);
  }
}

test("identity: source rectangle maps to itself with zero error", () => {
  const quad = rectQuad(100, 100, source.width, source.height);
  assert.ok(isGlassQuadValid(quad));
  const h = homographyFromRectangle(source, quad);
  assert.ok(h);
  cornersMatch(quad, h);
  close(maxCornerError(h, rectangleCorners(source), quadToPoints(quad)), 0);
  const matrix = matrix3dFromHomography(h);
  assert.match(matrix, /^matrix3d\(/);
  assert.equal(matrix.split(",").length, 16);
  const ev = evaluateProjection(quad, fit);
  close(ev.minTargetPx, 44, 1e-3);
  assert.equal(ev.fits, true);
  assert.equal(ev.confident, false); // no headroom at exact 1:1 scale
});

test("trapezoid: convergent vertical edges still map all four corners exactly", () => {
  const quad: GlassQuad = {
    topLeft: { x: 250, y: 120 },
    topRight: { x: 750, y: 120 },
    bottomRight: { x: 830, y: 460 },
    bottomLeft: { x: 170, y: 460 },
  };
  assert.ok(isGlassQuadValid(quad));
  const h = homographyFromRectangle(source, quad);
  assert.ok(h);
  cornersMatch(quad, h);
  assert.ok(maxCornerError(h, rectangleCorners(source), quadToPoints(quad)) < 1e-6);
  assert.equal(evaluateProjection(quad, { canvas, source }).fits, true);
});

test("offset: translation is carried by the projective terms", () => {
  const quad = rectQuad(200, 90, source.width, source.height);
  const h = homographyFromRectangle(source, quad);
  assert.ok(h);
  close(h.h02, 200);
  close(h.h12, 90);
  close(h.h20, 0);
  close(h.h21, 0);
  cornersMatch(quad, h);
});

test("all four corners are individually addressable via mapPoint", () => {
  const quad: GlassQuad = {
    topLeft: { x: 210, y: 100 },
    topRight: { x: 790, y: 130 },
    bottomRight: { x: 860, y: 500 },
    bottomLeft: { x: 140, y: 470 },
  };
  const h = homographyFromRectangle(source, quad);
  assert.ok(h);
  const pairs: Array<[Point, Point]> = [
    [{ x: 0, y: 0 }, quad.topLeft],
    [{ x: source.width, y: 0 }, quad.topRight],
    [{ x: source.width, y: source.height }, quad.bottomRight],
    [{ x: 0, y: source.height }, quad.bottomLeft],
  ];
  for (const [from, to] of pairs) {
    const mapped = mapPoint(h, from);
    close(mapped.x, to.x);
    close(mapped.y, to.y);
  }
});

test("reversed winding is rejected as an invalid front face", () => {
  const reversed: GlassQuad = {
    topLeft: { x: 100, y: 100 },
    topRight: { x: 100, y: 300 },
    bottomRight: { x: 300, y: 300 },
    bottomLeft: { x: 300, y: 100 },
  };
  // The named corners now describe a counter-clockwise polygon.
  assert.equal(isGlassQuadValid(reversed), false);
  assert.equal(homographyFromRectangle(source, reversed), null);
});

test("crossed (bow-tie) quads are rejected", () => {
  const crossed: GlassQuad = {
    topLeft: { x: 100, y: 100 },
    topRight: { x: 300, y: 300 },
    bottomRight: { x: 300, y: 100 },
    bottomLeft: { x: 100, y: 300 },
  };
  assert.equal(isGlassQuadValid(crossed), false);
});

test("degenerate and near-invalid quads are rejected", () => {
  const collapsed: GlassQuad = {
    topLeft: { x: 100, y: 100 },
    topRight: { x: 100, y: 100 },
    bottomRight: { x: 100, y: 100 },
    bottomLeft: { x: 100, y: 100 },
  };
  const collinear: GlassQuad = {
    topLeft: { x: 100, y: 100 },
    topRight: { x: 200, y: 100 },
    bottomRight: { x: 300, y: 100 },
    bottomLeft: { x: 400, y: 100 },
  };
  const tiny: GlassQuad = rectQuad(100, 100, 8, 8);
  const nonFinite: GlassQuad = rectQuad(0, 0, 200, 100);
  nonFinite.topRight.x = Number.NaN;
  assert.equal(isGlassQuadValid(collapsed), false);
  assert.equal(isGlassQuadValid(collinear), false);
  assert.equal(isGlassQuadValid(tiny), false); // area below default 400px^2
  assert.equal(isGlassQuadValid(nonFinite), false);
  assert.equal(isGlassQuadValid(null), false);
  // Explicit relaxed options can accept a small but genuine quad.
  assert.equal(isGlassQuadValid(tiny, { minEdge: 1, minArea: 1 }), true);
});

test("computeHomography rejects too few or non-finite correspondences", () => {
  assert.equal(computeHomography([], []), null);
  const bad = rectangleCorners(source);
  bad[2] = { x: Infinity, y: 0 };
  assert.equal(computeHomography(bad, quadToPoints(rectQuad(0, 0, 400, 200))), null);
});

test("fit rejects off-canvas corners and shrunken targets", () => {
  const offCanvas = rectQuad(-50, 40, 300, 150);
  const off = evaluateProjection(offCanvas, { canvas, source });
  assert.equal(off.valid, true);
  assert.equal(off.fits, false);
  assert.ok(off.reasons.some((r) => r.includes("outside canvas")));

  const small = rectQuad(300, 250, 120, 60);
  const ev = evaluateProjection(small, { canvas, source });
  assert.equal(ev.fits, false);
  assert.ok(ev.minTargetPx < 44);
  assert.ok(ev.reasons.some((r) => r.includes("target")));

  const headroomOnly = rectQuad(100, 100, 500, 250);
  const hr = evaluateProjection(headroomOnly, fit);
  assert.equal(hr.fits, true);
  assert.equal(hr.confident, true);
});

test("measured-like 0.737 scale fits geometry but fails the legacy synthetic target gate", () => {
  const quad = rectQuad(200, 150, source.width * 0.737, source.height * 0.737);
  const geometry = evaluateProjectionGeometry(quad, { canvas, source });
  const legacy = evaluateProjection(quad, { canvas, source });
  assert.equal(geometry.valid, true);
  assert.equal(geometry.fits, true);
  assert.equal(geometry.confident, true);
  assert.deepEqual(geometry.reasons, []);
  assert.ok(geometry.homography);
  cornersMatch(quad, geometry.homography);
  close(geometry.cornerError, 0);
  assert.deepEqual(legacy.homography, geometry.homography);
  assert.equal(legacy.matrix3d, geometry.matrix3d);
  assert.equal(legacy.cornerError, geometry.cornerError);
  assert.equal(legacy.valid, true);
  assert.equal(legacy.fits, false);
  assert.equal(legacy.confident, false);
  assert.deepEqual(legacy.reasons, ["target below minimum size"]);
  close(legacy.minTargetPx, 44 * 0.737);
  close(legacy.minTargetPx, 32.428);
  close(44 * 1.08, 47.52);
  assert.ok(legacy.minTargetPx < 44 * 1.08);
});

test("legacy defaults retain minimum size and entry headroom semantics", () => {
  for (const scale of [0.737, 1, 1.04, 1.25]) {
    const quad = rectQuad(100, 100, source.width * scale, source.height * scale);
    const implicit = evaluateProjection(quad, { canvas, source });
    const explicit = evaluateProjection(quad, {
      canvas, source, minTarget: 44, headroom: 1.08, edgeInset: 4, maxCornerError: 1,
    });
    assert.deepEqual(implicit, explicit);
    assert.equal(implicit.fits, scale >= 1);
    assert.equal(implicit.confident, scale >= 1.08);
    assert.deepEqual(implicit.reasons, scale < 1 ? ["target below minimum size"] : []);
    close(implicit.minTargetPx, 44 * scale);
    assert.equal(evaluateProjectionGeometry(quad, { canvas, source }).confident, true);
  }
});

test("geometry-only evaluation preserves invalid quad and source rejection", () => {
  const nonFinite = rectQuad(100, 100, 400, 200);
  nonFinite.topLeft.x = NaN;
  for (const quad of [null, rectQuad(100, 100, 8, 8), nonFinite]) {
    const geometry = evaluateProjectionGeometry(quad, { canvas, source });
    assert.equal(geometry.valid, false);
    assert.equal(geometry.fits, false);
    assert.equal(geometry.confident, false);
    assert.equal(geometry.homography, null);
    assert.deepEqual(geometry.reasons, ["quad invalid"]);
    assert.deepEqual(evaluateProjection(quad, { canvas, source }), { ...geometry, minTargetPx: 0 });
  }
  const quad = rectQuad(100, 100, 400, 200);
  const options = { canvas, source: { width: 0, height: 200 } };
  const geometry = evaluateProjectionGeometry(quad, options);
  assert.equal(geometry.valid, true); // valid describes the quad, not the source
  assert.equal(geometry.fits, false);
  assert.equal(geometry.confident, false);
  assert.equal(geometry.homography, null);
  assert.deepEqual(geometry.reasons, ["homography singular"]);
  assert.deepEqual(evaluateProjection(quad, options), { ...geometry, minTargetPx: 0 });
});

test("geometry-only evaluation retains canvas, inset and corner-error constraints", () => {
  const cases = [
    { quad: rectQuad(3, 100, 400, 200), options: { canvas, source }, reason: "glass corner outside canvas" },
    { quad: rectQuad(5, 100, 400, 200), options: { canvas, source, edgeInset: 6 }, reason: "glass corner outside canvas" },
    { quad: rectQuad(100, 100, 400, 200), options: { canvas: { width: NaN, height: 600 }, source }, reason: "canvas size invalid" },
    { quad: rectQuad(100, 100, 400, 200), options: { canvas, source, maxCornerError: -1 }, reason: "corner mapping error too large" },
  ];
  for (const { quad, options, reason } of cases) {
    const geometry = evaluateProjectionGeometry(quad, options);
    assert.equal(geometry.valid, true);
    assert.equal(geometry.fits, false);
    assert.equal(geometry.confident, false);
    assert.deepEqual(geometry.reasons, [reason]);
    assert.equal(evaluateProjection(quad, options).fits, false);
  }
  assert.equal(evaluateProjectionGeometry(rectQuad(4, 4, 400, 200), { canvas, source }).fits, true);
});

test("legacy custom target and headroom still use the original scale calculation", () => {
  const quad = rectQuad(100, 100, 500, 250);
  const result = evaluateProjection(quad, { canvas, source, minTarget: 60, headroom: 1.3 });
  close(result.minTargetPx, 75);
  assert.equal(result.fits, true);
  assert.equal(result.confident, false);
  assert.deepEqual(result.reasons, []);
});

const navigationSource: Size = { width: 448, height: 269 };
const paintedTargets: SourceRect[] = [
  { center: { x: 122, y: 128 }, width: 192, height: 68 },
  { center: { x: 326, y: 128 }, width: 192, height: 68 },
  { center: { x: 122, y: 208 }, width: 192, height: 68 },
  { center: { x: 326, y: 208 }, width: 192, height: 68 },
];

function navigationTransform(scale: number): Homography {
  const h = homographyFromRectangle(navigationSource, rectQuad(100, 100, 448 * scale, 269 * scale));
  assert.ok(h);
  return h;
}

test("actual painted 192x68 anchors qualify at measured-like scale where synthetic 44 fails", () => {
  const h = navigationTransform(0.737);
  const target = projectSourceRect(h, navigationSource, paintedTargets[0]);
  assert.ok(target);
  close(target.width, 192 * 0.737);
  close(target.height, 68 * 0.737);
  assert.deepEqual(evaluateProjectedTargets(h, navigationSource, paintedTargets), { fits: true, confident: true });
  assert.equal(evaluateProjection(rectQuad(100, 100, 448 * 0.737, 269 * 0.737), { canvas, source: navigationSource }).fits, false);
});

test("actual targets distinguish entry 47.52 from retention 44 without lowering either", () => {
  for (const [scale, fits, confident] of [[0.64, false, false], [0.66, true, false], [0.69, true, false], [0.7, true, true]] as const) {
    assert.deepEqual(evaluateProjectedTargets(navigationTransform(scale), navigationSource, paintedTargets), { fits, confident });
  }
  close(68 * 0.66, 44.88);
  close(68 * 0.69, 46.92);
  close(68 * 0.7, 47.6);
});

test("both dimensions of every one of the four painted targets are required", () => {
  const h = navigationTransform(1);
  for (let index = 0; index < 4; index++) {
    for (const dimension of ["width", "height"] as const) {
      for (const [size, fits, confident] of [[43.99, false, false], [44, true, false], [47.51, true, false], [47.53, true, true]] as const) {
        const targets = paintedTargets.map((target, i) => i === index ? { ...target, [dimension]: size } : target);
        assert.deepEqual(evaluateProjectedTargets(h, navigationSource, targets), { fits, confident });
      }
    }
  }
});

test("actual target policy rejects empty, missing, extra and overlapping target sets", () => {
  const h = navigationTransform(1);
  for (const targets of [[], Array<SourceRect>(4), paintedTargets.slice(0, 3), [...paintedTargets, paintedTargets[0]], paintedTargets.map(() => paintedTargets[0])]) {
    assert.deepEqual(evaluateProjectedTargets(h, navigationSource, targets), { fits: false, confident: false });
  }
});

test("source-rectangle projection rejects invalid and off-surface painted rectangles", () => {
  const h = navigationTransform(1);
  const rect = paintedTargets[0];
  for (const bad of [
    { ...rect, width: 0 }, { ...rect, height: -1 }, { ...rect, width: NaN },
    { ...rect, center: { x: Infinity, y: 128 } },
    { ...rect, center: { x: 95, y: 128 } },
    { ...rect, center: { x: 353, y: 128 } },
    { ...rect, center: { x: 122, y: 33 } },
    { ...rect, center: { x: 122, y: 236 } },
  ]) {
    assert.equal(projectSourceRect(h, navigationSource, bad), null);
    assert.deepEqual(evaluateProjectedTargets(h, navigationSource, [bad, ...paintedTargets.slice(1)]), { fits: false, confident: false });
  }
  assert.equal(projectSourceRect(h, { width: 0, height: 269 }, rect), null);
  assert.equal(projectSourceRect(h, { width: 448, height: NaN }, rect), null);
  assert.ok(projectSourceRect(h, navigationSource, { center: { x: 224, y: 134.5 }, ...navigationSource }));
});

test("perspective projection maps every source corner and measures opposing edge separations", () => {
  const quad: GlassQuad = {
    topLeft: { x: 250, y: 120 }, topRight: { x: 750, y: 120 },
    bottomRight: { x: 830, y: 460 }, bottomLeft: { x: 170, y: 460 },
  };
  const h = homographyFromRectangle(navigationSource, quad);
  assert.ok(h);
  const rect = paintedTargets[0];
  const projected = projectSourceRect(h, navigationSource, rect);
  assert.ok(projected);
  const corners = [
    { x: 26, y: 94 }, { x: 218, y: 94 }, { x: 218, y: 162 }, { x: 26, y: 162 },
  ];
  const points = quadToPoints(projected.quad);
  for (let i = 0; i < 4; i++) assert.deepEqual(points[i], mapPoint(h, corners[i]));
  const pointToLine = (p: Point, a: Point, b: Point) =>
    Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / Math.hypot(b.x - a.x, b.y - a.y);
  const [a, b, c, d] = points;
  close(projected.width, Math.min(pointToLine(b, a, d), pointToLine(c, a, d), pointToLine(a, b, c), pointToLine(d, b, c)));
  close(projected.height, Math.min(pointToLine(d, a, b), pointToLine(c, a, b), pointToLine(a, d, c), pointToLine(b, d, c)));
  const centerScaleHeight = Math.hypot(
    mapPoint(h, { x: 122, y: 162 }).x - mapPoint(h, { x: 122, y: 94 }).x,
    mapPoint(h, { x: 122, y: 162 }).y - mapPoint(h, { x: 122, y: 94 }).y,
  );
  assert.ok(projected.height < centerScaleHeight);
});

test("perpendicular dimensions do not mistake shear or projective poles for usable target area", () => {
  const identity: Homography = { h00: 1, h01: 0, h02: 0, h10: 0, h11: 1, h12: 0, h20: 0, h21: 0, h22: 1 };
  const sheared = { ...identity, h01: 4 };
  assert.deepEqual(evaluateProjectedTargets(sheared, navigationSource, paintedTargets), { fits: true, confident: false });
  const rect = projectSourceRect(sheared, navigationSource, paintedTargets[0]);
  assert.ok(rect);
  close(rect.width, 192 / Math.sqrt(17));
  close(rect.height, 68);
  for (const h of [
    { ...identity, h00: NaN }, { ...identity, h00: 0 },
    { ...identity, h20: 1, h22: -122 }, { ...identity, h20: 1, h22: -26 },
  ]) assert.equal(projectSourceRect(h, navigationSource, paintedTargets[0]), null);
});

test("perspective cannot promote a target just because its center-scale dimensions pass", () => {
  const h: Homography = { h00: 1.8, h01: 0, h02: 0, h10: 0, h11: 1.8, h12: 0, h20: 0.004, h21: 0, h22: 1 };
  const rect = paintedTargets[3];
  const top = mapPoint(h, { x: rect.center.x, y: rect.center.y - rect.height / 2 });
  const bottom = mapPoint(h, { x: rect.center.x, y: rect.center.y + rect.height / 2 });
  const left = mapPoint(h, { x: rect.center.x - rect.width / 2, y: rect.center.y });
  const right = mapPoint(h, { x: rect.center.x + rect.width / 2, y: rect.center.y });
  assert.ok(Math.hypot(bottom.x - top.x, bottom.y - top.y) >= 47.52);
  assert.ok(Math.hypot(right.x - left.x, right.y - left.y) >= 47.52);
  const projected = projectSourceRect(h, navigationSource, rect);
  assert.ok(projected);
  assert.ok(projected.height < 47.52);
  assert.equal(evaluateProjectedTargets(h, navigationSource, paintedTargets).confident, false);
});
