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

- **OpenAgentsControl (OAC)** - Pattern-first AI development framework installed to `~/.opencode/`
  - 2 main agents: OpenAgent (general), OpenCoder (production)
  - 11 subagents: ContextScout, TaskManager, CoderAgent, TestEngineer, CodeReviewer, etc.
  - 9 productivity commands: `/add-context`, `/commit`, `/test`, `/context`, `/optimize`, etc.
  - 198+ context files: core patterns, workflows, standards, external library guides
  - MVI (Minimal Viable Information) principle for 80% token reduction
  - Approval gates workflow: Discover → Propose → Approve → Execute → Validate → Ship
- **Standalone OAC installer** - `bin/install-oac` for repository independence
  - Install, update, status, verify, and uninstall commands
  - No dependency on external dotfiles structure
  - Color-coded output and detailed status reporting
- AI-Restricted MIT License
- README badges and Quick Start section
- Table of Contents and architecture diagram
- AGENTS-README.md with agent routing tables
- wiki/Getting-Started.md
- wiki/Agent-Architecture.md
- CONTRIBUTING.md
- `bin/dotfiles-opencode-env` wrapper for project-level .env loading
- **Model Configuration section in README** - Documents environment-based model setup
- **Model Configuration section in Agent Architecture** - Explains why hardcoded models are removed
- **OH-MY-OPENCODE.md** - Documentation explaining why oh-my-opencode plugins are disabled and recommending Zenox as alternative
- **Zenox delegation in obama agent** - obama now knows about Zenox agents (explorer, librarian, oracle, ui-planner) for background task delegation

### Changed

- **⚠️ BREAKING: Default agent changed to `OpenAgent`** - All OpenCode sessions now use OAC's OpenAgent by default
- **README.md architecture** - Updated to reflect OpenAgentsControl framework instead of custom orchestrator
- **Setup instructions** - Added OAC installation step with standalone installer
- **⚠️ BREAKING: Removed hardcoded model references from agent files** - All agents now use `{env:OPENCODE_MODEL}`
- **obama.md agent** - Now documents model configuration via environment variables instead of hardcoding GitHub Copilot models
- **opencode.jsonc** - Uses environment variable interpolation for model configuration
- **oh-my-opencode-slim.json** - Updated to use `{env:OPENCODE_MODEL}` and `{env:OPENCODE_SMALL_MODEL}` instead of hardcoded GitHub Copilot models
- **oh-my-opencode.json** - Disabled (renamed to .disabled) due to too many hardcoded, non-existent models (gpt-5.4, gpt-5-mini, etc.)

### Removed

- **Zenox plugin** - Replaced by OpenAgentsControl
- **"Obama" custom orchestrator branding** - Replaced by OAC's OpenAgent/OpenCoder framework
- **Custom agent routing** - Now using OAC's context-driven workflow with 11 specialized subagents
- **oh-my-opencode-slim** - Removed from plugin list due to orchestrator conflict with custom obama agent architecture
- **Reason:** This configuration uses custom agents (obama, dotfiles-maintainer, dotfiles-orchestrator) that conflict with oh-my-opencode-slim's orchestrator
- **Alternative:** Use Zenox for background tasks and parallel agent execution instead

### Migration Guide

If you have existing configurations with hardcoded models:

1. Add to `~/.config/opencode/.env`:

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
