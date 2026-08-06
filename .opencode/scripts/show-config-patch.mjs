import { readFileSync } from "node:fs"

const files = [
  "opencode.jsonc",
  ".opencode/agents/set1-app-orchestrator.md",
  ".opencode/agents/s1-repo-explorer.md",
  ".opencode/agents/s1-product-planner.md",
  ".opencode/agents/s1-ui-ux.md",
  ".opencode/agents/s1-app-implementer.md",
  ".opencode/agents/s1-data-api.md",
  ".opencode/agents/s1-tester.md",
  ".opencode/agents/s1-debugger.md",
  ".opencode/agents/s1-reviewer.md",
  ".opencode/agents/s1-security.md",
  ".opencode/agents/s1-readiness-auditor.md",
  ".opencode/agents/s1-release.md",
  ".opencode/commands/build-normal-app.md",
  ".opencode/skills/set1-governance/SKILL.md",
  ".opencode/plugins/README.md",
  ".opencode/scripts/validate-set1-config.mjs",
  ".opencode/scripts/show-config-patch.mjs",
  ".opencode/app-factory/VERIFIED_ENVIRONMENT.json",
  ".opencode/app-factory/VERIFIED_MODELS.json",
  ".opencode/app-factory/MODEL_ROUTING_POLICY.json",
  ".opencode/app-factory/MODEL_SWITCH_EVENTS.jsonl",
  ".opencode/app-factory/SESSION_RUNTIME_REPORT.json",
  ".opencode/app-factory/MCP_REGISTRY.json",
  ".opencode/app-factory/MCP_POLICY.json",
  ".opencode/app-factory/MCP_HEALTH.json",
  ".opencode/app-factory/MCP_USAGE.jsonl",
  ".opencode/app-factory/MCP_EVIDENCE.md",
  ".opencode/app-factory/MODULE_BOUNDARIES.json",
  ".opencode/app-factory/DEPENDENCY_RULES.json",
  ".opencode/app-factory/ERROR_CATALOG.json",
  ".opencode/app-factory/TROUBLESHOOTING_MAP.md",
  ".opencode/app-factory/ARCHITECTURE_VIOLATIONS.json"
]

for (const file of files) {
  const normalized = file.replaceAll("\\", "/")
  const content = readFileSync(file, "utf8").replace(/\r\n/g, "\n")
  const lines = content.endsWith("\n") ? content.slice(0, -1).split("\n") : content.split("\n")
  console.log(`diff --git a/${normalized} b/${normalized}`)
  console.log("new file mode 100644")
  console.log("--- /dev/null")
  console.log(`+++ b/${normalized}`)
  console.log(`@@ -0,0 +1,${lines.length} @@`)
  lines.forEach((line) => console.log(`+${line}`))
}
