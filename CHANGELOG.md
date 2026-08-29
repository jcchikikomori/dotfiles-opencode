# Changelog

All notable changes to the OpenCode configuration and custom agents for this dotfiles repository.

## [Unreleased]

### Changed

- **Reverted to vanilla opencode** — Removed OpenAgentsControl (OAC) and oh-my-opencode-slim
  - Removed `oh-my-opencode-slim` plugin and `default_agent: "OpenAgent"` (OAC orchestrator)
  - Removed `oh-my-opencode-slim.template.json` and `scripts/generate-slim-config/` TypeScript generator
  - Added `model` / `small_model` env-var fields to `opencode.jsonc` (required without OAC)
  - Skill routing now instruction-driven via expanded `AGENTS.md` (Claude Code parity)
  - Added full skill auto-loading table to `AGENTS.md` (by tech stack + by task type)
  - Rewrote `wiki/Agent-Architecture.md` to reflect vanilla + skill-driven setup
- **`opencode-mem` retained** — persistent session memory kept

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
