# Changelog

All notable changes to the OpenCode configuration and custom agents for this dotfiles repository.

## [Unreleased]

### Changed

- **Adopted oh-my-opencode-slim** as the orchestration layer
  - Added `oh-my-opencode-slim` plugin to `templates/opencode.jsonc` plugin array (replaces `oh-my-opencode@latest`)
  - Opencode-go preset active in `~/.config/opencode/oh-my-opencode-slim.json` (`opencode-go/minimax-m3` Orchestrator, `opencode-go/qwen3.7-max` Oracle, `opencode-go/deepseek-v4-flash` workers, `opencode-go/kimi-k2.7-code` Designer, `opencode-go/mimo-v2.5` Observer)
  - Default `explore` and `general` agents disabled in favour of omo-slim's specialised agents
  - LSP enabled in `opencode.jsonc`
  - 8 bundled skills installed via the installer: `simplify`, `codemap`, `clonedeps`, `deepwork`, `verification-planning`, `reflect`, `worktrees`, `oh-my-opencode-slim`
  - Tmux multiplexer enabled (`type: auto`, `layout: main-vertical`) so background agents open live panes when running `omos` inside tmux
  - Desktop companion disabled in config (`oh-my-opencode-slim.json > companion.enabled = false`) — overlays obstruct the terminal UI
- **`devtools-opencode omo` subcommand renamed to `omos`** — restores `oh-my-opencode-slim` instead of the legacy `oh-my-opencode` plugin. Saved prefs moved from `~/.local/share/devtools-opencode/omo.prefs` to `omos.prefs`; backups moved from `~/.backups/opencode/omo/` to `omos/`. zsh completion, `stowme.sh`, `dotfiles-cleanup`, and the devtools `AGENTS.md` updated to match. Closes #263.
  - **Promoted the harness into version control** so fresh machines seed it instead of losing it to installer regeneration
    - `.config/opencode/oh-my-opencode-slim.json` is now tracked and stowed — authoritative over the installer (`devtools-opencode` `omos restore` explicitly skips when the symlink is present)
    - `.config/opencode/oh-my-opencode-slim/orchestrator_append.md` — tracked prompt append encoding the delegation discipline (routing threshold, specialist lanes, background-task rules, design handoff, verification gate)
    - `.config/opencode/AGENTS.md` gains an "Orchestrator Harness (Mandatory)" section declaring the tracked config canonical
    - `.gitignore` no longer ignores `oh-my-opencode-slim.json` (leftover from the live-only era)
    - `templates/opencode.jsonc` `agent` block synced to disable the built-in `explore`/`general` primaries

### Removed

- **`.local/bin/org.jcchikikomori.agentic.opencode/`** — 918-line interactive setup wizard deleted from the repo. Most of what the wizard did is now handled by `oh-my-opencode-slim`'s own config + install command. Manual edits to the templates replace the menu-driven flow.
- **`oh-my-opencode@latest`** — replaced by `oh-my-opencode-slim`
- **`oh-my-openagent@latest`** / `oh-my-openagent` from `tui.json` — replaced by the omo-slim TUI badge

### Migration

Run once after pulling these changes:

```sh
bunx oh-my-opencode-slim@latest install --no-tui --skills=yes \
  --background-subagents=yes --companion=no --preset=opencode-go
```

Then disable the companion in `~/.config/opencode/oh-my-opencode-slim.json`:

```jsonc
"companion": { "enabled": false }
```

Add to `~/.profile.local`:

```sh
export OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true
export OPENCODE_ENABLE_EXA=1
```

And define the `omos()` launcher (mirrors the helper from omo-slim's multiplexer docs) so tmux sessions pick a free port automatically.

---

### Added

- AI-Restricted MIT License
- README badges and Quick Start section
- Table of Contents
- wiki/Getting-Started.md
- wiki/Agent-Architecture.md
- CONTRIBUTING.md
- `bin/dotfiles-opencode-env` wrapper for project-level .env loading
- **Model Configuration section in README** - Documents environment-based model setup
- Environment variable-based model configuration (replaced hardcoded models)

### Changed

- **README.md architecture** - Updated to reflect vanilla opencode + skill-driven setup
- **Setup instructions** - Simplified (no OAC/oh-my-opencode dependencies)
- **⚠️ BREAKING: Removed hardcoded model references** - All models use `{env:OPENCODE_MODEL}`
- **opencode.jsonc** - Uses environment variable interpolation for model configuration

### Removed

- **OpenAgentsControl (OAC)** - Reverted to vanilla opencode
- **oh-my-opencode / oh-my-opencode-slim** - Removed due to hardcoded non-existent models and orchestrator conflicts
- **Zenox plugin** - No longer needed
- **"Obama" custom orchestrator** - Replaced by vanilla opencode with skill routing via AGENTS.md
- **Custom agent routing** - Now skill-driven via expanded AGENTS.md instructions

### Migration Guide

If you have existing configurations with hardcoded models:

1. Add to `~/.profile.local`:

   ```bash
   OPENCODE_MODEL=your-provider/your-model
   OPENCODE_SMALL_MODEL=your-provider/your-small-model
   ```

2. Update your `opencode.jsonc`:

   ```jsonc
   {
     "model": "{env:OPENCODE_MODEL}",
     "small_model": "{env:OPENCODE_SMALL_MODEL}"
   }
   ```

3. For AWS Bedrock, also add:

   ```bash
   AWS_REGION=your-region
   AWS_PROFILE=your-profile
   ```

See the [Model Configuration Guide](https://github.com/jcchikikomori/.dotfiles/blob/main/docs/OPENCODE_MODEL_CONFIG.md) for detailed instructions.

---

## [1.0.0] - 2026-03-28

### Added

- Initial opencode configuration package
- opencode.jsonc with MCPs, providers, permissions
- AGENTS.md with global agent instructions
- .env.example template
- Per-project env loading via dotfiles-opencode-env wrapper
- opencode-mem plugin configuration
- Git commit guard plugin
