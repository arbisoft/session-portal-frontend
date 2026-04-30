---
name: code-review-generator
description: 'Review current file changes and staged diffs. Use when asked to code review changes, review git diff, summarize risks, find issues, generate reviewer notes, or assess correctness, security, performance, maintainability, tests, and documentation consistency.'
argument-hint: 'Describe the review target, such as staged changes, current branch diff, or specific files'
user-invocable: true
---

# Code Review Generator

## Purpose

This skill reviews current repository changes and produces a structured review focused on correctness, security, performance, maintainability, tests, and documentation consistency.

Use it when the user says things like:
- "code review these changes"
- "review current files changes"
- "review my diff"
- "summarize review findings"
- "check staged changes before PR"
- "review for bugs, performance, and tests"

## Expected Output

Return a concise review with:

1. Overall assessment
2. Findings grouped by severity (`high`, `medium`, `low`)
3. Missing tests or validation gaps
4. Documentation or reviewer notes
5. Clear statement when no issues are found

## Workflow

### Step 1: Identify review scope

Determine whether the user wants review of:
- staged changes
- unstaged changes
- current branch against a base branch
- specific files

If the user does not specify a scope, prefer staged changes first.

### Step 2: Collect git context

Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git diff --staged --name-only
git diff --staged
```

If no staged diff exists, fall back to:

```bash
git diff --name-only
git diff
```

If the user asks for a branch review, also inspect the relevant branch diff.

### Step 3: Understand the change intent

Before judging quality, infer:
- what behavior changed
- whether the change is docs-only, tests-only, config-only, or product logic
- whether multiple unrelated changes are mixed together
- which areas are likely risky based on file paths

Use file paths to infer likely concerns. Examples:
- `src/app`, `src/features`, `src/components` -> UI and behavior
- `src/redux`, `src/hooks`, `src/services` -> state, data flow, side effects
- `src/utils` -> shared logic risk
- `docs`, `README`, `CONTRIBUTING` -> documentation consistency
- config files, Docker, CI -> build and delivery risk

### Step 4: Review by category

Check the diff for the following.

#### Correctness
- broken logic or incomplete flows
- incorrect condition handling
- edge cases ignored
- stale assumptions in docs or comments
- mismatches between code and configuration

#### Security
- unsafe environment variable handling
- accidental secret exposure
- missing validation or authorization checks
- unsafe redirects, HTML injection points, or token handling

#### Performance
- unnecessary rerenders or repeated requests
- expensive operations in render paths
- missing pagination, memoization, or throttling where needed
- oversized or redundant data fetching

#### Maintainability
- duplicated logic
- naming that obscures intent
- coupling between unrelated concerns
- partial implementation that leaves docs or config inconsistent
- mixed unrelated changes that should be split

#### Tests / coverage
- changed behavior without test updates
- missing unit or integration coverage for risky logic
- documentation-only changes that should still be spot-checked for accuracy

#### Documentation consistency
- README or docs mismatch with code
- examples no longer matching actual setup
- new environment variables, routes, or workflows missing from docs

### Step 5: Classify findings

For each issue, include:
- severity: `high`, `medium`, or `low`
- affected area
- why it matters
- concise recommendation

Severity guidance:
- `high`: likely bug, security issue, broken flow, or misleading release risk
- `medium`: maintainability concern, missing validation, likely test gap, or partial inconsistency
- `low`: clarity, wording, minor cleanup, or optional improvement

If there are no meaningful issues, say so explicitly and mention any residual risks or unverified assumptions.

### Step 6: Provide reviewer guidance

End with:
- what to verify manually
- what tests are missing or should be run
- whether the change is safe to merge as-is
- whether the diff should be split if it mixes unrelated work

## Output Format

Use this structure:

```text
Overall Assessment
------------------
<short summary>

Findings
--------
[severity] area: finding
Why: <impact>
Recommendation: <action>

Testing Notes
-------------
<missing tests, validation steps, or "No additional test gaps identified.">

Reviewer Guidance
-----------------
<what reviewers should verify>
```

If no issues are found, use:

```text
Findings
--------
No significant issues found in the reviewed changes.
```

## Review Rules

- Focus on behavior and risk, not formatting noise
- Ignore lockfile-only or generated-file noise unless it introduces risk
- Do not invent issues that are unsupported by the diff
- Prefer actionable findings over exhaustive commentary
- Call out uncertainty when a conclusion depends on files not reviewed
- If multiple unrelated changes are staged together, recommend splitting them
