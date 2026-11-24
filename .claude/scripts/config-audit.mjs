#!/usr/bin/env node
// Deterministic auditor for the Claude Code configuration of this repo (CLAUDE.md, agents, skills, hooks, settings).
// It finds drift without a model: broken frontmatter, wrong file names, cited paths/scripts/symbols/agents that no
// longer exist, framework versions that disagree with package.json, duplicated instructions, and dependencies that
// moved since the last research pass. The `claude-config-maintainer` agent and the Stop hook both run it.
//
//   node .claude/scripts/config-audit.mjs              human report, exit 1 when there are errors
//   node .claude/scripts/config-audit.mjs --json       machine report
//   node .claude/scripts/config-audit.mjs --stamp      record that the current code change was reviewed
//   node .claude/scripts/config-audit.mjs --update-state [pkg ...]   record researched versions (only for packages you researched)
//
// Add `audit-ignore` anywhere on a line to exempt that line from the path, symbol and version checks.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STATE_FILE = ".claude/maintenance/state.json";
const REVIEW_FILE = ".claude/maintenance/.last-review.json";
const IGNORE_MARK = "audit-ignore";
const MAX_SKILL_LINES = 500;
const MAX_DESCRIPTION_CHARS = 1000;
const KNOWN_TOOLS = new Set([
  "Read",
  "Edit",
  "Write",
  "Grep",
  "Glob",
  "Bash",
  "WebSearch",
  "WebFetch",
  "NotebookEdit",
  "Agent",
  "Skill",
]);
const KNOWN_MODELS = new Set(["sonnet", "opus", "haiku", "fable", "inherit"]);
const PATH_ROOTS = "src|docs|\\.github|\\.claude|\\.storybook|\\.husky|playwright-tests|public";

const read = (root, file) => readFileSync(path.join(root, file), "utf8");
const exists = (root, file) => existsSync(path.join(root, file));
const readJson = (root, file, fallback) => {
  try {
    return JSON.parse(read(root, file));
  } catch {
    return fallback;
  }
};

const walk = (root, dir) => {
  const absolute = path.join(root, dir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(root, relative) : [relative];
  });
};

const git = (root, args) => {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return "";
  }
};

// ---------- change detection, shared with the Stop hook ----------

export const isDocFile = (file) => /^(docs\/|README\.md$|CONTRIBUTING\.md$|CHANGELOG\.md$)/.test(file);
export const isTestOrStory = (file) => /\.(test|stories)\.[jt]sx?$|\.snap$/.test(file);
export const isBehaviorFile = (file) =>
  /^(src\/|next\.config\.|package\.json$|Dockerfile$|example\.env\.local$|\.github\/)/.test(file) && !isTestOrStory(file);

export const changedFiles = (root = projectRoot) =>
  git(root, ["status", "--porcelain"])
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).split(" -> ").pop().replace(/^"|"$/g, ""));

export const behaviorFingerprint = (root = projectRoot) => {
  const tracked = git(root, [
    "diff",
    "HEAD",
    "--",
    "src",
    "next.config.ts",
    "package.json",
    "Dockerfile",
    "example.env.local",
    ".github",
  ]);
  const untracked = git(root, ["ls-files", "--others", "--exclude-standard"])
    .split("\n")
    .filter((file) => file && isBehaviorFile(file))
    .sort()
    .map((file) => {
      try {
        return `${file}:${createHash("sha256")
          .update(readFileSync(path.join(root, file)))
          .digest("hex")}`;
      } catch {
        return file;
      }
    });
  return createHash("sha256").update(tracked).update(untracked.join("\n")).digest("hex");
};

export const readReviewState = (root = projectRoot) => readJson(root, REVIEW_FILE, {});

export const writeReviewState = (root, patch) => {
  mkdirSync(path.join(root, path.dirname(REVIEW_FILE)), { recursive: true });
  writeFileSync(path.join(root, REVIEW_FILE), `${JSON.stringify({ ...readReviewState(root), ...patch }, null, 2)}\n`);
};

// ---------- parsing helpers ----------

