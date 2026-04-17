---
name: commit-and-PR-generator
description: 'Automatically generates semantic commit messages and a structured Pull Request description by analyzing git staged changes, branch names, and modified files.'
argument-hint: 'Provide a brief description of the changes you made, or simply ask to generate a commit message and PR description based on your staged changes.'
user-invocable: true
---

# Advanced Commit and PR Generator

## Purpose

This skill analyzes git staged changes and generates:

1. High-quality **semantic commit messages**
2. A **fully formatted Pull Request description**
3. Intelligent **change summaries**
4. **Reviewer guidance**

The generated output follows **Conventional Commits** and the project's **PR template**.

---

# Trigger

Activate this skill when the user says:

- generate commit
- generate commit message
- write commit message
- summarize my changes
- generate PR
- create PR description
- prepare pull request
- summarize git diff

---

# Step 1 — Get Branch Name

Retrieve the current branch:

```bash
git rev-parse --abbrev-ref HEAD
````

Example branch names:

```
feature/APS-231-add-collaborator-wishlist
bugfix/APS-412-fix-price-filter
APS-221-update-plp
chore/update-dependencies
```

---

# Step 2 — Extract Ticket Number

Extract ticket ID using regex:

```
[A-Z]+-[0-9]+
```

Examples:

```
APS-231
FE-102
BUG-91
```

If found, prepend ticket ID to the commit message.

Example:

```
APS-231 feat(wishlist): implement collaborator wishlist page
```

If not found, omit it.

---

# Step 3 — Retrieve Git Changes

Get staged changes:

```bash
git diff --staged
```

If no staged files exist:

```bash
git diff
```

Also retrieve changed file list:

```bash
git diff --name-only --staged
```

---

# Step 4 — Detect Change Scope

Infer scope from modified file paths.

Examples:

| Path              | Scope      |
| ----------------- | ---------- |
| components/       | ui         |
| pages/            | page       |
| features/wishlist | wishlist   |
| api/              | api        |
| graphql/          | graphql    |
| hooks/            | hooks      |
| utils/            | utils      |
| filters/          | filters    |
| navigation/       | navigation |
| auth/             | auth       |

Example commit scope:

```
feat(wishlist)
fix(filters)
refactor(api)
```

---

# Step 5 — Classify Change Type

Determine commit type based on diff patterns.

| Type     | Condition                |
| -------- | ------------------------ |
| feat     | new functionality        |
| fix      | bug fix                  |
| refactor | internal restructuring   |
| perf     | performance improvements |
| style    | formatting only          |
| docs     | documentation            |
| test     | tests added              |
| chore    | dependencies/config      |
| build    | build system changes     |
| ci       | CI/CD updates            |

---

# Step 6 — Analyze Code Changes

Analyze the diff and detect:

### Structural Changes

* new components
* new functions
* deleted code
* moved files

### Behavior Changes

* validation updates
* API integration
* UI changes
* state management updates
* bug fixes

### Code Improvements

Detect:

* performance optimizations
* accessibility improvements
* error handling
* edge case handling

---

# Step 7 — Generate Commit Message

Format:

```
[TICKET] type(scope): short description
```

Examples:

```
APS-442 fix(filters): prevent infinite loading on large numeric values

APS-231 feat(wishlist): display collaborator wishlists

refactor(api): simplify wishlist query handling
```

Rules:

* Imperative tone
* < 72 characters
* Specific but concise
* Avoid generic words like "update stuff"

---

# Step 8 — Generate Commit Body (Optional)

Include details when multiple changes exist.

Example:

```
APS-442 fix(filters): prevent infinite loading on large numeric values

- Added validation for numeric filter inputs
- Prevent API calls with invalid values
- Introduced debounce to filter input
```

---

# Step 9 — Generate Pull Request Description

Use the project template.

```
### 🚀 Description
Provide a concise description of the changes introduced in this PR.

#### 📌 Summary
Explain what this PR accomplishes in a few sentences.

#### 🔧 Changes Implemented
- ✅ Describe key changes made in this PR.
- ✅ List major improvements or fixes.
- ✅ Mention any refactors or optimizations.

#### 🛠️ How It Works?
1. Explain the workflow of the implemented changes.
2. Provide details on how it behaves in different scenarios.
3. Mention any edge cases handled.

#### ✅ Checklist Before Merging
- [ ] Tested all relevant functionalities.
- [ ] Verified expected behavior on different use cases.
- [ ] Ensured code follows best practices and security standards.

#### 📸 Screenshots (if applicable)
(Add screenshots, videos, or GIFs if necessary.)

#### 🔗 Related Issues
Link to the associated Taiga ticket

https://projects.arbisoft.com/project/arbisoft-sessions-portal-20/us/XXX

#### 📢 Notes for Reviewers
Mention anything important for reviewers to check or be aware of.
```

---

# Step 10 — Generate Reviewer Notes

If detected:

### Performance changes

Mention benchmarking.

### UI changes

Ask reviewer to verify responsiveness.

### API changes

Mention schema updates.

### Security changes

Mention validation improvements.

---

# Output Format

Return the response as:

```
Commit Message
--------------

<generated commit message>

Alternative Commit Messages
---------------------------

1.
2.
3.

Pull Request Description
------------------------

<generated PR description>
```

---

# Example

### Input

Diff contains:

```
- fixed infinite loading in PLP filters
- added debounce
- validation for price input
```

Branch:

```
bugfix/APS-442-fix-price-filter
```

---

### Output

Commit Message

```
APS-442 fix(filters): prevent infinite loading in PLP price filter
```

Alternative Commit Messages

```
APS-442 fix(filters): validate price input and debounce filter requests
APS-442 fix(plp): resolve infinite loading when entering large numbers
```

Pull Request Description

```
### 🚀 Description
Fix issues in PLP filters causing infinite loading and invalid price inputs.

#### 📌 Summary
This PR improves the reliability of PLP filters by validating numeric inputs and preventing unnecessary API calls.

#### 🔧 Changes Implemented
- ✅ Added validation for price filter inputs
- ✅ Prevented infinite loading when large numbers are entered
- ✅ Implemented debounce for filter input changes

#### 🛠️ How It Works?
1. Price inputs are validated before triggering filter queries.
2. Debounced input reduces excessive API calls.
3. Invalid numeric values are rejected gracefully.
```

---

# Best Practices

The skill must:

* Prioritize **clarity**
* Avoid **guessing functionality**
* Ignore **whitespace-only changes**
* Ignore **lock file changes**
* Summarize **functional behavior**, not code lines

---

# Optional Enhancements (Agent Behavior)

If the AI environment supports it:

Run automatically:

```
git status
git diff --staged
git diff --name-only --staged
git rev-parse --abbrev-ref HEAD
```

---
