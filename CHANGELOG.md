# Changelog

All notable changes to the OpenCode configuration and custom agents for this dotfiles repository.

## [Unreleased]

### Changed

- **Migrated to opencode v2** (installed: v2.2.0)
  - `templates/opencode.jsonc` moved to the v2 config keys (the v1 keys still parse but are deprecated in the v2 schema):
    - `autoupdate: true` → `update: "notify"`
    - `plugin` → `plugins`
    - `permission: {tool, skill, bash}` → `permissions: [{action, resource, effect}]` (flat array)
    - `provider` → `providers`, `provider.<id>.options` → `providers.<id>.settings`
    - `mcp: {"<name>": {...}}` → `mcp: {"servers": {"<name>": {...}}}`, and `enabled: false` → `disabled: true` (enabled = omit the key)
    - `agent.<n>.disable` → `agents.<n>.disabled`
    - `lsp`, `instructions`, `model`, `small_model` unchanged
  - `.config/opencode/tui.json` → `.config/opencode/cli.json` (schema `https://opencode.ai/v2/cli.json`, `plugins` array, `theme` as an object)
  - Shell completions: `opencode completion zsh` → `opencode --completions zsh` (v2 has no `completion` subcommand); the v1 `.zopencode` completion script is removed
  - `opencode models --refresh` no longer exists — use `opencode models`
  - `@opencode-ai/plugin` bumped from 1.3.0 to 1.19.5 in `.config/opencode/package.json`
  - `mcps.json` stays a documentation registry for `devtools-opencode` (opencode does not read it); `rea` MCP added to the template, bringing it to 11 servers
  - Model ids that do not exist in the v2.2.0 catalog were corrected: `opencode-go/deepseek-v4-flash` → `opencode-go/deepseek-v4.1-flash`, `opencode-go/qwen3.7-max` → `opencode-go/qwen3.8-max`, `opencode-go/kimi-k2.6` → `opencode-go/kimi-k2.7-code` (also the recommended `OPENCODE_SMALL_MODEL`). The `openai/gpt-5.6-*` preset ids are left as-is but unverified (the `openai` provider is not authenticated here)
  - `devtools-opencode` only copies the template when `~/.config/opencode/opencode.jsonc` is missing, so existing v1 configs are not upgraded automatically — swap them manually
- **Adopted oh-my-opencode-slim** as the orchestration layer
  - Added `oh-my-opencode-slim` plugin to the `templates/opencode.jsonc` `plugins` array (replaces `oh-my-opencode@latest`)
  - Opencode-go preset active in `~/.config/opencode/oh-my-opencode-slim.json` (`opencode-go/minimax-m3` Orchestrator, `opencode-go/qwen3.8-max` Oracle, `opencode-go/deepseek-v4.1-flash` workers, `opencode-go/kimi-k2.7-code` Designer, `opencode-go/mimo-v2.5` Observer)
  - Default `explore` and `general` agents disabled in favour of omo-slim's specialised agents
  - LSP enabled via `lsp: true` in `opencode.jsonc`
  - 8 bundled skills installed via the installer: `simplify`, `codemap`, `clonedeps`, `deepwork`, `verification-planning`, `reflect`, `worktrees`, `oh-my-opencode-slim`
  - Tmux multiplexer enabled (`type: auto`, `layout: main-vertical`) so background agents open live panes when running `omos` inside tmux
  - Desktop companion disabled in config (`oh-my-opencode-slim.json > companion.enabled = false`) — overlays obstruct the terminal UI
- **`devtools-opencode omo` subcommand renamed to `omos`** — restores `oh-my-opencode-slim` instead of the legacy `oh-my-opencode` plugin. Saved prefs moved from `~/.local/share/devtools-opencode/omo.prefs` to `omos.prefs`; backups moved from `~/.backups/opencode/omo/` to `omos/`. zsh completion, `stowme.sh`, `dotfiles-cleanup`, and the devtools `AGENTS.md` updated to match. Closes #263.
  - **Promoted the harness into version control** so fresh machines seed it instead of losing it to installer regeneration
    - `.config/opencode/oh-my-opencode-slim.json` is now tracked and stowed — authoritative over the installer (`devtools-opencode` `omos restore` explicitly skips when the symlink is present)
    - `.config/opencode/oh-my-opencode-slim/orchestrator_append.md` — tracked prompt append encoding the delegation discipline (routing threshold, specialist lanes, background-task rules, design handoff, verification gate)
    - `.config/opencode/AGENTS.md` gains an "Orchestrator Harness (Mandatory)" section declaring the tracked config canonical
    - `.gitignore` no longer ignores `oh-my-opencode-slim.json` (leftover from the live-only era)
    - `templates/opencode.jsonc` `agents` block synced to disable (`disabled: true`) the built-in `explore`/`general` primaries

### Removed

- **`.zopencode`** — v1 yargs completion script; v2 uses `opencode --completions <bash|zsh|fish|sh>`
- **`.config/opencode/tui.json`** — replaced by `cli.json` in v2
- **`.local/bin/org.jcchikikomori.agentic.opencode/`** — 918-line interactive setup wizard deleted from the repo. Most of what the wizard did is now handled by `oh-my-opencode-slim`'s own config + install command. Manual edits to the templates replace the menu-driven flow.
- **`oh-my-opencode@latest`** — replaced by `oh-my-opencode-slim`
- **`oh-my-openagent@latest`** / `oh-my-openagent` from `tui.json` — replaced by the omo-slim TUI badge
- **`opencode-redactor@0.1.1`** — dropped from the `plugins` array. The package has only ever published one version, it uses the v1 plugin API, and it therefore fails to load under v2 (`Plugin must export a default definition with an id and an effect or setup function`). Reimplementing its 25+ regex detectors plus entropy analysis is a rewrite, not a migration — so the plugin was removed rather than left in the config failing on every start. **Secret masking is currently not provided**; re-add it once a v2 release exists or when a local port is written.
- **`@franlol/opencode-md-table-formatter@latest`** — dropped for the same reason (v1 plugin API, no v2 release).
- **`opencode-mem`** — dropped. It ships a v2 entry point, but loading it fails at runtime with `TypeError: not a valid backend` on v2.2.0 regardless of version or provider configuration.
- **`envsitter-guard`** — dropped. The version opencode resolves from its package cache is `0.0.4`, whose default export is a bare function (the v1 plugin shape), so it fails the v2 loader's schema check with `Expected object at [default]`. npm's `0.1.0` is v2-shaped but the cached resolution never picked it up.
- **Local plugin files** (`quality.ts`, `opencode-claude-attribution.ts`, `opencode-commit-guard.ts`, `opencode-memory-guard.ts`, `opencode-wandavision.ts`) — moved from `.config/opencode/plugins/` to `.config/opencode/plugins.disabled/`. OpenCode auto-scans `~/.config/opencode/plugins/` regardless of the `plugins` array, so a file left there is loaded on every start and fails the v2 loader's schema check. `plugins.disabled/` is outside the scan path, so the files are preserved but inert; move one back to re-enable it. The four non-`quality` files were never tracked in this repo — they existed only in the dotfiles checkout and would have been lost by a delete.

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
- wiki/Agent-Architecture.md (`wiki/Getting-Started.md` was listed here originally but never existed in this repo)
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
