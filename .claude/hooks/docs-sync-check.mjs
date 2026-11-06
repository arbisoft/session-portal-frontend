#!/usr/bin/env node
// Stop hook. Blocks the stop (once per situation) when:
//   1. source/config files changed but no documentation did -> run the documentation pipeline;
//   2. the Claude config audit reports errors             -> run claude-config-maintainer;
//   3. a code change has not been reviewed for config impact -> run claude-config-maintainer.
// Skills and agents cannot be invoked from a hook, so it blocks the stop with a reason instead.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  behaviorFingerprint,
  changedFiles,
  isBehaviorFile,
  isDocFile,
  projectRoot,
  readReviewState,
  runAudit,
  writeReviewState,
} from "../scripts/config-audit.mjs";

const readStdin = () => {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
};

const input = readStdin();
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || projectRoot;
const changed = changedFiles(root);
if (changed.length === 0) process.exit(0);

const preview = (files) => {
  const extra = files.length > 8 ? " and " + (files.length - 8) + " more" : "";
  return files.slice(0, 8).join(", ") + extra;
};
const reasons = [];

const behaviorChanges = changed.filter(isBehaviorFile);
if (behaviorChanges.length > 0 && !changed.some(isDocFile)) {
  reasons.push(
    `Code or configuration changed (${preview(behaviorChanges)}) but no documentation did. Run the documentation pipeline now, in order: ` +
      "update-project-docs, then documentation-generator, then documentation-reviewer. " +
      'If the docs already match the code, say "Documentation is already synchronized" and finish.'
  );
}

const touchesClaudeConfig = changed.some((file) => file === "CLAUDE.md" || file.startsWith(".claude/"));
if (behaviorChanges.length > 0 || touchesClaudeConfig) {
  const review = readReviewState(root);
  const fingerprint = behaviorFingerprint(root);
  const errors = runAudit(root).findings.filter((finding) => finding.severity === "error");

  const auditKey = createHash("sha256").update(fingerprint).update(JSON.stringify(errors)).digest("hex");
  if (errors.length > 0 && review.askedAudit !== auditKey) {
    const lines = errors.slice(0, 6).map((error) => `${error.file}:${error.line} ${error.message}`);
    reasons.push(
      `The Claude config audit found ${errors.length} error(s): ${lines.join("; ")}${errors.length > 6 ? "; ..." : ""}. ` +
        "Invoke the claude-config-maintainer agent to fix them (it runs node .claude/scripts/config-audit.mjs)."
    );
    writeReviewState(root, { askedAudit: auditKey });
  } else if (behaviorChanges.length > 0 && review.reviewed !== fingerprint && review.asked !== fingerprint) {
    reasons.push(
      "This code change has not been reviewed for Claude config impact. Invoke the claude-config-maintainer agent as the final step; " +
        'if nothing needs updating it will say so and record the review. If the change is trivial, run "node .claude/scripts/config-audit.mjs --stamp" after a clean audit.'
    );
    writeReviewState(root, { asked: fingerprint });
  }
}

if (reasons.length === 0) process.exit(0);

process.stdout.write(JSON.stringify({ decision: "block", reason: reasons.join(" ALSO: ") }));
