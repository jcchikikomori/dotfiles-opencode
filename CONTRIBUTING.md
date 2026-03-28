# Contributing

Thank you for your interest in improving this configuration package.

## How to Contribute

### Proposing Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-change`
3. Make your changes
4. Test locally by stowing to `~/.config/opencode`
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
docs: update Getting-Started wiki
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

```sh
# After making changes, re-stow:
stow opencode -t ~/.config -D
stow opencode -t ~/.config

# Verify:
OPENCODE_ENV_DEBUG=1 opencode
```

## Questions

Open an issue for questions about the configuration.
