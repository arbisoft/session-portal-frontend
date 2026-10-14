#!/usr/bin/env node
// Stop hook: when source/config files changed but no documentation did, ask the agent to run the
// documentation pipeline once. Skills cannot be invoked from a hook, so this blocks the stop with a reason.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const readStdin = () => {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
};

const input = readStdin();
if (input.stop_hook_active) process.exit(0);

let porcelain = "";
try {
  porcelain = execFileSync("git", ["status", "--porcelain"], {
    cwd: process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd(),
    encoding: "utf8",
  });
} catch {
  process.exit(0);
}

const changedFiles = porcelain
  .split("\n")
  .filter(Boolean)
  .map((line) => line.slice(3).split(" -> ").pop().replace(/^"|"$/g, ""));

const isDocFile = (file) => /^(docs\/|README\.md$|CONTRIBUTING\.md$|CHANGELOG\.md$)/.test(file);
const isTestOrStory = (file) => /\.(test|stories)\.[jt]sx?$|\.snap$/.test(file);
const isBehaviorFile = (file) =>
  /^(src\/|next\.config\.|package\.json$|Dockerfile$|example\.env\.local$|\.github\/)/.test(file) && !isTestOrStory(file);

const behaviorChanges = changedFiles.filter(isBehaviorFile);
const docsChanged = changedFiles.some(isDocFile);

if (behaviorChanges.length === 0 || docsChanged) process.exit(0);

const preview = behaviorChanges.slice(0, 8).join(", ");
const more = behaviorChanges.length > 8 ? ` and ${behaviorChanges.length - 8} more` : "";

process.stdout.write(
  JSON.stringify({
    decision: "block",
    reason:
      `Code or configuration changed (${preview}${more}) but no documentation did. Run the documentation pipeline now, in order: ` +
      "update-project-docs, then documentation-generator, then documentation-reviewer. " +
      'If the docs already match the code, say "Documentation is already synchronized" and finish.',
  })
);
