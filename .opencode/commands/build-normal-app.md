---
description: Runs the approval-gated Set 1 v1.7 normal application workflow.
agent: set1-app-orchestrator
model: openai/gpt-5.6-sol
---

Run the Set 1 v1.7 workflow for: $ARGUMENTS

Begin with repository discovery and a concise specification. Before implementation, present the objective, agents and exact model IDs, expected files, acceptance criteria, risks, and planned commands. Wait for explicit approval. Use no more than two specialists concurrently, preserve specialist separation, and stop at every configured approval gate.

After approved implementation, run deterministic testing, debugging when needed, independent technical review, security review when relevant, and final readiness audit. Report actual agents/models, files changed, commands, results, findings, unresolved issues, and a proposed Git action. Delegate Git write proposals to `s1-release` and never deploy automatically.
