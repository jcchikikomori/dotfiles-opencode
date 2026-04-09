# Agent Architecture

How opencode handles requests using skills and the built-in default agent.

## Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                          USER REQUEST                           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPENCODE DEFAULT AGENT                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 1. Detect project type (files, git, imports)              │  │
│  │ 2. Load relevant skill(s) via AGENTS.md routing rules     │  │
│  │ 3. Answer directly or delegate to skill context           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
          ┌─────────────────┐          ┌──────────────────┐
          │ SKILLS (34)     │          │  DIRECT ANSWER   │
          │ Loaded via      │          │  (simple info)   │
          │ skill(name="…") │          └──────────────────┘
          └─────────────────┘
```

## Skill Routing

Skill loading is instruction-driven via `AGENTS.md`. The agent detects project type and auto-loads skills.

### By Technology

| Project Type | Skills Loaded |
|--------------|---------------|
| Ruby on Rails | `ruby`, `ruby-on-rails` |
| Node.js (React) | `nodejs`, `reactjs` |
| Node.js (Vue) | `nodejs`, `vuejs` |
| Node.js (Angular) | `nodejs`, `angularjs` |
| Python (FastAPI) | `python`, `fastapi` |
| Java (Spring) | `java`, `spring-boot` |
| Java (Grails) | `java`, `grails` |
| PHP | `php` |
| Android | `android` |
| Any + Security | `owasp` (always first) |
| Any + Database | relevant SQL skill (always first) |

### By Task Type

| Task | Skill |
|------|-------|
| Git operations | `git` |
| Docker / Kubernetes | `docker` or `kubernetes` |
| Debugging | `debug` |
| MCP configuration | `mcp` |
| Component docs | `component-doc` |
| Project onboarding | `project-onboarding` |
| Rails migrations | `rails-migration` |
| Python validation | `pydantic` |
| SQLAlchemy ORM | `sqlalchemy` |

## Available Skills (34)

| Category | Skills |
|----------|--------|
| Web/Frontend | `frontend`, `reactjs`, `vuejs`, `angularjs`, `component-doc`, `web-audit` |
| Backend | `backend`, `nodejs`, `python`, `ruby`, `ruby-on-rails`, `java`, `php`, `spring-boot`, `grails` |
| Databases | `postgresql`, `mysql-mariadb`, `oracle-sql`, `sqlalchemy` |
| Frameworks | `fastapi`, `fullstack`, `project-onboarding`, `pydantic` |
| DevOps | `docker`, `kubernetes` |
| Mobile | `android` |
| Security | `owasp`, `debug` |
| Tools | `git`, `mcp` |
| Reference | `shared-templates`, `rails-migration` |

## Invoking Skills

Skills can be loaded two ways:

1. **Automatic** — AGENTS.md rules trigger `skill(name="…")` based on project type and task
2. **Manual** — User types `/skill-name` (e.g., `/git`, `/docker`, `/debug`)

## Model Configuration

All model selection is environment-driven. No hardcoded models.

```jsonc
// ~/.config/opencode/opencode.jsonc
{
  "model": "{env:OPENCODE_MODEL}",
  "small_model": "{env:OPENCODE_SMALL_MODEL}"
}
```

```bash
# ~/.config/opencode/.env
OPENCODE_MODEL=amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0
OPENCODE_SMALL_MODEL=amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0
AWS_REGION=ap-southeast-2
AWS_PROFILE=your-profile
```

## Active Plugins

| Plugin | Purpose |
|--------|---------|
| `envsitter-guard` | Blocks access to `.env` and credential files |
| `opencode-mem` | Persistent session memory |
| `opencode-redactor` | Strips sensitive data from logs |
| `@franlol/opencode-md-table-formatter` | Auto-formats markdown tables |
| `plugins/git-commit-guard.ts` | Blocks `git commit` (GPG TTY constraint) |
| `plugins/quality.ts` | Runs prettier after file edits |
