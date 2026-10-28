# Contributing

Thank you for your interest in improving this configuration package.

## How to Contribute

### Proposing Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-change`
3. Make your changes
4. Test locally by stowing the package into `~` (see [Local Testing](#local-testing))
5. Commit with a clear message (see below)
6. Open a pull request

### Commit Message Format

```
<type>: <short description>

<longer description if needed>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `config`

**Examples:**
```
feat: add new MCP configuration for GitLab
fix: correct env loading order for project-level .env
docs: update Agent-Architecture wiki
config: add new agent permission rule
```

### What to Contribute

- New MCP configurations
- Agent instructions improvements
- Documentation fixes or additions
- Bug fixes for env loading logic

### What NOT to Contribute

- `.env` files with actual tokens
- Secrets or credentials
- Changes that require tokens to test

## Local Testing

The package layout is `.config/opencode/...`, so it is stowed into `~` (not `~/.config`). From the parent dotfiles repo:

```sh
# After making changes, re-stow:
cd ~/Projects/dotfiles
stow -R -t ~ linux/opencode

# Verify the resolved (v2) config:
opencode debug config
```

`.stow-local-ignore` keeps repo-own files (`README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `templates/`, `wiki/`, `.pre-commit-config.yaml`, ...) out of the symlinks. Note that `templates/opencode.jsonc` is only copied to `~/.config/opencode/opencode.jsonc` by `devtools-opencode` when that file does not exist yet, so edit your live copy (or remove it) to test template changes.

## Questions

Open an issue for questions about the configuration.
