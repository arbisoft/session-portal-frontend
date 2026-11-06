# Self-healing protocol (shared reference)

Every agent and skill under `.claude/` can go stale: paths move, versions change, rules get replaced. This file is the one place that says how to react. Individual agents and skills link here and add only their own file-specific checks.

## When you notice drift

1. **Detect mechanically first.** Run `node .claude/scripts/config-audit.mjs`. It reports missing paths and scripts, stale framework versions, unknown agent or skill references, broken frontmatter, duplicated instructions and dependencies that moved since the last research pass.
2. **Verify against the code.** The repository and `package.json` are the evidence. A rule that contradicts correct, current code is the stale part.
3. **Patch in the same run.** Fix the stale line in the agent, skill or reference, and list it in your report under "Config self-heal". Do not leave it for a later run to rediscover.
4. **Only fix what you observed.** Do not rewrite sections you did not touch or verify.
5. **Never invent.** If a replacement fact cannot be confirmed from the repository or an official source, write "not defined in the repository" or leave it out.
6. **One source of truth.** Before adding a rule, check `claude-config-maintainer` for the owner of that topic. If another file owns it, link instead of restating. Restated rules drift apart.
7. **No volatile facts.** Do not write counts (for example of test files), dates or version numbers that the code already states. Name the rule or the file instead. Where a version is needed, the audit compares it with `package.json`.

## What counts as a security-relevant rule

Rules about auth, tokens, cookies, redirects, headers, dependencies and secrets (`architecture-guardian` sections 2, 3 and 7). Self-healing may correct their wording or paths. It must not weaken or remove one on its own: record it under "Needs a decision" and let a human decide.
