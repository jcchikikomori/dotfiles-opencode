# Getting Started

A fresh machine setup guide for opencode configuration.

## Prerequisites

- [opencode](https://opencode.ai) installed
- Git configured
- A GitHub Personal Access Token (for GitHub MCP)

## Installation

### 1. Clone Your Dotfiles

```sh
git clone https://github.com/jcchikikomori/.dotfiles.git ~/dotfiles
cd ~/dotfiles
```

### 2. Stow the opencode Package

```sh
stow opencode -t ~/.config
```

This creates symlinks from `~/.config/opencode/` to the stowed files.

### 3. Set Up Tokens

```sh
cp ~/.config/opencode/.env.example ~/.config/opencode/.env
nano ~/.config/opencode/.env
```

Add your tokens:
```sh
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxx
STACK_EXCHANGE_API_KEY=your_key_here
OPENCODE_MEM_USER_EMAIL=your@email.com
OPENCODE_MEM_USER_NAME="Your Name"
```

### 4. Restart Shell

```sh
source ~/.profile
```

Or log out and back in.

### 5. Verify Installation

```sh
opencode --version
_DOTFILES_OPENCODE_ENV_DEBUG=1 opencode
```

## First-Run Checklist

- [ ] GitHub PAT generated with `repo` scope
- [ ] `.env` file created with tokens
- [ ] Shell restarted / profile sourced
- [ ] opencode responds to commands
- [ ] Git MCP enabled (optional, set `"enabled": true` in opencode.jsonc)

## Updating

Pull latest changes and re-stow:

```sh
cd ~/dotfiles
git pull
stow opencode -t ~/.config -D  # unlink old
stow opencode -t ~/.config      # re-link new
```

---

## Optional: Project-Scoped .env

The wrapper supports **project-level .env files** that override global tokens.

### 1. Set Up the Wrapper

Stow the bin directory so `dotfiles-opencode-env` is in your PATH:

```sh
stow bin -t ~/.local/bin
```

Then either:
- **Option A:** Create an alias in your shell rc:
  ```sh
  alias opencode='dotfiles-opencode-env'
  ```
- **Option B:** Prepend `~/.local/bin` to PATH and call `dotfiles-opencode-env` directly:
  ```sh
  export PATH="$HOME/.local/bin:$PATH"
  ```

### 2. Create Project .env (Optional)

In any project, create `.opencode/.env` with project-specific overrides:

```sh
mkdir -p .opencode
cp ~/.config/opencode/.env.example .opencode/.env
nano .opencode/.env
```

**Example overrides:**
```sh
# Project-specific tokens
SONARQUBE_URL=https://sonar.mycompany.com
SONARQUBE_TOKEN=sqp_xxxxxxxxxxxx

# Or override global tokens
# GITHUB_PERSONAL_ACCESS_TOKEN=ghp_project_specific_token
```

Add to your project's `.gitignore`:
```sh
echo ".opencode/.env" >> .gitignore
```

### 3. How It Works

When you run `opencode` (via the wrapper):
1. Loads `~/.config/opencode/.env` — global tokens
2. Walks up from `$PWD` to find nearest `.opencode/.env` — project overrides (if exists)
3. `exec`s the real `opencode` binary

Project .env is optional. If you don't create one, global .env is used.

### Debug

```sh
_DOTFILES_OPENCODE_ENV_DEBUG=1 opencode
```

---

## Troubleshooting

### opencode not found

Ensure `~/.local/bin` is in your `$PATH`:

```sh
echo $PATH | grep -q ~/.local/bin && echo "OK" || echo "Add to .bashrc/.zshrc: export PATH=~/.local/bin:$PATH"
```

### Tokens not loading

Check the debug output:
```sh
_DOTFILES_OPENCODE_ENV_DEBUG=1 opencode
```

### Permission denied on stow

Ensure target directory exists:
```sh
mkdir -p ~/.config
```
