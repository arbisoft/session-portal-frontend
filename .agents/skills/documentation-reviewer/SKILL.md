---
name: documentation-reviewer
description: Perform a comprehensive review of project documentation and automatically fix gaps by generating missing or incomplete documentation files (README, API docs, architecture docs, onboarding guides, and operational documentation). Produces complete Markdown content ready to commit.
user-invocable: true
---

# Documentation Reviewer & Generator

This skill performs a **staff-level documentation audit and auto-repair** of project documentation.

It does two things:

1️⃣ **Review documentation quality**  
2️⃣ **Generate or repair missing documentation**

All generated output is **complete Markdown content ready for `.md` files**.

---

# Objectives

Ensure documentation is:

• clear  
• complete  
• technically accurate  
• consistent with repository code  
• helpful for developers and operators  

The skill ensures a project has sufficient documentation for:

- developers
- contributors
- operators
- API consumers

---

# Review + Repair Workflow

## Step 1 — Identify Documentation Files

Detect documentation files in the repository.

Typical locations:

README.md  
CONTRIBUTING.md  
CHANGELOG.md  

docs/  
docs/api/  
docs/setup/  
docs/architecture/  
docs/deployment/  

Run:

```bash
git ls-files | grep -E "README|docs|architecture|api|deployment|contributing"
````

If reviewing a PR:

```bash
git diff --name-only HEAD
```

Focus only on **documentation-related files**.

---

# Step 2 — Inspect Source-of-Truth Files

Documentation must match the implementation.

Check repository files such as:

package.json
requirements.txt
Dockerfile
docker-compose.yml
.env.example
example.env.local

Source directories:

src/
app/
routes/
api/
services/

These files determine **real project behavior**.

---

# Step 3 — Identify Project Context

Determine:

• What the project does
• Intended users of documentation
• Technology stack
• Deployment environment

Classify the project:

* web application
* backend API
* microservice
* open-source library
* internal tooling
* CLI tool

Produce a short **project understanding summary**.

---

# Step 4 — Documentation Coverage Audit

Verify documentation exists for the following areas.

### Core Documentation

README
Setup guide
Development workflow
Architecture overview

### Engineering Documentation

Project structure
Environment configuration
Dependency management

### API Documentation

REST endpoints
GraphQL schema
Authentication flow
Request/response examples

### Operational Documentation

Deployment instructions
Environment configuration
Monitoring and logging
Failure recovery

### Contribution Documentation

Branch strategy
Commit conventions
Code review workflow

---

# Step 5 — Detect Documentation Gaps

Identify:

• missing documentation files
• incomplete sections
• outdated instructions
• undocumented environment variables
• undocumented scripts
• undocumented API endpoints

Example gaps:

Missing:

docs/api.md
docs/architecture.md
docs/setup.md

Incomplete:

README missing installation steps

---

# Step 6 — Fix Documentation Gaps

If gaps exist, **automatically generate missing documentation**.

The skill must generate **complete `.md` files**.

Example generated files:

README.md
docs/setup.md
docs/architecture.md
docs/api.md
docs/deployment.md
docs/contributing.md

All files must contain **production-quality markdown**.

---

# Step 7 — README Quality Review

Ensure README contains:

Project Overview
Features
Tech Stack
Installation
Configuration
Usage
Scripts
Architecture
API
Deployment
Contributing
Troubleshooting

If missing sections exist, **generate them**.

---

# Step 8 — Architecture Documentation Generation

If missing or weak, generate architecture documentation.

Include:

System overview
Service components
Folder structure explanation
Data flow overview
External integrations

Example structure:

```
# Architecture

## System Overview

## Components

## Data Flow

## Folder Structure

## External Integrations
```

Use repository structure to infer architecture.

---

# Step 9 — API Documentation Generation

If APIs exist, generate API documentation.

Include:

Endpoint descriptions
Authentication method
Request parameters
Response examples
Error responses

Example format:

```
# API Documentation

## GET /users

### Description
Returns list of users.

### Response

200 OK
{
  "id": "123",
  "name": "Alice"
}
```

---

# Step 10 — Developer Onboarding Documentation

Ensure developers can start quickly.

Include:

Prerequisites
Dependency installation
Environment variables
Database setup
Running development server

Example:

```
# Setup Guide

## Prerequisites

Node 18+
Docker

## Installation

npm install

## Run Development Server

npm run dev
```

---

# Step 11 — Operational Documentation

Ensure production readiness documentation exists.

Include:

Deployment steps
Environment configuration
Monitoring
Logging
Rollback instructions

Example:

```
# Deployment

## Build

docker build -t app .

## Run

docker-compose up
```

---

# Step 12 — Docs-to-Code Consistency Check

Ensure documentation matches repository behavior.

Verify:

• commands match package.json scripts
• environment variables exist in code
• API examples match routes
• setup instructions match project structure

If mismatch found → update documentation.

---

# Step 13 — Documentation Maintainability

Ensure documentation structure is scalable.

Recommended structure:

```
docs/

architecture.md
api.md
setup.md
deployment.md
contributing.md
```

Avoid large monolithic docs.

---

# Step 14 — Generate Final Output

Produce two outputs:

## 1️⃣ Documentation Review Report

Explain:

• documentation coverage
• gaps detected
• outdated docs
• improvements made

---

## 2️⃣ Generated Documentation Files

Provide **full markdown content** for each file.

Example output:

```
File: docs/setup.md

# Setup Guide

## Prerequisites
Node.js 18+
Docker

## Installation

npm install
```

---

# Documentation Quality Score

| Category   | Rating                            |
| ---------- | --------------------------------- |
| Coverage   | 🟢 Good / 🟡 Needs Work / 🔴 Poor |
| Clarity    | 🟢 Good / 🟡 Needs Work / 🔴 Poor |
| Structure  | 🟢 Good / 🟡 Needs Work / 🔴 Poor |
| Accuracy   | 🟢 Good / 🟡 Needs Work / 🔴 Poor |
| Onboarding | 🟢 Good / 🟡 Needs Work / 🔴 Poor |
| Operations | 🟢 Good / 🟡 Needs Work / 🔴 Poor |

---

# Top Documentation Improvements

List the most impactful improvements.

Example:

1 Add architecture documentation
2 Document environment variables
3 Add API examples
4 Improve onboarding steps
5 Add deployment guide

---

# Tone Guidelines

Documentation must be:

• clear
• concise
• developer-friendly
• technically accurate

Focus on **developer productivity and onboarding speed**.

Avoid speculation when repository evidence is missing.

Generate documentation based only on **verified repository behavior**.

```

---

# Key Improvements in This Refined Skill

| Feature | Old Skill | New Skill |
|---|---|---|
Documentation review | ✓ | ✓ |
Coverage audit | ✓ | ✓ |
Architecture docs review | ✓ | ✓ |
API docs review | ✓ | ✓ |
Detect documentation gaps | ✗ | ✓ |
Generate missing docs | ✗ | ✓ |
Rewrite incomplete docs | ✗ | ✓ |
Produce `.md` file content | ✗ | ✓ |
Docs-to-code validation | ✓ | ✓ |
Onboarding documentation generation | ✗ | ✓ |
Deployment docs generation | ✗ | ✓ |

---
