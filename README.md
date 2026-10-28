# Opencode Configuration

> **Part of [jcchikikomori/.dotfiles](https://github.com/jcchikikomori/.dotfiles)** — A standalone package containing [opencode](https://opencode.ai) configuration files that are stowed to `~/.config/opencode/`. The config targets **opencode v2** (v2.2.0 at the time of writing).

[![License: AI-Restricted MIT](https://img.shields.io/badge/License-AI--Restricted%20MIT-yellow.svg)](LICENSE)
[![dotfiles](https://img.shields.io/badge/dotfiles-jcchikikomori-blue.svg)](https://github.com/jcchikikomori/.dotfiles)

---

## What This Is

A [GNU Stow](https://www.gnu.org/software/stow/)-managed dotfiles package for OpenCode, the terminal AI coding assistant. It configures:

- **[oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)** — the sole primary agent (Orchestrator) plus 6 capability-specialised agents (Oracle, Explorer, Librarian, Designer, Fixer, Observer) that it routes to. The agent model mappings, prompt append, and orchestration policy are **tracked in this submodule** so a fresh machine seeds the same harness.
- **Workflow subagents** (PRD creation, technical design, code review, security review, etc.) loaded from the live `~/.config/opencode/agents/` directory — not committed here
- **Skills** loaded from a nested submodule under `.config/opencode/skills/` — pulled in by `git submodule update --init --recursive`
- **11 MCP servers** for library docs (context7), GitHub integration, browser automation (camoufox), web research (web-forager), reverse engineering (rea), and more
- **Tmux multiplexer integration** for live subagent visibility
- **Background orchestration** via `OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS` and the omo-slim `backgroundJobs.orchestratorWake` policy

---

## Table of Contents

    - [Files](#files)
    - [Agent Architecture](#agent-architecture)
    - [Orchestrator Harness](#orchestrator-harness)
    - [Setup](#setup)
    - [Plugins](#plugins)
    - [MCP Servers](#mcp-servers)
- [Model Configuration](#model-configuration)
- [Environment Loading](#environment-loading)
- [Per-Project Configuration](#per-project-configuration)
- [Tmux Multiplexer](#tmux-multiplexer)
- [Security](#security)
- [License](#license)

---

## Files

| File | Purpose |
|------|---------|
| `templates/opencode.jsonc` | **Template** for main config (v2 schema), copied to `~/.config/opencode/` on install — but only if the target file does not already exist, so an existing v1 config is never auto-upgraded (see [v2 Config Keys](#v2-config-keys)). Includes the `agents` block that sets `disabled: true` on the built-in `explore`/`general` primaries. |
| `.config/opencode/AGENTS.md` | Global agent instructions loaded into every session. Includes the **Orchestrator Harness (Mandatory)** section that names this submodule's tracked config as authoritative. |
| `.config/opencode/oh-my-opencode-slim.json` | **Tracked, stowed** omo-slim config — agent model mappings, `setDefaultAgent`, `backgroundJobs.orchestratorWake`, multiplexer, companion. Authoritative over the installer. |
| `.config/opencode/oh-my-opencode-slim/orchestrator_append.md` | **Tracked prompt append** for the Orchestrator — routing threshold, specialist lanes, background-task discipline, design handoff, verification gate. |
| `.config/opencode/cli.json` | v2 CLI/TUI config — theme and `oh-my-opencode-slim` plugin badge (replaces the v1 `tui.json`) |
| `.config/opencode/opencode-mem.jsonc` | Configuration for the `opencode-mem` plugin — **inert**, the plugin is not enabled (see [Plugins](#plugins)) |
| `.config/opencode/mcps.json` | Reference MCP server registry (documentation, not loaded by opencode directly) |
| `.stow-local-ignore` | Excludes repo-own tooling from stow symlinks |

### Directory Structure

```text
.config/opencode/
├── AGENTS.md                # Global agent instructions (stowed, tracked)
├── cli.json                 # v2 CLI/TUI theme + oh-my-opencode-slim badge
├── opencode.jsonc           # Main config (generated from template, not stowed)
├── oh-my-opencode-slim.json # Agent model config (stowed, tracked — authoritative)
├── oh-my-opencode-slim/     # Tracked prompt appends per agent
│   └── orchestrator_append.md
├── opencode-mem.jsonc       # Memory plugin config (inert — plugin not enabled)
├── mcps.json                # MCP server reference registry (documentation only)
├── agents/                  # Workflow subagents (live-only, not committed)
├── skills/                  # Git submodule → bundled skills (init required)
├── plugins/                 # Auto-scanned by opencode — currently empty
├── plugins.disabled/        # Parked v1-era plugins (outside the scan path)
│   └── quality.ts
├── memory_data/             # Memory storage (live-only)
├── bun.lock
└── package.json             # Pins @opencode-ai/plugin (plugin SDK types)

templates/
└── opencode.jsonc          # Config template
```

### v2 Config Keys

`templates/opencode.jsonc` uses the opencode v2 schema (`https://opencode.ai/config.json`). The v1 keys still parse but are marked deprecated, so this is what changed:

| v1 | v2 |
|----|----|
| `autoupdate: true` | `update: "notify"` (`disable` \| `notify` \| `auto`) |
| `plugin: [...]` | `plugins: [...]` |
| `permission: {tool, skill, bash}` | `permissions: [{action, resource, effect}]` — flat array, `effect` is `allow` \| `deny` \| `ask` |
| `provider: {...}` / `provider.<id>.options` | `providers: {...}` / `providers.<id>.settings` |
| `mcp: { "<name>": {...} }` | `mcp: { "servers": { "<name>": {...} } }` |
| `mcp.<name>.enabled: false` | `mcp.servers.<name>.disabled: true` (enabled = omit the key) |
| `agent.<n>.disable: true` | `agents.<n>.disabled: true` |
| `tui.json` (`plugin`, string `theme`) | `cli.json` (`plugins`, `theme: {"name": "system"}`, schema `https://opencode.ai/v2/cli.json`) |

`lsp` (boolean), `instructions`, `model`, and `small_model` are unchanged.

> **Upgrading an existing machine:** `devtools-opencode` only copies the template when `~/.config/opencode/opencode.jsonc` does not exist yet, so a v1 config left in place is never converted automatically. Move the old file aside (or merge by hand) and let the template be copied again. Use `opencode debug config` to inspect the resolved config.

---

## Agent Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                        USER REQUEST                           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              oh-my-opencode-slim ORCHESTRATOR                 │
│  Plans work graph → dispatches background tasks → reconciles  │
└──────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼────────────────────┐
          ▼                   ▼                    ▼
┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐
│ SPECIALIST      │  │ WORKFLOW AGENTS  │  │ COUNCIL        │
│ AGENTS (7)      │  │ (29 subagents)   │  │ (multi-model)  │
│                 │  │                  │  │                │
│ • Oracle        │  │ • prd-creator    │  │ Send question  │
│ • Explorer      │  │ • technical-     │  │ to N models,   │
│ • Librarian     │  │   designer       │  │ synthesize     │
│ • Designer      │  │ • code-reviewer  │  │ verdict        │
│ • Fixer         │  │ • security-      │  │                │
│ • Observer      │  │   reviewer       │  │                │
│ • Council       │  │ • task-executor  │  │                │
│                 │  │ • work-planner   │  │                │
│                 │  │ • ... (21 more)  │  │                │
└─────────────────┘  └──────────────────┘  └────────────────┘
```

**omo-slim agents** are capability-specialized (research, architecture, code execution) and handle routing automatically. **Workflow agents** handle structured development phases (requirements → design → implementation → review → PR). The Orchestrator can delegate to both layers.

The delegation discipline — when to route vs handle directly, which specialist lane to pick, how to manage background tasks, how to hand off design vs mechanical work — lives in `.config/opencode/oh-my-opencode-slim/orchestrator_append.md` and the **Orchestrator Harness (Mandatory)** section of `AGENTS.md`. Both are tracked in this submodule.

---

## Orchestrator Harness

The harness is the contract between this submodule and every opencode session: which agent runs by default, where its prompt extension lives, and how it stays authoritative after `stowme.sh`.

**Tracked files (stowed, authoritative):**

- `.config/opencode/oh-my-opencode-slim.json` — agent → model mappings, `setDefaultAgent: true`, `backgroundJobs.orchestratorWake` (5-minute orchestrator wake interval), multiplexer config, companion disabled
- `.config/opencode/oh-my-opencode-slim/orchestrator_append.md` — the Orchestrator prompt append: routing threshold, specialist lanes (`@explorer`, `@librarian`, `@oracle`, `@designer`, `@fixer`, `@observer`), background-task discipline, design-handoff rule, verification gate
- `.config/opencode/AGENTS.md` — global session instructions, with the **Orchestrator Harness (Mandatory)** section declaring the tracked config canonical

**How it stays authoritative:**

1. **Stow** places the tracked config as a symlink at `~/.config/opencode/oh-my-opencode-slim.json`.
2. The parent repo's `devtools-opencode omo restore` step detects the symlink and skips the installer re-run (the guard returns early when `[ -L "$HOME/.config/opencode/oh-my-opencode-slim.json" ]`), so the tracked config cannot be clobbered by regeneration.
3. **Restart opencode** to pick up config changes — they are not hot-reloaded.

**For fresh machines:** clone the parent repo, run `git submodule update --init --recursive`, then `./start.sh` and `./stowme.sh` as usual. The harness arrives with the rest of the dotfiles.

**For local experimentation:** the tracked config is the source of truth. To try a different preset or model, edit the symlinked `~/.config/opencode/oh-my-opencode-slim.json` directly — but back up first, because changes there do not survive a re-stow that replaces the symlink.

---

## Setup

### 1. Stow the Configuration

```sh
# From the parent dotfiles repo
cd ~/Projects/dotfiles
stow -t ~ linux/opencode
```

### 2. Install oh-my-opencode-slim

```sh
bunx oh-my-opencode-slim@latest install --no-tui --skills=yes \
  --background-subagents=yes --companion=no --preset=opencode-go
```

The installer handles:
- Adding the plugin to the `plugins` array in `opencode.jsonc`
- Disabling default `explore`/`general` agents (via `agents.<name>.disabled`)
- Enabling LSP integration (`lsp: true`)
- Installing 8 bundled skills (codemap, deepwork, simplify, etc.)

The agent model mappings and orchestration policy (`oh-my-opencode-slim.json`) are **tracked in this submodule and stowed as a symlink** — they are authoritative over the installer. Re-running the installer after stow will not regenerate them, because the symlink is recognised: the parent repo's `devtools-opencode omo restore` step explicitly skips when the symlink already exists. A manual installer run (without the symlink guard) would clobber it — back up first if you must.

### 3. Configure Environment

Add to `~/.profile.local`:

```bash
# Required: background orchestration
export OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true
export OPENCODE_ENABLE_EXA=1

# Required: model selection
export OPENCODE_MODEL="opencode/qwen3.5-plus"
export OPENCODE_SMALL_MODEL="opencode-go/kimi-k2.7-code"

# Optional: MCP tokens
export GITHUB_PERSONAL_ACCESS_TOKEN="<token>"
export STACK_EXCHANGE_API_KEY="<key>"
export FIGMA_API_KEY="<key>"
# ... see MCP Servers below
```

### 4. Authenticate and Launch

```sh
source ~/.profile.local
opencode auth login        # Authenticate with providers
opencode models            # List available models (v2 has no --refresh flag)
opencode                   # Or: omos (in tmux)
```

### 5. Verify

Inside the opencode TUI, run:

```
> ping all agents
```

All omo-slim agents (Orchestrator, Oracle, Explorer, Librarian, Designer, Fixer, Observer) should respond.

---

## Plugins

| Plugin | Purpose |
|--------|---------|
| `oh-my-opencode-slim` | Agent orchestration with 7 specialized agents, background tasks, and tmux multiplexer |

That is the only plugin enabled under opencode v2.

> **Why the others are gone:** v2 changed the plugin contract — a plugin must now `export default { id, setup }` instead of exporting a named factory that returns a v1 hook object. The v2.2.0 binary contains no trace of the old hook names (`tool.execute.after`, `tool.execute.before`, `chat.params`, `experimental.chat.system.transform`), so there is no compatibility bridge. Every other plugin here was still on the v1 API and failed to load on every start:
>
> | Dropped | Reason |
> |---------|--------|
> | `opencode-redactor@0.1.1` | v1 API, one published version, no v2 release |
> | `@franlol/opencode-md-table-formatter@latest` | v1 API, no v2 release |
> | `opencode-mem` | ships a v2 entry point but fails at runtime with `TypeError: not a valid backend` |
> | `envsitter-guard` | the resolved version (`0.0.4`) exports a bare function — the v1 shape |
>
> `opencode-redactor` provided secret masking; that capability is currently **not** provided and needs either a v2 release or a local reimplementation.

### Custom Plugin Hooks

Custom plugins live in `.config/opencode/plugins/` — OpenCode auto-scans that directory on every start, independently of the `plugins` array in `opencode.jsonc`.

- **`plugins.disabled/`** — holds the v1-era plugins that were parked rather than deleted: `quality.ts` (runs `prettier --write` after every file edit, warns if tests fail) plus `opencode-claude-attribution.ts`, `opencode-commit-guard.ts`, `opencode-memory-guard.ts` and `opencode-wandavision.ts`.

They are inert: the directory is outside OpenCode's scan path. Move a file back into `plugins/` to re-enable it, once it has been ported to the v2 contract (`export default { id, setup }`, with `ctx.tool.hook("execute.before" | "execute.after", cb)` replacing the v1 hook object).

> **Note:** `quality.ts` is tracked in this repo; the other four existed only in the dotfiles checkout and were never committed here.

---

## MCP Servers

| MCP | Enabled | Required Env Vars | How to Get |
|-----|---------|-------------------|------------|
| `context7` | **yes** | **None** | Remote MCP at `https://mcp.context7.com/mcp` |
| `github-mcp` | **yes** | `GITHUB_PERSONAL_ACCESS_TOKEN` | [GitHub Settings → PAT](https://github.com/settings/tokens) |
| `web-forager` | **yes** | **None** | Local: `web-forager serve` |
| `camoufox` | **yes** | **None** | Local: `npx -y camoufox-mcp-server@latest` |
| `buildkite-mcp` | no | **None** | Remote MCP; OAuth on first use |
| `stackoverflow-mcp` | no | `STACK_EXCHANGE_API_KEY` | [Stack Apps → Register](https://stackapps.com/apps/oauth/register) |
| `framelink-figma` | no | `FIGMA_API_KEY` | [Figma → Personal Access Tokens](https://www.figma.com/developers/api#access-tokens) |
| `chrome-devtools` | no | **None** | Local: `npx -y chrome-devtools-mcp@latest` |
| `atlassian-mcp` | no | `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN`, `CONFLUENCE_URL`, `CONFLUENCE_USERNAME`, `CONFLUENCE_API_TOKEN` | [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `sonarqube-mcp` | no | `SONARQUBE_TOKEN`, `SONARQUBE_URL` | SonarQube → My Account → Security |
| `rea` | **yes** | **None** | Local: `npx -y rea-agents@6.4.0 mcp` |

The servers live under `mcp.servers` in `~/.config/opencode/opencode.jsonc`. Enable a disabled MCP by **removing** its `"disabled": true` key (or setting it to `false`). `rea` (reverse engineering via `npx -y rea-agents mcp`, no env vars) is enabled by default.

`.config/opencode/mcps.json` is a documentation registry consumed by `devtools-opencode` (Claude-Code-style `mcpServers` shape); opencode itself does not read it.

---

## Model Configuration

Models use **environment variables** for multi-environment support:

```bash
# ~/.profile.local
export OPENCODE_MODEL="opencode/qwen3.5-plus"
export OPENCODE_SMALL_MODEL="opencode-go/kimi-k2.7-code"

# Or for AWS Bedrock:
export OPENCODE_MODEL="amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0"
export AWS_REGION="ap-southeast-2"
export AWS_PROFILE="your-aws-profile"
```

### Supported Providers

| Provider | Prefix | Example |
|----------|--------|---------|
| OpenCode (built-in) | `opencode/` | `opencode/qwen3.5-plus` |
| OpenCode Go | `opencode-go/` | `opencode-go/kimi-k2.7-code` |
| Amazon Bedrock | `amazon-bedrock/` | `amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0` |
| GitHub Copilot | `github-copilot/` | `github-copilot/claude-sonnet-4` |
| Ollama | `ollama/` | `ollama/qwen2.5-coder:32b` |
| OpenRouter | `openrouter/` | `openrouter/anthropic/claude-sonnet-4` |

### omo-slim Agent Models

Each omo-slim agent can use a different model. The configuration lives in `~/.config/opencode/oh-my-opencode-slim.json`, which is **tracked and stowed from this submodule** (see [Orchestrator Harness](#orchestrator-harness)):

| Agent | Default (opencode-go preset) | Role |
|-------|------------------------------|------|
| Orchestrator | `opencode-go/minimax-m3` (thinking) | Plans and delegates work |
| Oracle | `opencode-go/qwen3.8-max` (max) | Architecture, debugging, code review |
| Explorer | `opencode-go/deepseek-v4.1-flash` (high) | Codebase reconnaissance |
| Librarian | `opencode-go/deepseek-v4.1-flash` (high) | Documentation and library research |
| Designer | `opencode-go/kimi-k2.7-code` | UI/UX implementation |
| Fixer | `opencode-go/deepseek-v4.1-flash` (high) | Fast code changes |
| Observer | `opencode-go/mimo-v2.5` | Image/visual file analysis |

The config also defines an `openai` preset (`openai/gpt-5.6-*`), but those ids are unverified on this machine (the `openai` provider is not authenticated), so treat the table above as the working set. Switch the entire team's models at runtime with `/preset` in the TUI.

---

## Environment Loading

All environment variables (tokens, model config, feature flags) go in `~/.profile.local`. This file is automatically sourced by `~/.zshrc` on shell startup.

```sh
# ~/.profile.local
export OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true
export OPENCODE_ENABLE_EXA=1
export OPENCODE_MODEL="opencode/qwen3.5-plus"
export OPENCODE_SMALL_MODEL="opencode-go/kimi-k2.7-code"
export GITHUB_PERSONAL_ACCESS_TOKEN="<token>"
```

The old `dotfiles-opencode-env` wrapper (which sourced a project-level `.opencode/.env`) was retired together with the setup wizard, so I wouldn't rely on `.opencode/.env` being loaded automatically — export project-specific variables from your shell instead.

---

## Per-Project Configuration

Override the global config by placing an opencode config file in your project root:

```text
your-project/
├── opencode.jsonc          # project root
└── .opencode/              # optional: extra per-project config directory
```

OpenCode v2 merges configs in this order (last wins):

1. Remote — `.well-known/opencode`
2. Global — `~/.config/opencode/opencode.json` (this repo uses `opencode.jsonc`)
3. Custom — the file named by `OPENCODE_CONFIG`
4. Project — `<project-root>/opencode.json`
5. `.opencode` directories
6. Inline — `OPENCODE_CONFIG_CONTENT`
7. Managed

### Minimal Project Config Example

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "AGENTS.md"
  ],
  "mcp": {
    "servers": {
      "sonarqube-mcp": {
        "type": "local",
        "command": ["docker", "run", "--pull=always", "-i", "--rm",
                    "-e", "SONARQUBE_TOKEN", "-e", "SONARQUBE_URL", "mcp/sonarqube"],
        "environment": {
          "SONARQUBE_TOKEN": "{env:SONARQUBE_TOKEN}",
          "SONARQUBE_URL": "{env:SONARQUBE_URL}"
        }
      }
    }
  }
}
```

### opencode-mem Plugin

> **Disabled.** `opencode-mem` ships a v2 entry point but fails to load on opencode v2.2.0 with `TypeError: not a valid backend`, so it was removed from the `plugins` array. Its config file is kept in place but inert.

The `opencode-mem` plugin uses environment variables for user profile information:

| Variable | Purpose |
|----------|---------|
| `OPENCODE_MEM_USER_EMAIL` | Your email for memory attribution |
| `OPENCODE_MEM_USER_NAME` | Your name for memory attribution |

---

## Tmux Multiplexer

The omo-slim plugin auto-detects tmux and opens panes for subagent sessions.

### Setup

The multiplexer config is already set in `~/.config/opencode/oh-my-opencode-slim.json`:

```json
"multiplexer": {
  "type": "auto",
  "layout": "main-vertical",
  "main_pane_size": 60
}
```

### Usage

An `omos()` helper is defined in `~/.profile.local`. It auto-selects a free port and sets `OPENCODE_PORT`:

```sh
# Inside a tmux session:
omos

# With explicit port:
omos --port 4096
```

Then trigger delegated work — subagent panes appear automatically.

---

## Security

- `~/.profile.local` is the designated place for tokens (not committed to git)
- **Never commit tokens** to git
- Use separate tokens per machine if possible (easier to revoke)
- `envsitter-guard` blocks accidental secret exposure in .env files
- `opencode-redactor` strips sensitive fields from outputs
- The `permissions` array denies `git commit`, `git push`, and `git reset --hard` (covers the GPG-needs-a-TTY concern the retired `git-commit-guard.ts` plugin used to handle)

---

## License

Copyright (c) 2026 John Cyrill Corsanes

This project is licensed under the **AI-Restricted MIT License** — see [LICENSE](LICENSE) for full text.

**Key point:** Permission is granted for human use, but **AI/ML/LLM systems are prohibited** from training on or deriving output from this code.
