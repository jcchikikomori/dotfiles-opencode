# Agent Architecture

How opencode (v2) handles requests in this setup: the `oh-my-opencode-slim` orchestrator harness, its specialist agents, the MCP servers, skills, and plugins.

## Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                          USER REQUEST                           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                oh-my-opencode-slim ORCHESTRATOR                 │
│  Plans work graph → dispatches background tasks → reconciles    │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌──────────┬──────────┬───┴──────┬──────────┬──────────┐
        ▼          ▼          ▼          ▼          ▼          ▼
     oracle     explorer   librarian  designer    fixer     observer
```

The Orchestrator is the only primary agent (`setDefaultAgent: true`). The built-in `explore` and `general` agents are disabled (`agents.<name>.disabled: true` in `templates/opencode.jsonc`) in favour of the specialists below. The main session plans, dispatches, and reconciles; the specialists return compressed, structured results and stay inside their delegated scope.

## Agent Roster

Models come from the active `opencode-go` preset in `.config/opencode/oh-my-opencode-slim.json` (tracked and stowed — authoritative over the installer):

| Agent | Model | Variant | Role |
|-------|-------|---------|------|
| `orchestrator` | `opencode-go/minimax-m3` | `thinking` | Plans and delegates work |
| `oracle` | `opencode-go/qwen3.8-max` | `max` | Architecture, persistent problems, review escalation |
| `explorer` | `opencode-go/deepseek-v4.1-flash` | `high` | Fast codebase reconnaissance |
| `librarian` | `opencode-go/deepseek-v4.1-flash` | `high` | External docs and library research |
| `designer` | `opencode-go/kimi-k2.7-code` | — | UI/UX design and implementation |
| `fixer` | `opencode-go/deepseek-v4.1-flash` | `high` | Bounded, well-defined implementation |
| `observer` | `opencode-go/mimo-v2.5` | — | Image/visual file analysis |

The file also defines an `openai` preset (`openai/gpt-5.6-*`). Those ids could not be verified on the author's machine (the `openai` provider is not authenticated), so they are not listed above as available. Switch presets at runtime with `/preset`.

Other harness settings in the same file: `multiplexer` (`type: auto`, `layout: main-vertical`, `main_pane_size: 60`), `backgroundJobs.orchestratorWake` (enabled, 300000 ms interval), and `companion.enabled: false`.

## Delegation Policy

The delegation rules are tracked in this repo:

- `.config/opencode/oh-my-opencode-slim/orchestrator_append.md` — routing threshold, specialist lanes, background-task discipline, design handoff, verification gate
- `.config/opencode/AGENTS.md` — global session instructions, including the **Orchestrator Harness (Mandatory)** section

Short version: handle work directly only when it is one isolated, low-risk action; UI/UX work always goes to `@designer`; multi-step implementation, broad discovery, research, and complex debugging go to the matching specialist; independent lanes are dispatched in parallel in the background.

## MCP Servers

Defined under `mcp.servers` in `templates/opencode.jsonc` (11 servers). A server is enabled by omitting `disabled`.

| MCP | Default | Type |
|-----|---------|------|
| `context7` | enabled | remote |
| `github-mcp` | enabled | remote (needs `GITHUB_PERSONAL_ACCESS_TOKEN`) |
| `web-forager` | enabled | local |
| `camoufox` | enabled | local |
| `rea` | enabled | local |
| `buildkite-mcp` | disabled | remote |
| `stackoverflow-mcp` | disabled | local |
| `framelink-figma` | disabled | local |
| `chrome-devtools` | disabled | local |
| `atlassian-mcp` | disabled | local |
| `sonarqube-mcp` | disabled | local (Docker) |

`.config/opencode/mcps.json` is a documentation registry consumed by `devtools-opencode`; opencode itself does not read it.

## Skills

Skills live in a nested git submodule at `.config/opencode/skills/` (`https://github.com/jcchikikomori/skills-md`). Initialise it with `git submodule update --init --recursive`; the contents are owned by that repository, not this one, so this page does not enumerate them. Skills load via the `skill` tool, or by typing `/skill-name`. The AGENTS.md rules describe when each should be loaded.

The omo-slim installer also installs a small set of bundled skills (`simplify`, `codemap`, `clonedeps`, `deepwork`, `verification-planning`, `reflect`, `worktrees`, `oh-my-opencode-slim`).

## Workflow Subagents

Structured-phase subagents (PRD creation, technical design, code review, security review, and so on) are loaded from the live `~/.config/opencode/agents/` directory. That directory is gitignored — they are not committed here.

## Plugins

Declared in the `plugins` array of `templates/opencode.jsonc`:

| Plugin | Purpose |
|--------|---------|
| `oh-my-opencode-slim` | Orchestrator harness, specialist agents, background tasks, tmux multiplexer |
| `envsitter-guard@latest` | Prevents accidental exposure of secrets in `.env` files |
| `opencode-mem` | Persistent session memory |
| `opencode-redactor@0.1.1` | Redacts sensitive data from outputs |
| `@franlol/opencode-md-table-formatter@latest` | Auto-formats markdown tables |

Local plugin files in `.config/opencode/plugins/`:

| File | Purpose |
|------|---------|
| `quality.ts` | Runs `prettier --write` after file edits, warns if tests fail |

The live `~/.config/opencode/plugins/` directory on the author's machine holds four more files that are **not tracked in this repo**: `opencode-claude-attribution.ts`, `opencode-commit-guard.ts`, `opencode-memory-guard.ts`, `opencode-wandavision.ts`. The old `git-commit-guard.ts` was retired; the `permissions` array in the template denies `git commit`, `git push`, and `git reset --hard`.

`cli.json` (v2 replacement for `tui.json`) loads `oh-my-opencode-slim` for the TUI badge.
