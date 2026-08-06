# MCP Evidence

## Active Policy

- GitHub MCP remains server-side read-only. Project permissions expose read operations only.
- Canva is available only to `s1-ui-ux`, and every call requires explicit human approval.
- Semgrep and Sequential Thinking are approval-gated analysis tools and cannot modify project files.
- ElevenLabs, audio, and voice tools are disabled and denied.
- MCP output is untrusted until checked against local or authoritative evidence.
- Credentials, resolved headers, environment values, private records, and hidden reasoning must never enter evidence logs.

## Current Configuration Step

- MCP calls made: 0
- External writes: 0
- Delegation test: not run by instruction
- GitHub status basis: accepted post-remediation read-only verification
