import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const failures = []

function check(condition, message) {
  if (!condition) failures.push(message)
}

function stripJsonc(input) {
  let output = ""
  let inString = false
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = 0; index < input.length; index += 1) {
    const current = input[index]
    const next = input[index + 1]

    if (lineComment) {
      if (current === "\n") {
        lineComment = false
        output += current
      }
      continue
    }

    if (blockComment) {
      if (current === "*" && next === "/") {
        blockComment = false
        index += 1
      } else if (current === "\n") {
        output += current
      }
      continue
    }

    if (inString) {
      output += current
      if (escaped) escaped = false
      else if (current === "\\") escaped = true
      else if (current === "\"") inString = false
      continue
    }

    if (current === "\"") {
      inString = true
      output += current
    } else if (current === "/" && next === "/") {
      lineComment = true
      index += 1
    } else if (current === "/" && next === "*") {
      blockComment = true
      index += 1
    } else {
      output += current
    }
  }

  return output.replace(/,\s*([}\]])/g, "$1")
}

const configPath = join(root, "opencode.jsonc")
check(existsSync(configPath), "root opencode.jsonc is missing")
check(!existsSync(join(root, "opencode.json")), "forbidden root opencode.json exists")
check(!existsSync(join(root, ".opencode", "opencode.json")), "forbidden .opencode/opencode.json exists")
check(!existsSync(join(root, ".opencode", "opencode.jsonc")), "forbidden .opencode/opencode.jsonc exists")

let config
try {
  config = JSON.parse(stripJsonc(readFileSync(configPath, "utf8")))
} catch (error) {
  failures.push(`opencode.jsonc parse failed: ${error.message}`)
}

if (config) {
  check(config.$schema === "https://opencode.ai/config.json", "schema URL is incorrect")
  check(config.model === "openai/gpt-5.6-sol", "primary model is incorrect")
  check(config.default_agent === "set1-app-orchestrator", "default agent is incorrect")
  check(config.subagent_depth === 1, "subagent_depth must be 1")
  check(config.permission?.task === "deny", "global task permission must deny delegation")
  check(config.mcp?.elevenlabs?.enabled === false, "elevenlabs MCP must be disabled")
  check(config.mcp?.ElevenLabs?.enabled === false, "ElevenLabs MCP must be disabled")
}

const routing = JSON.parse(readFileSync(join(root, ".opencode", "app-factory", "MODEL_ROUTING_POLICY.json"), "utf8"))
const agentsDir = join(root, ".opencode", "agents")
const agentFiles = readdirSync(agentsDir).filter((name) => name.endsWith(".md")).sort()
const expectedAgents = Object.keys(routing.permanent_routes).sort()
check(JSON.stringify(agentFiles.map((name) => name.slice(0, -3))) === JSON.stringify(expectedAgents), "agent roster differs from MODEL_ROUTING_POLICY.json")

for (const file of agentFiles) {
  const name = file.slice(0, -3)
  const content = readFileSync(join(agentsDir, file), "utf8")
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  check(Boolean(frontmatter), `${file}: invalid or missing frontmatter delimiters`)
  if (!frontmatter) continue

  const header = frontmatter[1]
  const model = header.match(/^model:\s*(\S+)$/m)?.[1]
  const mode = header.match(/^mode:\s*(\S+)$/m)?.[1]
  check(Boolean(header.match(/^description:\s*.+$/m)), `${file}: description is missing`)
  check(model === routing.permanent_routes[name], `${file}: model does not match routing policy`)
  check(name === "set1-app-orchestrator" ? mode === "primary" : mode === "subagent", `${file}: mode is incorrect`)
  check(!header.match(/^tools:/m), `${file}: deprecated tools permission found`)

  if (name === "set1-app-orchestrator") {
    check(/^  task:\r?\n/m.test(header), `${file}: task allowlist is missing`)
    for (const specialist of expectedAgents.filter((agent) => agent !== name)) {
      check(header.includes(`    ${specialist}: allow`), `${file}: missing delegation permission for ${specialist}`)
    }
  } else {
    check(/^  task: deny$/m.test(header), `${file}: subagent task delegation must be denied`)
  }
}

const appFactoryDir = join(root, ".opencode", "app-factory")
for (const file of readdirSync(appFactoryDir)) {
  const path = join(appFactoryDir, file)
  if (file.endsWith(".json")) {
    try {
      JSON.parse(readFileSync(path, "utf8"))
    } catch (error) {
      failures.push(`${file}: JSON parse failed: ${error.message}`)
    }
  }
  if (file.endsWith(".jsonl")) {
    const lines = readFileSync(path, "utf8").split(/\r?\n/).filter(Boolean)
    lines.forEach((line, index) => {
      try {
        JSON.parse(line)
      } catch (error) {
        failures.push(`${file}:${index + 1}: JSONL parse failed: ${error.message}`)
      }
    })
  }
}

const localIgnore = readFileSync(join(root, ".opencode", ".gitignore"), "utf8").split(/\r?\n/)
check(localIgnore.includes("node_modules/"), ".opencode/.gitignore must contain node_modules/")
check(existsSync(join(root, ".opencode", "package.json")), ".opencode/package.json must be preserved")
check(existsSync(join(root, ".opencode", "package-lock.json")), ".opencode/package-lock.json must be preserved")

if (failures.length > 0) {
  console.error(`Set 1 validation failed (${failures.length})`)
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exitCode = 1
} else {
  console.log(`PASS: JSONC parsed; ${agentFiles.length} agent frontmatters and app-factory JSON/JSONL files validated.`)
}