const parseFrontmatter = (text) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!field) continue;
    fields[field[1]] = field[2].trim().replace(/^(["'])([\s\S]*)\1$/, "$2");
  }
  return fields;
};

const proseLines = (text) => {
  let inFence = false;
  return text.split(/\r?\n/).map((raw, index) => {
    if (/^\s*```/.test(raw)) inFence = !inFence;
    return { number: index + 1, raw, inFence };
  });
};

const normalizeWords = (line) =>
  line
    .toLowerCase()
    .replace(/[`*_>|#\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

const trigrams = (words) => {
  const set = new Set();
  for (let i = 0; i + 2 < words.length; i++) set.add(words.slice(i, i + 3).join(" "));
  return set;
};

const jaccard = (a, b) => {
  let shared = 0;
  for (const item of a) if (b.has(item)) shared++;
  return shared / (a.size + b.size - shared || 1);
};

const majorOf = (version) => Number.parseInt(String(version).replace(/^[^\d]*/, ""), 10);
const minorKey = (version) =>
  String(version)
    .replace(/^[^\d]*/, "")
    .split(".")
    .slice(0, 2)
    .join(".");

const installedVersion = (root, pkg) => {
  const installed = readJson(root, `node_modules/${pkg}/package.json`, null)?.version;
  if (installed) return installed;
  const manifest = readJson(root, "package.json", {});
  return { ...manifest.devDependencies, ...manifest.dependencies }[pkg]?.replace(/^[^\d]*/, "");
};

const VERSION_TOPICS = [
  { label: "Next.js", re: /\bNext(?:\.js)?\s+v?(\d+)\b/g, pkg: "next" },
  { label: "MUI", re: /\bMUI\s+v?(\d+)\b/g, pkg: "@mui/material" },
  { label: "React", re: /\bReact\s+v?(\d+)(?:\.\d+)?\b/g, pkg: "react" },
  { label: "Jest", re: /\bJest\s+v?(\d+)\b/g, pkg: "jest" },
  { label: "Storybook", re: /\bStorybook\s+v?(\d+)\b/g, pkg: "storybook" },
  { label: "TypeScript", re: /\bTypeScript\s+v?(\d+)(?:\.\d+)?\b/g, pkg: "typescript" },
  { label: "ESLint", re: /\bESLint\s+v?(\d+)\b/g, pkg: "eslint" },
  { label: "Redux Toolkit", re: /\bRedux Toolkit\s+v?(\d+)\b/g, pkg: "@reduxjs/toolkit" },
];

// ---------- the audit ----------

export const runAudit = (root = projectRoot) => {
  const findings = [];
  const add = (severity, check, file, line, message) => findings.push({ severity, check, file, line, message });

  const manifest = readJson(root, "package.json", {});
  const scripts = new Set(Object.keys(manifest.scripts ?? {}));
  const state = readJson(root, STATE_FILE, {});
  const knownExternal = new Set(state.allowedUnresolvedSymbols ?? []);

  const allClaudeFiles = walk(root, ".claude").filter((file) => !file.includes(`${path.sep}maintenance${path.sep}`));
  const agentFiles = allClaudeFiles.filter((file) => /^\.claude\/agents\/[^/]+\.md$/.test(file));
  const skillDirs = readdirSync(path.join(root, ".claude/skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const proseFiles = [
    ...(exists(root, "CLAUDE.md") ? ["CLAUDE.md"] : []),
    ...allClaudeFiles.filter((file) => file.endsWith(".md") || file.endsWith(".MD")),
  ];

  const agentNames = new Set();
  const skillNames = new Set();

  // 1. agents
  for (const file of agentFiles) {
    const meta = parseFrontmatter(read(root, file));
    const expected = path.basename(file, ".md");
    if (!meta) {
      add("error", "frontmatter", file, 1, "missing YAML frontmatter");
      continue;
    }
    agentNames.add(meta.name ?? expected);
    if (meta.name !== expected)
      add("error", "frontmatter", file, 1, `name "${meta.name}" must equal the file name "${expected}"`);
    if (!meta.description) add("error", "frontmatter", file, 1, "missing description");
    if (meta.description && meta.description.length > MAX_DESCRIPTION_CHARS) {
      add(
        "warn",
        "description-length",
        file,
        1,
        `description is ${meta.description.length} chars; keep it under ${MAX_DESCRIPTION_CHARS} (every description is loaded into each session, details belong in the body)`
      );
    }
    if (meta.model && !KNOWN_MODELS.has(meta.model) && !/^claude-/.test(meta.model)) {
      add("error", "frontmatter", file, 1, `unknown model "${meta.model}"`);
    }
    for (const tool of (meta.tools ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)) {
      if (!KNOWN_TOOLS.has(tool) && !tool.startsWith("mcp__")) add("error", "frontmatter", file, 1, `unknown tool "${tool}"`);
    }
  }

  // 2. skills
  for (const dir of skillDirs) {
    const entries = readdirSync(path.join(root, ".claude/skills", dir));
    const variants = entries.filter((name) => name.toLowerCase() === "skill.md");
    const rel = `.claude/skills/${dir}/SKILL.md`;
    if (variants.length === 0) {
      add("error", "skill-file", `.claude/skills/${dir}`, 1, "directory has no SKILL.md");
      continue;
    }
    if (!variants.includes("SKILL.md")) {
      add(
        "error",
        "skill-file",
        `.claude/skills/${dir}/${variants[0]}`,
        1,
        `file must be named exactly SKILL.md (found ${variants[0]}); it fails to load on case-sensitive file systems`
      );
      continue;
    }
    const text = read(root, rel);
    const meta = parseFrontmatter(text);
    if (!meta) {
      add("error", "frontmatter", rel, 1, "missing YAML frontmatter");
      continue;
    }
    skillNames.add(meta.name ?? dir);
    if (meta.name && meta.name !== dir)
      add("error", "frontmatter", rel, 1, `name "${meta.name}" must equal the directory "${dir}"`);
    if (!meta.description) add("error", "frontmatter", rel, 1, "missing description");
    const triggerText = `${meta.description ?? ""} ${meta["when_to_use"] ?? ""}`;
    if (triggerText.length > 1536)
      add(
        "warn",
        "description-length",
        rel,
        1,
        `description + when_to_use is ${triggerText.length} chars; the listing cuts it at 1536`
      );
    const lineCount = text.split("\n").length;
    if (lineCount > MAX_SKILL_LINES) {
      add(
        "warn",
        "skill-size",
        rel,
        1,
        `${lineCount} lines (limit ${MAX_SKILL_LINES}); move reference material to a sibling file loaded on demand`
      );
    }
    const bodyOutsideFences = proseLines(text)
      .filter((l) => !l.inFence)
      .map((l) => l.raw)
      .join("\n");
    if (/\bgit (commit|push)\b/.test(bodyOutsideFences) && meta["disable-model-invocation"] !== "true") {
      add(
        "warn",
        "side-effects",
        rel,
        1,
        "skill commits or pushes but does not set disable-model-invocation: true, so Claude may run it unprompted"
      );
    }
  }

  // 3. settings + hooks
  const settings = readJson(root, ".claude/settings.json", null);
  if (!settings) add("error", "settings", ".claude/settings.json", 1, "missing or invalid JSON");
  const settingsText = settings ? read(root, ".claude/settings.json") : "";
  for (const match of settingsText.matchAll(/\$CLAUDE_PROJECT_DIR\/([^"\s\\]+)/g)) {
    if (!exists(root, match[1]))
      add("error", "hook-script", ".claude/settings.json", 1, `hook script ${match[1]} does not exist`);
  }

  // 4. prose checks
  const corpus = [
    ...walk(root, "src"),
    ...walk(root, ".github"),
    ...walk(root, ".storybook"),
    ...walk(root, ".husky"),
    ...walk(root, "playwright-tests"),
    ...[
      "package.json",
      "next.config.ts",
      "Dockerfile",
      "example.env.local",
      "eslint.config.mjs",
      "jest.config.ts",
      "jest.setup.ts",
      "tsconfig.json",
      "sonar-project.properties",
      "commitlint.config.js",
      ".release-it.json",
      "docker-compose.yml",
      STATE_FILE,
      ".claude/scripts/config-audit.mjs",
    ],
  ]
    .filter((file) => exists(root, file) && statSync(path.join(root, file)).isFile())
    .map((file) => read(root, file))
    .join("\n");

  const nodeMajor = exists(root, ".nvmrc") ? majorOf(read(root, ".nvmrc")) : null;
  const longLines = [];

  for (const file of proseFiles) {
    const lines = proseLines(read(root, file));
    for (const { number, raw, inFence } of lines) {
      if (!inFence && raw.length > 100 && !/^\s*(#|\|[-: |]+\|?\s*$)/.test(raw)) {
        const words = normalizeWords(raw);
        if (words.length >= 18) longLines.push({ file, number, set: trigrams(words), text: raw.trim() });
      }
      if (raw.includes(IGNORE_MARK)) continue;

      for (const match of raw.matchAll(new RegExp(`(?<![\\w./@-])((?:${PATH_ROOTS})/[\\w@.\\[\\]\\-/*<>{},]*)`, "g"))) {
        const cited = match[1].replace(/[.,:;)]+$/, "").replace(/\/$/, "");
        if (/[<{]/.test(cited)) continue;
        const wildcard = cited.indexOf("*");
        const checkable = wildcard === -1 ? cited : cited.slice(0, wildcard).replace(/\/[^/]*$/, "");
        if (checkable && !exists(root, checkable))
          add("error", "missing-path", file, number, `cites ${cited}, which does not exist`);
      }

      for (const match of raw.matchAll(/\bnpm run ([\w:-]+)/g)) {
        if (!scripts.has(match[1]))
          add("error", "missing-script", file, number, `cites "npm run ${match[1]}", which is not in package.json scripts`);
      }

      for (const { label, re, pkg } of VERSION_TOPICS) {
        for (const match of raw.matchAll(re)) {
          const installed = installedVersion(root, pkg);
          if (installed && majorOf(match[1]) !== majorOf(installed)) {
            add("error", "stale-version", file, number, `says ${label} ${match[1]}, installed is ${installed}`);
          }
        }
      }
      for (const match of raw.matchAll(/\bNode(?:\.js)?\s+v?(\d+)\b/g)) {
        if (nodeMajor && majorOf(match[1]) !== nodeMajor)
          add("error", "stale-version", file, number, `says Node ${match[1]}, .nvmrc is ${nodeMajor}`);
      }

      for (const match of raw.matchAll(
        /`([a-z][a-z0-9-]+)`\s+(?:agent|skill|subagent)\b|\b(?:agent|skill)\s+`([a-z][a-z0-9-]+)`/gi
      )) {
        const name = match[1] ?? match[2];
        if (
          !agentNames.has(name) &&
          !skillNames.has(name) &&
          !/^(generate-jest-tests|update-config|simplify)$/.test(name) &&
          !isBuiltInName(name)
        ) {
          add(
            "error",
            "unknown-reference",
            file,
            number,
            `references agent/skill "${name}", which is not defined under .claude/`
          );
        }
      }

      if (/\b\d{2,}\+?\s+(?:test\s+)?(?:files|tests|components|endpoints)\b/i.test(raw) && !inFence) {
        add("warn", "volatile-fact", file, number, "hard-coded count goes stale; describe the rule instead of the number");
      }

      for (const match of raw.matchAll(/`([A-Za-z_$][\w$]*)(?:\(\))?`/g)) {
        const name = match[1];
        const camel = /[a-z]/.test(name) && /[A-Z]/.test(name.slice(1));
        const upperSnake = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/.test(name);
        if (name.length < 6 || !(camel || upperSnake) || knownExternal.has(name)) continue;
        if (!corpus.includes(name))
          add(
            "warn",
            "unknown-symbol",
            file,
            number,
            `\`${name}\` is not found in the repo; renamed, removed or external (external API or intentionally absent: add to allowedUnresolvedSymbols in .claude/maintenance/state.json)`
          );
      }
    }
  }

  // 5. every agent is part of the documented workflow
  const claudeMd = exists(root, "CLAUDE.md") ? read(root, "CLAUDE.md") : "";
  for (const name of agentNames) {
    if (!claudeMd.includes(name))
      add("warn", "unreferenced-agent", "CLAUDE.md", 1, `agent "${name}" exists but CLAUDE.md never mentions when to run it`);
  }

  // 6. duplicated instructions across files
  const pairs = [];
  for (let i = 0; i < longLines.length; i++) {
    for (let j = i + 1; j < longLines.length; j++) {
      if (longLines[i].file === longLines[j].file) continue;
      const score = jaccard(longLines[i].set, longLines[j].set);
      if (score >= 0.55) pairs.push({ score, a: longLines[i], b: longLines[j] });
    }
  }
  pairs.sort((x, y) => y.score - x.score);
  for (const { score, a, b } of pairs.slice(0, 12)) {
    add(
      "warn",
      "duplication",
      a.file,
      a.number,
      `~${Math.round(score * 100)}% similar to ${b.file}:${b.number}; keep one source of truth and link to it`
    );
  }

  // 7. dependency movement since the last research pass
  const tracked = state.tracked ?? [];
  const researched = state.researched ?? {};
  const research = [];
  for (const pkg of tracked) {
    const installed = installedVersion(root, pkg);
    if (!installed) continue;
    const before = researched[pkg]?.version;
    if (!before) research.push({ pkg, installed, reason: "never researched" });
    else if (minorKey(before) !== minorKey(installed))
      research.push({ pkg, installed, reason: `was ${before} when last researched` });
  }
  const staleAfterDays = state.staleAfterDays ?? 30;
  const ageDays = state.lastResearchAt ? (Date.now() - Date.parse(state.lastResearchAt)) / 86_400_000 : Number.POSITIVE_INFINITY;
  const researchDue = research.length > 0 || ageDays > staleAfterDays;

  const review = readReviewState(root);
  return {
    findings,
    research: { due: researchDue, ageDays: Number.isFinite(ageDays) ? Math.round(ageDays) : null, packages: research },
    inventory: { agents: [...agentNames].sort(), skills: [...skillNames].sort() },
    reviewPending: changedFiles(root).some(isBehaviorFile) && review.reviewed !== behaviorFingerprint(root),
  };
};

// Built-in Claude Code agent types that are legitimately referenced from the config.
function isBuiltInName(name) {
  return ["explore", "plan", "general-purpose", "claude-code-guide", "statusline-setup"].includes(name);
}

// ---------- CLI ----------

const out = (text) => process.stdout.write(`${text}\n`);

const printReport = (report) => {
  const bySeverity = (severity) => report.findings.filter((finding) => finding.severity === severity);
  for (const [severity, title] of [
    ["error", "ERRORS"],
    ["warn", "WARNINGS"],
  ]) {
    const items = bySeverity(severity);
    if (items.length === 0) continue;
    out(`\n${title} (${items.length})`);
    for (const item of items) out(`  ${item.file}:${item.line}  [${item.check}] ${item.message}`);
  }
  const { research } = report;
  out(
    `\nResearch: ${research.due ? "DUE" : "up to date"}${research.ageDays === null ? " (never run)" : ` (last pass ${research.ageDays}d ago)`}`
  );
  for (const item of research.packages) out(`  ${item.pkg}@${item.installed}: ${item.reason}`);
  out(`Inventory: ${report.inventory.agents.length} agents, ${report.inventory.skills.length} skills`);
  out(report.findings.some((f) => f.severity === "error") ? "\nResult: FAIL" : "\nResult: OK");
};

const main = () => {
  const args = new Set(process.argv.slice(2));
  const root = projectRoot;

  if (args.has("--stamp")) {
    writeReviewState(root, { reviewed: behaviorFingerprint(root), reviewedAt: new Date().toISOString() });
    process.stdout.write("Recorded: the current code change has been reviewed for Claude config impact.\n");
    return;
  }

  if (args.has("--update-state")) {
    const state = readJson(root, STATE_FILE, {});
    const researched = { ...state.researched };
    const today = new Date().toISOString().slice(0, 10);
    const named = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
    for (const pkg of named.length > 0 ? named : (state.tracked ?? [])) {
      const version = installedVersion(root, pkg);
      if (version) researched[pkg] = { version, checkedAt: today };
    }
    writeFileSync(
      path.join(root, STATE_FILE),
      `${JSON.stringify({ ...state, researched, lastResearchAt: new Date().toISOString() }, null, 2)}\n`
    );
    process.stdout.write("Recorded researched versions.\n");
    return;
  }

  const report = runAudit(root);
  if (args.has("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else printReport(report);
  process.exitCode = report.findings.some((finding) => finding.severity === "error") ? 1 : 0;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
