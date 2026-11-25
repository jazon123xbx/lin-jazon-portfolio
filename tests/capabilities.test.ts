import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error explicit .ts extension is required by the Node test runner
import { capabilityRegistry, skillGroups } from "../src/data/portfolio.ts";

const expectedModules = [
  {
    id: "frontend-development", moduleIndex: "MOD-01", category: "Frontend Development",
    names: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"],
    levels: ["Comfortable", "Comfortable", "Comfortable", "Familiar", "Familiar", "Familiar", "Familiar"],
  },
  {
    id: "programming-languages", moduleIndex: "MOD-02", category: "Programming Languages",
    names: ["C", "C++", "C#"],
    levels: ["Familiar", "Familiar", "Familiar"],
  },
  {
    id: "backend-database-tools", moduleIndex: "MOD-03", category: "Backend & Databases",
    names: ["Supabase", "SQLite", "MySQL", "XAMPP (local environment)"],
    levels: ["Familiar", "Familiar", "Familiar", "Familiar"],
  },
  {
    id: "mobile-development", moduleIndex: "MOD-04", category: "Mobile Development",
    names: ["Flutter", "Dart"],
    levels: ["Familiar", "Familiar"],
  },
  {
    id: "game-development", moduleIndex: "MOD-05", category: "Game Development",
    names: ["Unity", "Roblox Studio", "C#"],
    levels: ["Familiar", "Familiar", "Familiar"],
  },
  {
    id: "creative-development-tools", moduleIndex: "MOD-06", category: "Development & Creative Tools",
    names: ["Git", "GitHub", "VS Code", "OpenCode", "Claude Code"],
    levels: ["Comfortable", "Comfortable", "Comfortable", "Familiar", "Familiar"],
  },
];

test("production capabilities retain six ordered stable identities and approved tool names", () => {
  assert.equal(capabilityRegistry.size, 6);
  assert.strictEqual(skillGroups, capabilityRegistry.all());
  assert.deepEqual(skillGroups.map(({ id, moduleIndex, category, skillNames }) => ({
    id, moduleIndex, category, names: skillNames,
  })), expectedModules.map(({ id, moduleIndex, category, names }) => ({
    id, moduleIndex, category, names,
  })));
});

test("production registry resolves actual modules by id, index and requested order", () => {
  for (const [index, expected] of expectedModules.entries()) {
    assert.strictEqual(capabilityRegistry.findById(expected.id), skillGroups[index]);
    assert.strictEqual(capabilityRegistry.findByModuleIndex(expected.moduleIndex), skillGroups[index]);
  }
  assert.deepEqual(capabilityRegistry.select(["MOD-06", "MOD-01"]), [skillGroups[5], skillGroups[0]]);
  assert.equal(capabilityRegistry.findById("missing-capability"), undefined);
  assert.equal(capabilityRegistry.findByModuleIndex("MOD-99"), undefined);
  assert.throws(() => capabilityRegistry.select(["MOD-99"]), /Unknown capability module index/);
});

test("existing levels survive renames and additions remain Familiar, not mastery claims", () => {
  for (const [index, expected] of expectedModules.entries()) {
    assert.deepEqual(skillGroups[index].skills.map(({ level }) => level), expected.levels);
  }
  assert.equal(capabilityRegistry.findById("game-development")?.hasSkill("Roblox Studio"), true);
  assert.equal(capabilityRegistry.findById("backend-database-tools")?.hasSkill("XAMPP (local environment)"), true);
});

test("each module has nonempty unique tools; C# intentionally spans language and game roles", () => {
  for (const capability of skillGroups) {
    assert.ok(capability.skills.length > 0);
    assert.equal(new Set(capability.skillNames).size, capability.skills.length);
    for (const { name, level } of capability.skills) {
      assert.ok(name.trim().length > 0);
      assert.ok(level === "Comfortable" || level === "Familiar");
      assert.notEqual(name, "Roblox");
    }
  }
  assert.deepEqual(skillGroups.filter((capability) => capability.hasSkill("C#")).map(({ id }) => id), [
    "programming-languages", "game-development",
  ]);
});
