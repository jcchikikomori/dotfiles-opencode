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
OPENCODE_ENV_DEBUG=1 opencode
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

## Troubleshooting

### opencode not found

Ensure `~/.local/bin` is in your `$PATH`:

```sh
echo $PATH | grep -q ~/.local/bin && echo "OK" || echo "Add to .bashrc/.zshrc: export PATH=~/.local/bin:$PATH"
```

### Tokens not loading

Check the debug output:
```sh
OPENCODE_ENV_DEBUG=1 opencode
```

### Permission denied on stow

Ensure target directory exists:
```sh
mkdir -p ~/.config
```
