# Opencode Configuration

> **Part of [jcchikikomori/.dotfiles](https://github.com/jcchikikomori/.dotfiles)** — A standalone package containing [opencode](https://opencode.ai) configuration files that are stowed to `~/.config/opencode/`.

[![License: AI-Restricted MIT](https://img.shields.io/badge/License-AI--Restricted%20MIT-yellow.svg)](LICENSE)
[![dotfiles](https://img.shields.io/badge/dotfiles-jcchikikomori-blue.svg)](https://github.com/jcchikikomori/.dotfiles)

---

## About the Agent Framework

This configuration uses **OpenAgentsControl (OAC)** — a pattern-first AI development framework that provides specialized agents for different development tasks. OAC includes:

- **OpenAgent** — General purpose agent for exploration and quick tasks
- **OpenCoder** — Production-focused agent with strict approval gates and quality standards
- **11 specialized subagents** — ContextScout, TaskManager, CoderAgent, TestEngineer, CodeReviewer, and more
- **198+ context files** — Core patterns, workflows, standards, and external library guides
- **9 productivity commands** — `/add-context`, `/commit`, `/test`, `/context`, `/optimize`, etc.

The framework follows an **MVI (Minimal Viable Information)** principle for efficient token usage and implements **approval gates workflow**: Discover → Propose → Approve → Execute → Validate → Ship.

---

## Table of Contents

- [Opencode Configuration](#opencode-configuration)
  - [About the Agent Framework](#about-the-agent-framework)
  - [Table of Contents](#table-of-contents)
  - [Files](#files)
    - [Directory Structure](#directory-structure)
  - [Architecture](#architecture)
  - [Setup](#setup)
    - [1. Clone and Install Configuration](#1-clone-and-install-configuration)
    - [2. Install OpenAgentsControl (OAC)](#2-install-openagentscontrol-oac)
    - [3. Configure Environment](#3-configure-environment)
    - [4. Enable MCPs](#4-enable-mcps)
    - [5. Start Using OpenAgentsControl](#5-start-using-openagentscontrol)
  - [Required Tokens](#required-tokens)
  - [Plugins](#plugins)
  - [Model Configuration](#model-configuration)
    - [Required Environment Variables](#required-environment-variables)
    - [Why Environment Variables?](#why-environment-variables)
    - [Configuration Hierarchy](#configuration-hierarchy)
    - [Supported Providers](#supported-providers)
  - [Environment Loading](#environment-loading)
    - [Global vs Project-Level](#global-vs-project-level)
    - [How the Wrapper Works](#how-the-wrapper-works)
    - [Debug Toggle](#debug-toggle)
    - [Recursion Safety](#recursion-safety)
  - [Per-Project Configuration](#per-project-configuration)
    - [Minimal Project Config Example](#minimal-project-config-example)
    - [opencode-mem Plugin](#opencode-mem-plugin)
    - [oh-my-opencode-slim Plugin](#oh-my-opencode-slim-plugin)
  - [Security](#security)
  - [License](#license)

---

## Files

| File | Purpose |
|------|---------|
| `templates/opencode.jsonc` | **Template** for main config (copied to `~/.config/opencode/` on install) |
| `AGENTS.md` | Global agent instructions |
| `oh-my-opencode-slim.template.json` | Template for oh-my-opencode-slim plugin |
| `opencode-mem.jsonc` | Configuration for opencode-mem plugin |

### Directory Structure

```text
.config/opencode/
├── opencode.jsonc          # Main configuration (copied from template on install)
├── AGENTS.md               # Global agent instructions
├── skills/                 # 32 specialized skills
│   ├── android/
│   ├── backend/
│   ├── frontend/
│   ├── git/
│   ├── nodejs/
│   ├── python/
│   └── ... (and 26 more)
├── agents/                 # (Reserved for future use)
├── plugins/                # Plugin configurations
└── scripts/                # Utility scripts

templates/
└── opencode.jsonc          # Config template (copied to ~/.config/opencode/ if missing)
```

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                          USER REQUEST                           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              OPENAGENTSCONTROL (OAC) FRAMEWORK                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  OpenAgent: General purpose, exploration                  │  │
│  │  OpenCoder: Production code, approval gates               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼───────────────────────┐
        │                         │                       │
        ▼                         ▼                       ▼
┌───────────────┐         ┌───────────────┐       ┌───────────────┐
│ SKILLS        │         │ SUBAGENTS     │       │ CONTEXT FILES │
│ (32 skills)   │         │ (11 agents)   │       │ (198+ files)  │
│               │         │               │       │               │
│ • android     │         │ • ContextScout│       │ • Standards   │
│ • backend     │         │ • TaskManager │       │ • Workflows   │
│ • frontend    │         │ • CoderAgent  │       │ • Patterns    │
│ • git         │         │ • TestEngineer│       │ • Library     │
│ • nodejs      │         │ • CodeReviewer│       │   Guides      │
│ • python      │         │ • BatchExecutor│      │               │
│ • ... (26+)   │         │ • ... (5+)    │       │               │
└───────────────┘         └───────────────┘       └───────────────┘
```

---

## Setup

### 1. Clone and Install Configuration

```sh
git clone https://github.com/jcchikikomori/.dotfiles.git
cd .dotfiles

# Install opencode configuration (generates ~/.config/opencode/opencode.jsonc from template)
devtools-opencode install

# Or manually copy configuration to ~/.config/opencode
mkdir -p ~/.config/opencode
cp templates/opencode.jsonc ~/.config/opencode/opencode.jsonc
cp -r .config/opencode/* ~/.config/opencode/

# Install helper scripts
mkdir -p ~/.local/bin
chmod +x bin/install-oac

# Add to PATH if not already
export PATH="$HOME/.local/bin:$PATH"
```

### 2. Install OpenAgentsControl (OAC)

```sh
# Install OAC framework (agents, context files, commands)
./bin/install-oac install

# Verify installation
./bin/install-oac status
```

This installs OAC to `~/.opencode/` with:

- OpenAgent and OpenCoder (main agents)
- 11 specialized subagents
- 198+ context files
- 9 productivity commands

### 3. Configure Environment

```sh
# Copy the example profile to ~/.profile.local
cp ~/.dotfiles/.profile.local.example ~/.profile.local

# Edit and fill in your tokens (see Required Tokens section below)
nano ~/.profile.local
```

Restart your shell (or `source ~/.profile`) to load the env vars.

### 4. Enable MCPs

Enable desired MCPs in `~/.config/opencode/opencode.jsonc` by setting `"enabled": true`.

### 5. Start Using OpenAgentsControl

```sh
# Start with OpenAgent (general purpose)
opencode --agent OpenAgent

# Or use OpenCoder (production code with approval gates)
opencode --agent OpenCoder

# Or use default agent (configured in opencode.jsonc)
opencode
```

### Install Zenox

```sh
bunx zenox install
```

This automatically adds `zenox` to the plugin list in `opencode.jsonc`.

## Plugins

This configuration uses the following plugins:

| Plugin | Purpose |
|--------|---------|
| `envsitter-guard@latest` | Prevents accidental exposure of secrets in .env files |
| `oh-my-opencode-slim` | Lightweight skill organization (configured via template) |
| `@franlol/opencode-md-table-formatter@latest` | Auto-formats markdown tables |
| `opencode-mem` | Memory/context persistence across sessions |
| `opencode-redactor@0.1.1` | Redacts sensitive information from outputs |
| `zenox` | (Optional) Additional plugin support |

---

## Required Tokens

| MCP | Required Env Vars | How to Get |
|-----|-------------------|------------|
| `context7` | **None** — public API | Remote MCP at `https://mcp.context7.com/mcp` |
| `web-forager` | **None** | Local command: `web-forager serve` |
| `chrome-devtools` | **None** | Local command: `npx -y chrome-devtools-mcp@latest` |
| `mcp-ocr` | **None** | Local command: `mcp-ocr` |
| `markitdown-mcp` | **None** | Local command: `uvx markitdown-mcp` (requires Python 3.10+) |
| `markdownlint-mcp` | **None** | Local command: `npx -y markdownlint-mcp` |
| `github-mcp` | `GITHUB_PERSONAL_ACCESS_TOKEN` | [GitHub Settings → Developer settings → PAT](https://github.com/settings/tokens) |
| `stackoverflow-mcp` | `STACK_EXCHANGE_API_KEY` | [Stack Apps → Register](https://stackapps.com/apps/oauth/register) |
| `framelink-figma` | `FIGMA_API_KEY` | [Figma Settings → Personal Access Tokens](https://www.figma.com/developers/api#access-tokens) |
| `atlassian-mcp` | `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN`, `CONFLUENCE_URL`, `CONFLUENCE_USERNAME`, `CONFLUENCE_API_TOKEN` | [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `sonarqube-mcp` | `SONARQUBE_TOKEN`, `SONARQUBE_URL` | Your SonarQube instance → My Account → Security |
| `buildkite-mcp` | **None** — uses OAuth | Remote MCP at `https://mcp.buildkite.com/mcp`; authenticate via OAuth browser flow when first enabled |

> **Note:** MCPs marked as enabled by default: `context7`, `web-forager`, `chrome-devtools`, `mcp-ocr`, `markitdown-mcp`, `markdownlint-mcp`. Others require configuration and enabling in `opencode.jsonc`.
>
> **New Document Processing MCPs:**
> - **markitdown-mcp** — Microsoft's converter supporting PDF, Office docs (DOCX, PPTX, XLSX), images with OCR, audio with transcription, HTML, CSV, JSON, XML, ZIP, YouTube URLs, and EPubs to clean Markdown
> - **markdownlint-mcp** — Markdown linter with auto-fix capability (58% of rules), supports CommonMark + GitHub Flavored Markdown with 522 passing tests

---

## Model Configuration

**IMPORTANT:** This configuration uses **environment variables** for model selection to support multiple environments (work, personal, different providers).

### Required Environment Variables

Add these to `~/.profile.local`:

```bash
# Model Configuration (REQUIRED)
OPENCODE_MODEL=amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0
OPENCODE_SMALL_MODEL=amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0

# Provider-specific configuration
# For Amazon Bedrock:
AWS_REGION=ap-southeast-2
AWS_PROFILE=your-aws-profile

# For GitHub Copilot (if using instead of Bedrock):
# OPENCODE_MODEL=github-copilot/claude-sonnet-4
# OPENCODE_SMALL_MODEL=github-copilot/claude-haiku-4
```

### Why Environment Variables?

✅ **Multi-environment support** - Switch between work (AWS Bedrock) and personal (GitHub Copilot) projects
✅ **Subagent compatibility** - Subagents inherit model config correctly
✅ **Provider flexibility** - Change providers without editing config files
✅ **No hardcoded models** - Same config works across all machines

### Configuration Hierarchy

Models are resolved in this order:

1. Project `.opencode/opencode.jsonc` (if it defines a model)
2. Global `~/.config/opencode/opencode.jsonc` (uses `{env:OPENCODE_MODEL}`)
3. Environment variable `$OPENCODE_MODEL` from `.env` file

### Supported Providers

| Provider | Model Prefix | Example |
|----------|--------------|---------|
| Amazon Bedrock | `amazon-bedrock/` | `amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0` |
| GitHub Copilot | `github-copilot/` | `github-copilot/claude-sonnet-4` |
| Ollama | `ollama/` | `ollama/qwen2.5-coder:32b` |
| OpenRouter | `openrouter/` | `openrouter/anthropic/claude-sonnet-4` |

For detailed troubleshooting and best practices, see the [Model Configuration Guide](https://github.com/jcchikikomori/.dotfiles/blob/main/docs/OPENCODE_MODEL_CONFIG.md) in the main dotfiles repo.

---

## Environment Loading

### Global vs Project-Level

Environment variables for opencode (tokens, model config, etc.) should be placed in `~/.profile.local`. This file is automatically sourced by `~/.profile` on shell startup and by the devtools helper scripts.

```sh
# ~/.profile.local — add your tokens here
export OPENCODE_MODEL="amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0"
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
```

For project-specific overrides, create `.opencode/.env` in your project root.

> **Note:** The old `~/.config/opencode/.env` path is no longer used. `dotfiles-opencode-env` has been removed in favor of `~/.profile.local`.

---

## Per-Project Configuration

Override the global config by placing `opencode.jsonc` in your project:

```text
your-project/
├── opencode.jsonc          # option A: project root
└── .opencode/
    └── opencode.jsonc      # option B: hidden directory
```

Opencode merges configs in this order (last wins):

1. `~/.config/opencode/opencode.jsonc` — global
2. `<project-root>/opencode.jsonc` or `<project-root>/.opencode/opencode.jsonc` — project-level

### Minimal Project Config Example

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "AGENTS.md"
  ],
  "mcp": {
    "sonarqube-mcp": {
      "enabled": true
    }
  }
}
```

### opencode-mem Plugin

The `opencode-mem` plugin uses environment variables for user profile information:

| Variable | Purpose |
|----------|---------|
| `OPENCODE_MEM_USER_EMAIL` | Your email for memory attribution |
| `OPENCODE_MEM_USER_NAME` | Your name for memory attribution |

### oh-my-opencode-slim Plugin

This configuration uses `oh-my-opencode-slim` — a lightweight skill organization plugin. The template is stored in `oh-my-opencode-slim.template.json`. This is distinct from the full `oh-my-opencode` plugin which includes additional features that may not be needed for all use cases.

---

## Security

- `~/.profile.local` is the recommended place for tokens (not committed to git)
- **Never commit tokens** to git
- Use separate tokens per machine if possible (easier to revoke)
- Plugins like `envsitter-guard` and `opencode-redactor` help prevent accidental secret exposure
- The `oh-my-opencode-slim` plugin provides lightweight skill organization without unnecessary dependencies

---

## Binary Tools

This package includes management scripts installed to `~/.local/bin/org.jcchikikomori.agentic.opencode/bin/`:

### `devtools-opencode`

This package is managed by `devtools-opencode`, which provides subcommands for installation, configuration, and maintenance. Run `devtools-opencode --help` for the full list of available commands.

**Generated Configuration**: On first install, `devtools-opencode install` copies `templates/opencode.jsonc` to `~/.config/opencode/opencode.jsonc` if it doesn't already exist. This ensures your local config survives stow/restow cycles and can be customized without being overwritten.

**Dynamic MCP Loading**: The script reads MCPs from:
1. Local `linux/opencode/mcps.json` (if it exists)
2. Shared `shared/ai-agents/mcps.json` (fallback)

This allows OpenCode to maintain its own MCP registry while sharing common MCPs with other agents.

**Environment Variables**: This script automatically sources `~/.profile.local` to load MCP tokens (GITHUB_PERSONAL_ACCESS_TOKEN, STACK_EXCHANGE_API_KEY, etc.)

### `dotfiles-opencode-wizard`

Interactive setup wizard:

- Guides through initial configuration
- Helps select model providers and configure tokens
- Sets up project-specific settings

> **Note:** The wizard internally calls `devtools-opencode` to perform installation and configuration tasks.

### Environment Variable Loading

All scripts source `~/.profile.local` for MCP and AI-related environment variables. Add your tokens there:

```bash
# ~/.profile.local
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
export STACK_EXCHANGE_API_KEY="your_key"
export FIGMA_API_KEY="figd_xxx"
```

---

## License

Copyright (c) 2026 John Cyrill Corsanes

This project is licensed under the **AI-Restricted MIT License** — see [LICENSE](LICENSE) for full text.

**Key point:** Permission is granted for human use, but **AI/ML/LLM systems are prohibited** from training on or deriving output from this code.
