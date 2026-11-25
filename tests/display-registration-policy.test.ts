import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
// @ts-expect-error explicit .ts extension is required by the Node test runner
import { evaluateProjectedTargets, homographyFromRectangle, type SourceRect } from "../src/lib/display-projection.ts";

// Execute the production pure policy and its constant, not a copied policy or
// source-text assertions. Isolating these AST nodes avoids loading React/DOM
// and Next's runtime path aliases; TypeScript is already a repository dependency.
const source = readFileSync(new URL("../src/components/useDisplayRegistration.ts", import.meta.url), "utf8");
const parsed = ts.createSourceFile("useDisplayRegistration.ts", source, ts.ScriptTarget.Latest, true);
const nodes = parsed.statements.filter((node) =>
  (ts.isFunctionDeclaration(node) && node.name?.text === "projectionPhaseAllows") ||
  (ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) =>
    ts.isIdentifier(declaration.name) && declaration.name.text === "DIAGNOSTIC_PHASES")));
assert.equal(nodes.length, 2, "production phase policy and diagnostic phases must be isolated together");
const compiled = ts.transpileModule(nodes.map((node) => node.getText(parsed)).join("\n"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const policyExports: Record<string, unknown> = {};
runInNewContext(compiled.outputText, { exports: policyExports });
const allows = policyExports.projectionPhaseAllows as (
  phase: string,
  mode: "flat" | "projected",
  interactiveQualified: boolean,
  targets?: { fits: boolean; confident: boolean },
) => boolean;
assert.equal(typeof allows, "function");

const sourceSize = { width: 448, height: 269 };
const anchors: SourceRect[] = [
  { center: { x: 122, y: 128 }, width: 192, height: 68 },
  { center: { x: 326, y: 128 }, width: 192, height: 68 },
  { center: { x: 122, y: 208 }, width: 192, height: 68 },
  { center: { x: 326, y: 208 }, width: 192, height: 68 },
];
function targetsAt(scale: number, targets = anchors) {
  const width = sourceSize.width * scale;
  const height = sourceSize.height * scale;
  const h = homographyFromRectangle(sourceSize, {
    topLeft: { x: 100, y: 100 }, topRight: { x: 100 + width, y: 100 },
    bottomRight: { x: 100 + width, y: 100 + height }, bottomLeft: { x: 100, y: 100 + height },
  });
  assert.ok(h);
  return evaluateProjectedTargets(h, sourceSize, targets);
}

test("projected diagnostics hold through ui-reveal without anchors, then require interactive entry headroom", () => {
  assert.equal(allows("camera-push", "projected", false), true);
  const intentionallyUnavailable = targetsAt(0.737, []);
  assert.deepEqual(intentionallyUnavailable, { fits: false, confident: false });
  assert.equal(allows("ui-reveal", "projected", false, intentionallyUnavailable), true);
  assert.equal(allows("ui-reveal", "projected", false), true);
  assert.equal(allows("interactive", "projected", false, intentionallyUnavailable), false);
  assert.equal(allows("interactive", "projected", false, targetsAt(0.69)), false);
  assert.equal(allows("interactive", "projected", false, targetsAt(0.737)), true);
});

test("flat ui-reveal never promotes, including empty or otherwise qualifying measurements", () => {
  for (const qualified of [false, true]) {
    assert.equal(allows("ui-reveal", "flat", qualified), false);
    assert.equal(allows("ui-reveal", "flat", qualified, targetsAt(0.737, [])), false);
    assert.equal(allows("ui-reveal", "flat", qualified, targetsAt(0.737)), false);
  }
});

test("only successfully qualified interactive projection uses 44px retention", () => {
  const retentionOnly = targetsAt(0.66); // 44.88px tall, below 47.52px entry
  assert.deepEqual(retentionOnly, { fits: true, confident: false });
  assert.equal(allows("interactive", "projected", false, retentionOnly), false);
  assert.equal(allows("interactive", "projected", true, retentionOnly), true);
  assert.equal(allows("interactive", "flat", false, retentionOnly), false);
  assert.equal(allows("interactive", "flat", true, retentionOnly), false);
  assert.equal(allows("interactive", "projected", true, targetsAt(0.64)), false);
});

test("interactive fails closed for unavailable, incomplete or overlapping anchors even after activation", () => {
  for (const qualified of [false, true]) {
    assert.equal(allows("interactive", "projected", qualified), false);
    for (const targets of [[], anchors.slice(0, 3), [...anchors, anchors[0]], anchors.map(() => anchors[0])]) {
      assert.equal(allows("interactive", "projected", qualified, targetsAt(0.737, targets)), false);
    }
  }
});

test("failed interactive qualification requires entry again after safe flat fallback", () => {
  assert.equal(allows("ui-reveal", "projected", false), true);
  assert.equal(allows("interactive", "projected", false, targetsAt(0.69)), false);
  // The caller's failure path goes flat and clears interactive qualification.
  assert.equal(allows("interactive", "flat", false, targetsAt(0.69)), false);
  assert.equal(allows("interactive", "flat", false, targetsAt(0.737)), true);
  assert.equal(allows("interactive", "projected", true, targetsAt(0.69)), true);
});

test("other phase policies are unchanged", () => {
  for (const mode of ["flat", "projected"] as const) {
    for (const phase of ["booting", "system-check", "access-granted", "welcome-hold", "camera-push"]) {
      assert.equal(allows(phase, mode, false), true);
    }
    for (const phase of ["idle", "activation", "unknown"]) assert.equal(allows(phase, mode, false), false);
  }
});
