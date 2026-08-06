# Troubleshooting Map

| Symptom | First evidence | Owner | Safe next step |
|---|---|---|---|
| Configuration rejected | JSONC/schema validation output | Set 1 orchestrator | Correct only the invalid configuration field |
| Agent does not load | Agent frontmatter and exact model ID | Set 1 orchestrator | Validate frontmatter, then restart OpenCode |
| Pinned model unavailable | Sanitized provider/model error | Set 1 orchestrator | Stop for human decision; do not substitute |
| Delegation denied | `subagent_depth` and agent `task` policy | Set 1 orchestrator | Confirm only the primary orchestrator is dispatching |
| Test or build fails | Exact command and first failing boundary | `s1-debugger` | Diagnose read-only and propose a minimal correction |
| Git action requested | Git status/diff/history | `s1-release` | Propose the exact command and wait for approval |
| MCP unavailable | Sanitized MCP health status | Assigned MCP agent | Use declared local fallback or stop |

Never troubleshoot by printing resolved configuration, environment values, MCP headers, tokens, or credentials.
